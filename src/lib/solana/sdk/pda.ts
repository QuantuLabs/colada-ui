import { PublicKey } from "@solana/web3.js";

/**
 * Derive the PercolatorConfig PDA.
 * Seeds: ["percolator_config"]
 */
export function getConfigPda(programId: PublicKey): [PublicKey, number] {
  return PublicKey.findProgramAddressSync(
    [Buffer.from("percolator_config")],
    programId
  );
}

/**
 * Derive the authority PDA used for CPI signing.
 * Seeds: ["percolator_authority"]
 */
export function getAuthorityPda(programId: PublicKey): [PublicKey, number] {
  return PublicKey.findProgramAddressSync(
    [Buffer.from("percolator_authority")],
    programId
  );
}

/**
 * Derive a TraderAccount PDA for a given trader wallet.
 * Seeds: ["trader", trader_wallet]
 */
export function getTraderAccountPda(
  programId: PublicKey,
  traderWallet: PublicKey
): [PublicKey, number] {
  return PublicKey.findProgramAddressSync(
    [Buffer.from("trader"), traderWallet.toBuffer()],
    programId
  );
}

/**
 * Derive a FeeVault PDA for a given agent NFT.
 * Seeds: ["fee_vault", agent_nft]
 */
export function getFeeVaultPda(
  programId: PublicKey,
  agentNft: PublicKey
): [PublicKey, number] {
  return PublicKey.findProgramAddressSync(
    [Buffer.from("fee_vault"), agentNft.toBuffer()],
    programId
  );
}

/**
 * Derive the MatcherState PDA.
 * Seeds: ["matcher_state"]
 */
export function getMatcherStatePda(programId: PublicKey): [PublicKey, number] {
  return PublicKey.findProgramAddressSync(
    [Buffer.from("matcher_state")],
    programId
  );
}
