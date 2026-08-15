// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {AgentIdentity} from "./AgentIdentity.sol";
import {ActionLedger} from "./ActionLedger.sol";

/// @notice Gates access based on an agent's bilaterally-verified on-chain
/// history. Reads AgentIdentity and ActionLedger; never writes to either
/// (KTD2). A denial is a return value and an event, never a revert (KTD4).
contract TrustGate {
    AgentIdentity public immutable agentIdentity;
    ActionLedger public immutable actionLedger;

    event AccessGranted(uint256 indexed agentId, uint256 verifiedCount);
    event AccessDenied(uint256 indexed agentId, string reason);

    constructor(address agentIdentity_, address actionLedger_) {
        agentIdentity = AgentIdentity(agentIdentity_);
        actionLedger = ActionLedger(actionLedger_);
    }

    /// @dev Four-branch policy evaluated in order (KTD5): revoked-or-unknown
    /// agent denies; any MISMATCH receipt denies; zero VERIFIED receipts
    /// denies; otherwise grants. `checkAccess` below shares this exact logic
    /// so the two functions can never disagree.
    function previewAccess(
        uint256 agentId
    ) public view returns (bool wouldGrant, string memory reason, uint256 verifiedCount, uint256 mismatchCount) {
        if (!agentIdentity.isActive(agentId)) {
            return (false, "AGENT_REVOKED", 0, 0);
        }

        uint256[] memory receiptIds = actionLedger.getAgentReceipts(agentId);
        for (uint256 i = 0; i < receiptIds.length; i++) {
            ActionLedger.Status status = actionLedger.getReceipt(receiptIds[i]).status;
            if (status == ActionLedger.Status.VERIFIED) {
                verifiedCount++;
            } else if (status == ActionLedger.Status.MISMATCH) {
                mismatchCount++;
            }
        }

        if (mismatchCount > 0) {
            return (false, "MISMATCH_ON_RECORD", verifiedCount, mismatchCount);
        }
        if (verifiedCount == 0) {
            return (false, "INSUFFICIENT_HISTORY", verifiedCount, mismatchCount);
        }
        return (true, "GRANTED", verifiedCount, mismatchCount);
    }

    function checkAccess(uint256 agentId) external returns (bool granted) {
        (bool wouldGrant, string memory reason, uint256 verifiedCount, ) = previewAccess(agentId);
        if (wouldGrant) {
            emit AccessGranted(agentId, verifiedCount);
        } else {
            emit AccessDenied(agentId, reason);
        }
        return wouldGrant;
    }
}
