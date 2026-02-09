import { PublicKey } from "@solana/web3.js";
import type {
  PercolatorConfig,
  TraderAccount,
  FeeVault,
  MatcherState,
} from "./types";

// ── PercolatorConfig #[repr(C)] layout ──
// discriminator:          [u8; 8]     offset 0
// admin:                  [u8; 32]    offset 8
// authority:              [u8; 32]    offset 40
// authority_bump:         u8          offset 72
// registry_program:       [u8; 32]    offset 73
// collection:             [u8; 32]    offset 105
// wsol_mint:              [u8; 32]    offset 137
// (1 byte padding for u16 align)
// default_fee_rate_bps:   u16         offset 170
// (4 bytes padding for u64 align)
// registration_fee:       u64         offset 176
// min_pnl_for_fee:        u64         offset 184
// claim_cooldown_slots:   u64         offset 192
// is_paused:              u8          offset 200
// (3 bytes padding for u32 align)
// total_traders:          u32         offset 204
// bump:                   u8          offset 208

const CONFIG_SIZE = 216; // struct size with trailing alignment padding (align 8)

/** Parse a PercolatorConfig from raw account data. */
export function parsePercolatorConfig(data: Buffer): PercolatorConfig {
  if (data.length < CONFIG_SIZE) {
    throw new Error(
      `PercolatorConfig data too short: ${data.length} < ${CONFIG_SIZE}`
    );
  }
  const dv = new DataView(data.buffer, data.byteOffset, data.byteLength);
  return {
    discriminator: data.slice(0, 8).toString("ascii"),
    admin: new PublicKey(data.slice(8, 40)),
    authority: new PublicKey(data.slice(40, 72)),
    authorityBump: data[72],
    registryProgram: new PublicKey(data.slice(73, 105)),
    collection: new PublicKey(data.slice(105, 137)),
    wsolMint: new PublicKey(data.slice(137, 169)),
    defaultFeeRateBps: dv.getUint16(170, true),
    registrationFee: dv.getBigUint64(176, true),
    minPnlForFee: dv.getBigUint64(184, true),
    claimCooldownSlots: dv.getBigUint64(192, true),
    isPaused: data[200] !== 0,
    totalTraders: dv.getUint32(204, true),
    bump: data[208],
  };
}

// ── TraderAccount #[repr(C)] layout ──
// discriminator:          [u8; 8]     offset 0
// trader_wallet:          [u8; 32]    offset 8
// agent_nft:              [u8; 32]    offset 40
// registered_at:          i64         offset 72
// fee_rate_bps:           u16         offset 80
// (6 bytes padding for i64 align)
// total_pnl:              i64         offset 88
// total_fees_generated:   u64         offset 96
// deposited_balance:      u64         offset 104
// trade_count:            u32         offset 112
// (4 bytes padding for u64 align)
// last_owner_change_slot: u64         offset 120
// is_active:              u8          offset 128
// bump:                   u8          offset 129

const TRADER_SIZE = 136; // struct size with trailing alignment padding (align 8)

/** Parse a TraderAccount from raw account data. */
export function parseTraderAccount(data: Buffer): TraderAccount {
  if (data.length < TRADER_SIZE) {
    throw new Error(
      `TraderAccount data too short: ${data.length} < ${TRADER_SIZE}`
    );
  }
  const dv = new DataView(data.buffer, data.byteOffset, data.byteLength);
  return {
    discriminator: data.slice(0, 8).toString("ascii"),
    traderWallet: new PublicKey(data.slice(8, 40)),
    agentNft: new PublicKey(data.slice(40, 72)),
    registeredAt: dv.getBigInt64(72, true),
    feeRateBps: dv.getUint16(80, true),
    totalPnl: dv.getBigInt64(88, true),
    totalFeesGenerated: dv.getBigUint64(96, true),
    depositedBalance: dv.getBigUint64(104, true),
    tradeCount: dv.getUint32(112, true),
    lastOwnerChangeSlot: dv.getBigUint64(120, true),
    isActive: data[128] !== 0,
    bump: data[129],
  };
}

// ── FeeVault #[repr(C)] layout ──
// discriminator:   [u8; 8]     offset 0
// agent_nft:       [u8; 32]    offset 8
// pending_fees:    u64         offset 40
// total_claimed:   u64         offset 48
// last_claim_slot: u64         offset 56
// bump:            u8          offset 64

const FEE_VAULT_SIZE = 72; // struct size with trailing alignment padding (align 8)

/** Parse a FeeVault from raw account data. */
export function parseFeeVault(data: Buffer): FeeVault {
  if (data.length < FEE_VAULT_SIZE) {
    throw new Error(
      `FeeVault data too short: ${data.length} < ${FEE_VAULT_SIZE}`
    );
  }
  const dv = new DataView(data.buffer, data.byteOffset, data.byteLength);
  return {
    discriminator: data.slice(0, 8).toString("ascii"),
    agentNft: new PublicKey(data.slice(8, 40)),
    pendingFees: dv.getBigUint64(40, true),
    totalClaimed: dv.getBigUint64(48, true),
    lastClaimSlot: dv.getBigUint64(56, true),
    bump: data[64],
  };
}

// ── MatcherState #[repr(C)] layout ──
// discriminator: [u8; 8]     offset 0
// authority:     [u8; 32]    offset 8
// base_price:    u64         offset 40
// liquidity:     u64         offset 48
// spread_bps:    u16         offset 56
// is_active:     u8          offset 58
// bump:          u8          offset 59

const MATCHER_STATE_SIZE = 64; // struct size with trailing alignment padding (align 8)

/** Parse a MatcherState from raw account data. */
export function parseMatcherState(data: Buffer): MatcherState {
  if (data.length < MATCHER_STATE_SIZE) {
    throw new Error(
      `MatcherState data too short: ${data.length} < ${MATCHER_STATE_SIZE}`
    );
  }
  const dv = new DataView(data.buffer, data.byteOffset, data.byteLength);
  return {
    discriminator: data.slice(0, 8).toString("ascii"),
    authority: new PublicKey(data.slice(8, 40)),
    basePrice: dv.getBigUint64(40, true),
    liquidity: dv.getBigUint64(48, true),
    spreadBps: dv.getUint16(56, true),
    isActive: data[58] !== 0,
    bump: data[59],
  };
}
