import { writable, derived, get } from 'svelte/store';
import { connection } from '$lib/solana/connection';
import { WRAPPER_PROGRAM_ID } from '$lib/solana/sdk';
import { getTraderAccountPda, getFeeVaultPda } from '$lib/solana/sdk/pda';
import { parseTraderAccount, parseFeeVault } from '$lib/solana/sdk/accounts';
import type { TraderAccount, FeeVault } from '$lib/solana/sdk/types';
import { publicKey } from './wallet';

export const traderStore = writable<TraderAccount | null>(null);
export const feeVaultStore = writable<FeeVault | null>(null);
export const traderLoading = writable(false);
export const traderError = writable<string | null>(null);

let pollInterval: ReturnType<typeof setInterval> | null = null;

export async function fetchTrader() {
	const pk = get(publicKey);
	if (!pk) {
		traderStore.set(null);
		feeVaultStore.set(null);
		return;
	}
	traderLoading.set(true);
	traderError.set(null);
	try {
		const [traderPda] = getTraderAccountPda(WRAPPER_PROGRAM_ID, pk);
		const info = await connection.getAccountInfo(traderPda);
		if (!info) {
			traderStore.set(null);
			feeVaultStore.set(null);
			return;
		}
		const trader = parseTraderAccount(Buffer.from(info.data));
		traderStore.set(trader);

		const [feeVaultPda] = getFeeVaultPda(WRAPPER_PROGRAM_ID, trader.agentNft);
		const fvInfo = await connection.getAccountInfo(feeVaultPda);
		if (fvInfo) {
			feeVaultStore.set(parseFeeVault(Buffer.from(fvInfo.data)));
		}
	} catch (e: any) {
		traderError.set(e.message);
	} finally {
		traderLoading.set(false);
	}
}

export const isRegistered = derived(traderStore, ($t) => $t !== null);

export function startTraderPolling(intervalMs = 10_000) {
	fetchTrader();
	if (pollInterval) clearInterval(pollInterval);
	pollInterval = setInterval(fetchTrader, intervalMs);
}

export function stopTraderPolling() {
	if (pollInterval) {
		clearInterval(pollInterval);
		pollInterval = null;
	}
}
