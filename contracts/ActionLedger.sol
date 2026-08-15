// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {ECDSA} from "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";
import {MessageHashUtils} from "@openzeppelin/contracts/utils/cryptography/MessageHashUtils.sol";
import {AgentIdentity} from "./AgentIdentity.sol";

/// @notice Bilaterally-signed history of agent interactions (KTD1). A receipt
/// only reaches VERIFIED or MISMATCH when the registered counterparty signs
/// off on it off-chain — the agent alone can never write its own history.
contract ActionLedger {
    enum Status {
        CREATED,
        VERIFIED,
        MISMATCH
    }

    struct Receipt {
        uint256 agentId;
        address counterparty;
        Status status;
    }

    error ReceiptNotFound();
    error ReceiptAlreadyResolved();
    error InvalidCounterpartySignature();
    error NotAgentOwner();
    error InvalidCounterparty();

    event ReceiptCreated(uint256 indexed receiptId, uint256 indexed agentId, address indexed counterparty);
    event OutcomeLinked(uint256 indexed receiptId, Status status);

    AgentIdentity public immutable agentIdentity;

    mapping(uint256 => Receipt) private _receipts;
    mapping(uint256 => uint256[]) private _agentReceiptIds;

    uint256 private _nextReceiptId = 1;

    constructor(address agentIdentity_) {
        agentIdentity = AgentIdentity(agentIdentity_);
    }

    /// @dev Only the agent's registered owner may create a receipt against
    /// their own agentId, and the counterparty can never be the caller
    /// itself — otherwise a third party could permanently blacklist another
    /// agent with a self-signed MISMATCH, or an agent could self-attest a
    /// fraudulent VERIFIED, both defeating KTD1.
    function createReceipt(uint256 agentId, address counterparty) external returns (uint256 receiptId) {
        (address owner, ) = agentIdentity.agents(agentId);
        if (owner != msg.sender) revert NotAgentOwner();
        if (counterparty == msg.sender) revert InvalidCounterparty();

        receiptId = _nextReceiptId++;
        _receipts[receiptId] = Receipt({agentId: agentId, counterparty: counterparty, status: Status.CREATED});
        _agentReceiptIds[agentId].push(receiptId);
        emit ReceiptCreated(receiptId, agentId, counterparty);
    }

    /// @dev `signature` must recover, over `(chainid, address(this), receiptId,
    /// verified)`, to the counterparty address recorded on the receipt at
    /// creation time. Binding to the chain and this contract stops a
    /// signature harvested from one deployment (a redeploy, a local run, a
    /// second chain) from resolving a same-numbered receipt elsewhere. A
    /// receipt can only be resolved once — a second call always reverts,
    /// whether or not the second `verified` value agrees with the first.
    function linkOutcome(uint256 receiptId, bool verified, bytes calldata signature) external {
        if (receiptId == 0 || receiptId >= _nextReceiptId) revert ReceiptNotFound();

        Receipt storage receipt = _receipts[receiptId];
        if (receipt.status != Status.CREATED) revert ReceiptAlreadyResolved();

        bytes32 digest = MessageHashUtils.toEthSignedMessageHash(
            keccak256(abi.encodePacked(block.chainid, address(this), receiptId, verified))
        );
        address signer = ECDSA.recoverCalldata(digest, signature);
        if (signer != receipt.counterparty) revert InvalidCounterpartySignature();

        receipt.status = verified ? Status.VERIFIED : Status.MISMATCH;
        emit OutcomeLinked(receiptId, receipt.status);
    }

    function getAgentReceipts(uint256 agentId) external view returns (uint256[] memory) {
        return _agentReceiptIds[agentId];
    }

    function getReceipt(uint256 receiptId) external view returns (Receipt memory) {
        return _receipts[receiptId];
    }
}
