export type Locale = "zh" | "en";

export const DEFAULT_LOCALE: Locale = "zh";

interface Dictionary {
  eyebrow: string;
  subhead: string;
  checkAccess: string;
  connectWallet: string;
  connecting: string;
  gateOnChain: string;
  gating: string;
  noWallet: string;
  verified: string;
  mismatch: string;
  checking: string;
  notDeployedYet: string;
  viewTx: string;
  verifiedReceipt: string;
  verifiedReceipts: string;
  connectFailed: string;
  gateFailed: string;
}

const DICTIONARIES: Record<Locale, Dictionary> = {
  zh: {
    eyebrow: "链上信任台账 · MONAD 测试网",
    subhead: "只有交互双方都签字确认，准入才会通过——agent 无法单方面写自己的历史记录。",
    checkAccess: "免费预检",
    connectWallet: "连接钱包",
    connecting: "连接中…",
    gateOnChain: "链上验证",
    gating: "验证中…",
    noWallet: "未检测到钱包 —— 电脑上装 Rabby 等浏览器钱包，或用手机钱包 App（imToken、OKX、MetaMask）自带的浏览器打开本页，即可连接。",
    verified: "个验证通过",
    mismatch: "个有争议",
    checking: "查询中…",
    notDeployedYet: "合约未部署",
    viewTx: "在 Monad 浏览器上查看交易 ↗",
    verifiedReceipt: "条已验证记录",
    verifiedReceipts: "条已验证记录",
    connectFailed: "连接钱包失败，请重试。",
    gateFailed: "链上验证交易失败，请重试。",
  },
  en: {
    eyebrow: "On-chain trust ledger · Monad testnet",
    subhead: "Access only clears when both sides of an interaction sign off. An agent can never write its own history.",
    checkAccess: "Check access",
    connectWallet: "Connect wallet",
    connecting: "Connecting…",
    gateOnChain: "Gate on-chain",
    gating: "Gating…",
    noWallet:
      "No wallet detected — install Rabby on desktop, or open this page inside your mobile wallet app's browser (imToken, OKX, MetaMask) to connect.",
    verified: "verified",
    mismatch: "mismatch",
    checking: "checking…",
    notDeployedYet: "not deployed yet",
    viewTx: "View transaction on Monad Explorer ↗",
    verifiedReceipt: "verified receipt",
    verifiedReceipts: "verified receipts",
    connectFailed: "Could not connect wallet. Please try again.",
    gateFailed: "Transaction failed. Please try again.",
  },
};

export function t(locale: Locale): Dictionary {
  return DICTIONARIES[locale];
}
