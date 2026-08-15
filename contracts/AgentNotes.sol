// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/// @notice On-chain, human-readable summary for an agentId. Deliberately a
/// separate contract from AgentIdentity/ActionLedger/TrustGate so the
/// already-deployed, already-tested access-control logic (KTD1-KTD4) never
/// needs to change — this only adds a real on-chain string next to an
/// agentId that anyone can read back and compare against what the UI shows,
/// instead of the UI inventing a description client-side.
contract AgentNotes {
    address public immutable owner;
    mapping(uint256 => string) private _notes;

    error NotOwner();

    event NoteSet(uint256 indexed agentId, string note);

    constructor() {
        owner = msg.sender;
    }

    function setNote(uint256 agentId, string calldata note) external {
        if (msg.sender != owner) revert NotOwner();
        _notes[agentId] = note;
        emit NoteSet(agentId, note);
    }

    function noteOf(uint256 agentId) external view returns (string memory) {
        return _notes[agentId];
    }
}
