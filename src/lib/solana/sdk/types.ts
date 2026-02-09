import { PublicKey } from "@solana/web3.js";

// ── Wrapper Instruction Params ──

export interface InitializeParams {
  admin: PublicKey;
  configPda: PublicKey;
  authorityPda: PublicKey;
  collection: PublicKey;
  wsolMint: PublicKey;
  registryProgram: PublicKey;
  defaultFeeRateBps: number;
  registrationFee: bigint;
  minPnlForFee: bigint;
  claimCooldownSlots: bigint;
}

export interface RegisterTraderParams {
  trader: PublicKey;
  configPda: PublicKey;
  traderAccountPda: PublicKey;
  feeVaultPda: PublicKey;
  feeVaultToken: PublicKey;
  wsolMint: PublicKey;
  agentNft: PublicKey;
  collection: PublicKey;
}

export interface SettlePositionParams {
  admin: PublicKey;
  authorityPda: PublicKey;
  configPda: PublicKey;
  traderAccountPda: PublicKey;
  feeVaultPda: PublicKey;
  feeVaultToken: PublicKey;
  settlementPool: PublicKey;
  wsolMint: PublicKey;
  agentNft: PublicKey;
  collection: PublicKey;
  pnl: bigint;
}

export interface ClaimFeesParams {
  holder: PublicKey;
  feeVaultPda: PublicKey;
  feeVaultToken: PublicKey;
  agentNft: PublicKey;
  holderToken: PublicKey;
  wsolMint: PublicKey;
  configPda: PublicKey;
}

export interface UpdateConfigParams {
  admin: PublicKey;
  configPda: PublicKey;
  updates: {
    defaultFeeRateBps?: number;
    registrationFee?: bigint;
    minPnlForFee?: bigint;
    claimCooldownSlots?: bigint;
    newAdmin?: PublicKey;
  };
}

export interface UpdateFeeRateParams {
  trader: PublicKey;
  configPda: PublicKey;
  traderAccountPda: PublicKey;
  newRateBps: number;
}

export interface PauseParams {
  admin: PublicKey;
  configPda: PublicKey;
}

export interface UnpauseParams {
  admin: PublicKey;
  configPda: PublicKey;
}

export interface DeactivateTraderParams {
  admin: PublicKey;
  configPda: PublicKey;
  traderAccountPda: PublicKey;
}

export interface DepositParams {
  trader: PublicKey;
  configPda: PublicKey;
  traderAccountPda: PublicKey;
  vaultToken: PublicKey;
  traderToken: PublicKey;
  amount: bigint;
}

export interface WithdrawParams {
  trader: PublicKey;
  configPda: PublicKey;
  traderAccountPda: PublicKey;
  authorityPda: PublicKey;
  vaultToken: PublicKey;
  traderToken: PublicKey;
  amount: bigint;
}

export interface ExecuteTradeParams {
  trader: PublicKey;
  configPda: PublicKey;
  traderAccountPda: PublicKey;
  matcherState: PublicKey;
  matcherProgram: PublicKey;
  size: bigint;
}

export interface KeeperCrankParams {
  keeper: PublicKey;
  configPda: PublicKey;
}

export interface CloseTraderParams {
  trader: PublicKey;
  configPda: PublicKey;
  traderAccountPda: PublicKey;
  feeVaultPda: PublicKey;
  feeVaultToken: PublicKey;
  destination: PublicKey;
  destinationToken: PublicKey;
}

// ── Matcher Instruction Params ──

export interface MatcherInitializeParams {
  admin: PublicKey;
  matcherStatePda: PublicKey;
  basePrice: bigint;
  liquidity: bigint;
  spreadBps: number;
}

export interface ExecuteMatchParams {
  user: PublicKey;
  matcherStatePda: PublicKey;
  size: bigint;
}

export interface UpdatePriceParams {
  admin: PublicKey;
  matcherStatePda: PublicKey;
  newPrice: bigint;
}

// ── Account Structures ──

export interface PercolatorConfig {
  discriminator: string;
  admin: PublicKey;
  authority: PublicKey;
  authorityBump: number;
  registryProgram: PublicKey;
  collection: PublicKey;
  wsolMint: PublicKey;
  defaultFeeRateBps: number;
  registrationFee: bigint;
  minPnlForFee: bigint;
  claimCooldownSlots: bigint;
  isPaused: boolean;
  totalTraders: number;
  bump: number;
}

export interface TraderAccount {
  discriminator: string;
  traderWallet: PublicKey;
  agentNft: PublicKey;
  registeredAt: bigint;
  feeRateBps: number;
  totalPnl: bigint;
  totalFeesGenerated: bigint;
  depositedBalance: bigint;
  tradeCount: number;
  lastOwnerChangeSlot: bigint;
  isActive: boolean;
  bump: number;
}

export interface FeeVault {
  discriminator: string;
  agentNft: PublicKey;
  pendingFees: bigint;
  totalClaimed: bigint;
  lastClaimSlot: bigint;
  bump: number;
}

export interface MatcherState {
  discriminator: string;
  authority: PublicKey;
  basePrice: bigint;
  liquidity: bigint;
  spreadBps: number;
  isActive: boolean;
  bump: number;
}
