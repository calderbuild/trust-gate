// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {ECDSA} from "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";
import {MessageHashUtils} from "@openzeppelin/contracts/utils/cryptography/MessageHashUtils.sol";

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

    event ReceiptCreated(uint256 indexed receiptId, uint256 indexed agentId, address indexed counterparty);
    event OutcomeLinked(uint256 indexed receiptId, Status status);

    mapping(uint256 => Receipt) private _receipts;
    mapping(uint256 => uint256[]) private _agentReceiptIds;

    uint256 private _nextReceiptId = 1;

    function createReceipt(uint256 agentId, address counterparty) external returns (uint256 receiptId) {
        receiptId = _nextReceiptId++;
        _receipts[receiptId] = Receipt({agentId: agentId, counterparty: counterparty, status: Status.CREATED});
        _agentReceiptIds[agentId].push(receiptId);
        emit ReceiptCreated(receiptId, agentId, counterparty);
    }

    /// @dev `signature` must recover, over `(receiptId, verified)`, to the
    /// counterparty address recorded on the receipt at creation time. A
    /// receipt can only be resolved once — a second call always reverts,
    /// whether or not the second `verified` value agrees with the first.
    function linkOutcome(uint256 receiptId, bool verified, bytes calldata signature) external {
        if (receiptId == 0 || receiptId >= _nextReceiptId) revert ReceiptNotFound();

        Receipt storage receipt = _receipts[receiptId];
        if (receipt.status != Status.CREATED) revert ReceiptAlreadyResolved();

        bytes32 digest = MessageHashUtils.toEthSignedMessageHash(keccak256(abi.encodePacked(receiptId, verified)));
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
