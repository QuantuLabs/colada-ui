import {
  PublicKey,
  SystemProgram,
  TransactionInstruction,
} from "@solana/web3.js";
import {
  TOKEN_PROGRAM_ID,
  ASSOCIATED_TOKEN_PROGRAM_ID,
} from "@solana/spl-token";
import { WRAPPER_PROGRAM_ID, MATCHER_PROGRAM_ID } from "./constants";
import { encodeU16, encodeU64, encodeI64 } from "./serialization";
import type {
  InitializeParams,
  RegisterTraderParams,
  SettlePositionParams,
  ClaimFeesParams,
  UpdateConfigParams,
  UpdateFeeRateParams,
  PauseParams,
  UnpauseParams,
  DeactivateTraderParams,
  DepositParams,
  WithdrawParams,
  ExecuteTradeParams,
  KeeperCrankParams,
  CloseTraderParams,
  MatcherInitializeParams,
  ExecuteMatchParams,
  UpdatePriceParams,
} from "./types";

// ── Wrapper Instructions (discriminators 0-13) ──

/**
 * Instruction 0: Initialize the percolator protocol config.
 *
 * Accounts: admin(s,w), config_pda(w), authority_pda, collection, wsol_mint, registry_program, system_program
 * Data: [0] + default_fee_rate_bps(u16) + registration_fee(u64) + min_pnl_for_fee(u64) + claim_cooldown_slots(u64)
 */
export function createInitializeIx(params: InitializeParams): TransactionInstruction {
  return new TransactionInstruction({
    programId: WRAPPER_PROGRAM_ID,
    keys: [
      { pubkey: params.admin, isSigner: true, isWritable: true },
      { pubkey: params.configPda, isSigner: false, isWritable: true },
      { pubkey: params.authorityPda, isSigner: false, isWritable: false },
      { pubkey: params.collection, isSigner: false, isWritable: false },
      { pubkey: params.wsolMint, isSigner: false, isWritable: false },
      { pubkey: params.registryProgram, isSigner: false, isWritable: false },
      { pubkey: SystemProgram.programId, isSigner: false, isWritable: false },
    ],
    data: Buffer.concat([
      Buffer.from([0]),
      encodeU16(params.defaultFeeRateBps),
      encodeU64(params.registrationFee),
      encodeU64(params.minPnlForFee),
      encodeU64(params.claimCooldownSlots),
    ]),
  });
}

/**
 * Instruction 1: Register a new trader with an agent NFT.
 *
 * Accounts: trader(s,w), config_pda(w), trader_account_pda(w), fee_vault_pda(w),
 *           fee_vault_token(w), wsol_mint, agent_nft(s), collection,
 *           system_program, token_program, associated_token_program
 * Data: [1] (no additional data)
 */
export function createRegisterTraderIx(params: RegisterTraderParams): TransactionInstruction {
  return new TransactionInstruction({
    programId: WRAPPER_PROGRAM_ID,
    keys: [
      { pubkey: params.trader, isSigner: true, isWritable: true },
      { pubkey: params.configPda, isSigner: false, isWritable: true },
      { pubkey: params.traderAccountPda, isSigner: false, isWritable: true },
      { pubkey: params.feeVaultPda, isSigner: false, isWritable: true },
      { pubkey: params.feeVaultToken, isSigner: false, isWritable: true },
      { pubkey: params.wsolMint, isSigner: false, isWritable: false },
      { pubkey: params.agentNft, isSigner: true, isWritable: false },
      { pubkey: params.collection, isSigner: false, isWritable: false },
      { pubkey: SystemProgram.programId, isSigner: false, isWritable: false },
      { pubkey: TOKEN_PROGRAM_ID, isSigner: false, isWritable: false },
      { pubkey: ASSOCIATED_TOKEN_PROGRAM_ID, isSigner: false, isWritable: false },
    ],
    data: Buffer.from([1]),
  });
}

/**
 * Instruction 2: Settle a position and calculate fees.
 *
 * Accounts: authority_pda, config_pda, trader_account_pda(w), fee_vault_pda(w),
 *           fee_vault_token(w), settlement_pool(w), wsol_mint, agent_nft, collection, token_program
 * Data: [2] + pnl(i64)
 */
export function createSettlePositionIx(params: SettlePositionParams): TransactionInstruction {
  return new TransactionInstruction({
    programId: WRAPPER_PROGRAM_ID,
    keys: [
      { pubkey: params.admin, isSigner: true, isWritable: false },
      { pubkey: params.authorityPda, isSigner: false, isWritable: false },
      { pubkey: params.configPda, isSigner: false, isWritable: false },
      { pubkey: params.traderAccountPda, isSigner: false, isWritable: true },
      { pubkey: params.feeVaultPda, isSigner: false, isWritable: true },
      { pubkey: params.feeVaultToken, isSigner: false, isWritable: true },
      { pubkey: params.settlementPool, isSigner: false, isWritable: true },
      { pubkey: params.wsolMint, isSigner: false, isWritable: false },
      { pubkey: params.agentNft, isSigner: false, isWritable: false },
      { pubkey: params.collection, isSigner: false, isWritable: false },
      { pubkey: TOKEN_PROGRAM_ID, isSigner: false, isWritable: false },
    ],
    data: Buffer.concat([Buffer.from([2]), encodeI64(params.pnl)]),
  });
}

/**
 * Instruction 3: Claim accumulated fees from a fee vault.
 *
 * Accounts: holder(s,w), fee_vault_pda(w), fee_vault_token(w), agent_nft,
 *           holder_token(w), wsol_mint, config_pda, token_program,
 *           associated_token_program, system_program
 * Data: [3] (no additional data)
 */
export function createClaimFeesIx(params: ClaimFeesParams): TransactionInstruction {
  return new TransactionInstruction({
    programId: WRAPPER_PROGRAM_ID,
    keys: [
      { pubkey: params.holder, isSigner: true, isWritable: true },
      { pubkey: params.feeVaultPda, isSigner: false, isWritable: true },
      { pubkey: params.feeVaultToken, isSigner: false, isWritable: true },
      { pubkey: params.agentNft, isSigner: false, isWritable: false },
      { pubkey: params.holderToken, isSigner: false, isWritable: true },
      { pubkey: params.wsolMint, isSigner: false, isWritable: false },
      { pubkey: params.configPda, isSigner: false, isWritable: false },
      { pubkey: TOKEN_PROGRAM_ID, isSigner: false, isWritable: false },
      { pubkey: ASSOCIATED_TOKEN_PROGRAM_ID, isSigner: false, isWritable: false },
      { pubkey: SystemProgram.programId, isSigner: false, isWritable: false },
    ],
    data: Buffer.from([3]),
  });
}

/**
 * Instruction 4: Update protocol config (bitmask-based partial updates).
 *
 * Accounts: admin(s), config_pda(w)
 * Data: [4] + bitmask(u8) + field values in order of set bits
 *   bit 0: default_fee_rate_bps (u16)
 *   bit 1: registration_fee (u64)
 *   bit 2: min_pnl_for_fee (u64)
 *   bit 3: claim_cooldown_slots (u64)
 *   bit 4: new_admin (32 bytes)
 */
export function createUpdateConfigIx(params: UpdateConfigParams): TransactionInstruction {
  const { updates } = params;
  let bitmask = 0;
  const parts: Buffer[] = [];

  if (updates.defaultFeeRateBps !== undefined) {
    bitmask |= 0x01;
    parts.push(encodeU16(updates.defaultFeeRateBps));
  }
  if (updates.registrationFee !== undefined) {
    bitmask |= 0x02;
    parts.push(encodeU64(updates.registrationFee));
  }
  if (updates.minPnlForFee !== undefined) {
    bitmask |= 0x04;
    parts.push(encodeU64(updates.minPnlForFee));
  }
  if (updates.claimCooldownSlots !== undefined) {
    bitmask |= 0x08;
    parts.push(encodeU64(updates.claimCooldownSlots));
  }
  if (updates.newAdmin !== undefined) {
    bitmask |= 0x10;
    parts.push(updates.newAdmin.toBuffer());
  }

  return new TransactionInstruction({
    programId: WRAPPER_PROGRAM_ID,
    keys: [
      { pubkey: params.admin, isSigner: true, isWritable: false },
      { pubkey: params.configPda, isSigner: false, isWritable: true },
    ],
    data: Buffer.concat([Buffer.from([4]), Buffer.from([bitmask]), ...parts]),
  });
}

/**
 * Instruction 5: Trader updates their own fee rate.
 *
 * Accounts: trader(s), config_pda, trader_account_pda(w)
 * Data: [5] + new_rate_bps(u16)
 */
export function createUpdateFeeRateIx(params: UpdateFeeRateParams): TransactionInstruction {
  return new TransactionInstruction({
    programId: WRAPPER_PROGRAM_ID,
    keys: [
      { pubkey: params.trader, isSigner: true, isWritable: false },
      { pubkey: params.configPda, isSigner: false, isWritable: false },
      { pubkey: params.traderAccountPda, isSigner: false, isWritable: true },
    ],
    data: Buffer.concat([Buffer.from([5]), encodeU16(params.newRateBps)]),
  });
}

/**
 * Instruction 6: Admin pauses the protocol.
 *
 * Accounts: admin(s), config_pda(w)
 * Data: [6]
 */
export function createPauseIx(params: PauseParams): TransactionInstruction {
  return new TransactionInstruction({
    programId: WRAPPER_PROGRAM_ID,
    keys: [
      { pubkey: params.admin, isSigner: true, isWritable: false },
      { pubkey: params.configPda, isSigner: false, isWritable: true },
    ],
    data: Buffer.from([6]),
  });
}

/**
 * Instruction 7: Admin unpauses the protocol.
 *
 * Accounts: admin(s), config_pda(w)
 * Data: [7]
 */
export function createUnpauseIx(params: UnpauseParams): TransactionInstruction {
  return new TransactionInstruction({
    programId: WRAPPER_PROGRAM_ID,
    keys: [
      { pubkey: params.admin, isSigner: true, isWritable: false },
      { pubkey: params.configPda, isSigner: false, isWritable: true },
    ],
    data: Buffer.from([7]),
  });
}

/**
 * Instruction 8: Admin deactivates a trader.
 *
 * Accounts: admin(s), config_pda, trader_account_pda(w)
 * Data: [8]
 */
export function createDeactivateTraderIx(params: DeactivateTraderParams): TransactionInstruction {
  return new TransactionInstruction({
    programId: WRAPPER_PROGRAM_ID,
    keys: [
      { pubkey: params.admin, isSigner: true, isWritable: false },
      { pubkey: params.configPda, isSigner: false, isWritable: false },
      { pubkey: params.traderAccountPda, isSigner: false, isWritable: true },
    ],
    data: Buffer.from([8]),
  });
}

/**
 * Instruction 9: Deposit wSOL into the program vault.
 *
 * Accounts: trader(s,w), config_pda, trader_account_pda(w), vault_token(w), trader_token(w), token_program
 * Data: [9] + amount(u64)
 */
export function createDepositIx(params: DepositParams): TransactionInstruction {
  return new TransactionInstruction({
    programId: WRAPPER_PROGRAM_ID,
    keys: [
      { pubkey: params.trader, isSigner: true, isWritable: true },
      { pubkey: params.configPda, isSigner: false, isWritable: false },
      { pubkey: params.traderAccountPda, isSigner: false, isWritable: true },
      { pubkey: params.vaultToken, isSigner: false, isWritable: true },
      { pubkey: params.traderToken, isSigner: false, isWritable: true },
      { pubkey: TOKEN_PROGRAM_ID, isSigner: false, isWritable: false },
    ],
    data: Buffer.concat([Buffer.from([9]), encodeU64(params.amount)]),
  });
}

/**
 * Instruction 10: Withdraw wSOL from the program vault.
 *
 * Accounts: trader(s,w), config_pda, trader_account_pda(w), authority_pda, vault_token(w), trader_token(w), token_program
 * Data: [10] + amount(u64)
 */
export function createWithdrawIx(params: WithdrawParams): TransactionInstruction {
  return new TransactionInstruction({
    programId: WRAPPER_PROGRAM_ID,
    keys: [
      { pubkey: params.trader, isSigner: true, isWritable: true },
      { pubkey: params.configPda, isSigner: false, isWritable: false },
      { pubkey: params.traderAccountPda, isSigner: false, isWritable: true },
      { pubkey: params.authorityPda, isSigner: false, isWritable: false },
      { pubkey: params.vaultToken, isSigner: false, isWritable: true },
      { pubkey: params.traderToken, isSigner: false, isWritable: true },
      { pubkey: TOKEN_PROGRAM_ID, isSigner: false, isWritable: false },
    ],
    data: Buffer.concat([Buffer.from([10]), encodeU64(params.amount)]),
  });
}

/**
 * Instruction 11: Execute a trade via the matcher program.
 *
 * Accounts: trader(s), config_pda, trader_account_pda(w), matcher_state, matcher_program
 * Data: [11] + size(i64)
 */
export function createExecuteTradeIx(params: ExecuteTradeParams): TransactionInstruction {
  return new TransactionInstruction({
    programId: WRAPPER_PROGRAM_ID,
    keys: [
      { pubkey: params.trader, isSigner: true, isWritable: false },
      { pubkey: params.configPda, isSigner: false, isWritable: false },
      { pubkey: params.traderAccountPda, isSigner: false, isWritable: true },
      { pubkey: params.matcherState, isSigner: false, isWritable: false },
      { pubkey: params.matcherProgram, isSigner: false, isWritable: false },
    ],
    data: Buffer.concat([Buffer.from([11]), encodeI64(params.size)]),
  });
}

/**
 * Instruction 12: Permissionless keeper crank.
 *
 * Accounts: keeper(s), config_pda
 * Data: [12]
 */
export function createKeeperCrankIx(params: KeeperCrankParams): TransactionInstruction {
  return new TransactionInstruction({
    programId: WRAPPER_PROGRAM_ID,
    keys: [
      { pubkey: params.keeper, isSigner: true, isWritable: false },
      { pubkey: params.configPda, isSigner: false, isWritable: false },
    ],
    data: Buffer.from([12]),
  });
}

/**
 * Instruction 13: Close trader account and fee vault, reclaim rent.
 *
 * Accounts: trader(s,w), config_pda, trader_account_pda(w), fee_vault_pda(w), fee_vault_token(w), destination(s,w), destination_token(w), token_program
 * Data: [13]
 */
export function createCloseTraderIx(params: CloseTraderParams): TransactionInstruction {
  return new TransactionInstruction({
    programId: WRAPPER_PROGRAM_ID,
    keys: [
      { pubkey: params.trader, isSigner: true, isWritable: true },
      { pubkey: params.configPda, isSigner: false, isWritable: true },
      { pubkey: params.traderAccountPda, isSigner: false, isWritable: true },
      { pubkey: params.feeVaultPda, isSigner: false, isWritable: true },
      { pubkey: params.feeVaultToken, isSigner: false, isWritable: true },
      { pubkey: params.destination, isSigner: true, isWritable: true },
      { pubkey: params.destinationToken, isSigner: false, isWritable: true },
      { pubkey: TOKEN_PROGRAM_ID, isSigner: false, isWritable: false },
    ],
    data: Buffer.from([13]),
  });
}

// ── Matcher Instructions (discriminators 0-2) ──

/**
 * Matcher Instruction 0: Initialize matcher state.
 *
 * Accounts: admin(s,w), matcher_state_pda(w), system_program
 * Data: [0] + base_price(u64) + liquidity(u64) + spread_bps(u16)
 */
export function createMatcherInitializeIx(params: MatcherInitializeParams): TransactionInstruction {
  return new TransactionInstruction({
    programId: MATCHER_PROGRAM_ID,
    keys: [
      { pubkey: params.admin, isSigner: true, isWritable: true },
      { pubkey: params.matcherStatePda, isSigner: false, isWritable: true },
      { pubkey: SystemProgram.programId, isSigner: false, isWritable: false },
    ],
    data: Buffer.concat([
      Buffer.from([0]),
      encodeU64(params.basePrice),
      encodeU64(params.liquidity),
      encodeU16(params.spreadBps),
    ]),
  });
}

/**
 * Matcher Instruction 1: Execute a match (buy if size > 0, sell if size < 0).
 *
 * Accounts: user(s), matcher_state_pda
 * Data: [1] + size(i64)
 */
export function createExecuteMatchIx(params: ExecuteMatchParams): TransactionInstruction {
  return new TransactionInstruction({
    programId: MATCHER_PROGRAM_ID,
    keys: [
      { pubkey: params.user, isSigner: true, isWritable: false },
      { pubkey: params.matcherStatePda, isSigner: false, isWritable: false },
    ],
    data: Buffer.concat([Buffer.from([1]), encodeI64(params.size)]),
  });
}

/**
 * Matcher Instruction 2: Authority updates the base price.
 *
 * Accounts: admin(s), matcher_state_pda(w)
 * Data: [2] + new_price(u64)
 */
export function createUpdatePriceIx(params: UpdatePriceParams): TransactionInstruction {
  return new TransactionInstruction({
    programId: MATCHER_PROGRAM_ID,
    keys: [
      { pubkey: params.admin, isSigner: true, isWritable: false },
      { pubkey: params.matcherStatePda, isSigner: false, isWritable: true },
    ],
    data: Buffer.concat([Buffer.from([2]), encodeU64(params.newPrice)]),
  });
}
