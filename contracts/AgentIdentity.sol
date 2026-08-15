// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/// @notice Registry of AI agent identities. An agent is active until its
/// owner revokes it. `TrustGate` reads this registry but never writes to it.
contract AgentIdentity {
    struct Agent {
        address owner;
        bool active;
    }

    error NotAgentOwner();

    event AgentRegistered(uint256 indexed agentId, address indexed owner);
    event AgentRevoked(uint256 indexed agentId);

    mapping(uint256 => Agent) public agents;

    uint256 private _nextAgentId = 1;

    function registerAgent() external returns (uint256 agentId) {
        agentId = _nextAgentId++;
        agents[agentId] = Agent({owner: msg.sender, active: true});
        emit AgentRegistered(agentId, msg.sender);
    }

    /// @dev Returns false both for a revoked agent and for an agentId that
    /// was never registered (the mapping's zero-value default is inactive).
    /// TrustGate treats both cases identically under one AGENT_REVOKED branch.
    function isActive(uint256 agentId) external view returns (bool) {
        return agents[agentId].active;
    }

    function revokeAgent(uint256 agentId) external {
        if (agents[agentId].owner != msg.sender) revert NotAgentOwner();
        agents[agentId].active = false;
        emit AgentRevoked(agentId);
    }
}
