// Hand-copied from artifacts/contracts/<Name>.sol/<Name>.json after `npx hardhat compile`
// in the repo root. Re-copy if a contract's public interface changes.

export const AGENT_IDENTITY_ABI = [
  "error NotAgentOwner()",
  "event AgentRegistered(uint256 indexed agentId, address indexed owner)",
  "event AgentRevoked(uint256 indexed agentId)",
  "function agents(uint256) view returns (address owner, bool active)",
  "function isActive(uint256 agentId) view returns (bool)",
  "function registerAgent() returns (uint256 agentId)",
  "function revokeAgent(uint256 agentId)",
] as const;

export const ACTION_LEDGER_ABI = [
  "error ECDSAInvalidSignature()",
  "error ECDSAInvalidSignatureLength(uint256 length)",
  "error ECDSAInvalidSignatureS(bytes32 s)",
  "error InvalidCounterparty()",
  "error InvalidCounterpartySignature()",
  "error NotAgentOwner()",
  "error ReceiptAlreadyResolved()",
  "error ReceiptNotFound()",
  "event OutcomeLinked(uint256 indexed receiptId, uint8 status)",
  "event ReceiptCreated(uint256 indexed receiptId, uint256 indexed agentId, address indexed counterparty)",
  "function agentIdentity() view returns (address)",
  "function createReceipt(uint256 agentId, address counterparty) returns (uint256 receiptId)",
  "function getAgentReceipts(uint256 agentId) view returns (uint256[])",
  "function getReceipt(uint256 receiptId) view returns (tuple(uint256 agentId, address counterparty, uint8 status))",
  "function linkOutcome(uint256 receiptId, bool verified, bytes signature)",
] as const;

export const TRUST_GATE_ABI = [
  "event AccessDenied(uint256 indexed agentId, string reason)",
  "event AccessGranted(uint256 indexed agentId, uint256 verifiedCount)",
  "function actionLedger() view returns (address)",
  "function agentIdentity() view returns (address)",
  "function checkAccess(uint256 agentId) returns (bool granted)",
  "function previewAccess(uint256 agentId) view returns (bool wouldGrant, string reason, uint256 verifiedCount, uint256 mismatchCount)",
] as const;
