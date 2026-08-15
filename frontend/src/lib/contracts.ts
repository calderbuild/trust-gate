import { Contract, JsonRpcProvider, type Signer } from "ethers";
import { AGENT_NOTES_ABI, TRUST_GATE_ABI } from "./abis";
import { CONTRACT_ADDRESSES, MONAD_TESTNET } from "./addresses";

export interface PreviewAccessResult {
  wouldGrant: boolean;
  reason: string;
  verifiedCount: bigint;
  mismatchCount: bigint;
}

export interface CheckAccessResult extends PreviewAccessResult {
  txHash: string;
}

const readProvider = new JsonRpcProvider(MONAD_TESTNET.rpcUrl, MONAD_TESTNET.chainId);

function readOnlyTrustGate(): Contract {
  return new Contract(CONTRACT_ADDRESSES.TrustGate, TRUST_GATE_ABI, readProvider);
}

function signerTrustGate(signer: Signer): Contract {
  return new Contract(CONTRACT_ADDRESSES.TrustGate, TRUST_GATE_ABI, signer);
}

/** Free, read-only preview — no wallet required. Matches KTD3/KTD4: never reverts. */
export async function previewAccess(agentId: bigint): Promise<PreviewAccessResult> {
  const trustGate = readOnlyTrustGate();
  const [wouldGrant, reason, verifiedCount, mismatchCount] = await trustGate.previewAccess(agentId);
  return { wouldGrant, reason, verifiedCount, mismatchCount };
}

/**
 * Sends the real, state-changing checkAccess transaction and reads the
 * verdict back from the AccessGranted/AccessDenied event it emits — the
 * mined receipt is the source of truth, not a separate staticCall snapshot.
 */
export async function checkAccess(signer: Signer, agentId: bigint): Promise<CheckAccessResult> {
  const trustGate = signerTrustGate(signer);
  const tx = await trustGate.checkAccess(agentId);
  const receipt = await tx.wait();

  for (const log of receipt.logs) {
    let parsed;
    try {
      parsed = trustGate.interface.parseLog(log);
    } catch {
      continue;
    }
    if (parsed?.name === "AccessGranted") {
      return {
        wouldGrant: true,
        reason: "GRANTED",
        verifiedCount: parsed.args.verifiedCount,
        mismatchCount: 0n,
        txHash: receipt.hash,
      };
    }
    if (parsed?.name === "AccessDenied") {
      // AccessDenied only carries the reason (cheaper to emit) — pull the
      // real tally from previewAccess, which KTD3 guarantees agrees with
      // the mined transaction, so the UI never shows a fake 0/0 count.
      const { verifiedCount, mismatchCount } = await previewAccess(agentId);
      return {
        wouldGrant: false,
        reason: parsed.args.reason,
        verifiedCount,
        mismatchCount,
        txHash: receipt.hash,
      };
    }
  }

  throw new Error("checkAccess transaction mined without an AccessGranted/AccessDenied event");
}

export function explorerTxUrl(txHash: string): string {
  return `${MONAD_TESTNET.blockExplorerUrl}/tx/${txHash}`;
}

export function explorerContractUrl(): string {
  return `${MONAD_TESTNET.blockExplorerUrl}/address/${CONTRACT_ADDRESSES.TrustGate}`;
}

export function explorerAgentNotesUrl(): string {
  return `${MONAD_TESTNET.blockExplorerUrl}/address/${CONTRACT_ADDRESSES.AgentNotes}`;
}

function readOnlyAgentNotes(): Contract {
  return new Contract(CONTRACT_ADDRESSES.AgentNotes, AGENT_NOTES_ABI, readProvider);
}

/**
 * Reads the agent's one-line description straight from AgentNotes — the
 * same text the UI shows is a real on-chain string keyed by agentId, not a
 * client-side placeholder. `noteOf` returns "" for an unset agentId, which
 * the caller renders as an explicit "no note recorded" state rather than
 * silently falling back to made-up copy.
 */
export async function fetchAgentNote(agentId: bigint): Promise<{ zh: string; en: string }> {
  const agentNotes = readOnlyAgentNotes();
  const raw: string = await agentNotes.noteOf(agentId);
  const [zh, en] = raw.split("|||");
  return { zh: zh ?? "", en: en ?? zh ?? "" };
}
