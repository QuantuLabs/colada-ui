import { writable, get } from 'svelte/store';
import { connection } from '$lib/solana/connection';
import { MATCHER_PROGRAM_ID } from '$lib/solana/sdk';
import { getMatcherStatePda } from '$lib/solana/sdk/pda';
import { parseMatcherState } from '$lib/solana/sdk/accounts';
import type { MatcherState } from '$lib/solana/sdk/types';

export const matcherStore = writable<MatcherState | null>(null);
export const priceHistory = writable<{ time: number; value: number }[]>([]);

let pollInterval: ReturnType<typeof setInterval> | null = null;

export async function fetchMatcher() {
	try {
		const [matcherPda] = getMatcherStatePda(MATCHER_PROGRAM_ID);
		const info = await connection.getAccountInfo(matcherPda);
		if (!info) return;
		const state = parseMatcherState(Buffer.from(info.data));
		matcherStore.set(state);

		const price = Number(state.basePrice) / 1e9;
		const now = Math.floor(Date.now() / 1000);
		priceHistory.update((h) => {
			const next = [...h, { time: now, value: price }];
			if (next.length > 500) next.shift();
			return next;
		});
	} catch {
		// silent
	}
}

export function startPricePolling(intervalMs = 5_000) {
	fetchMatcher();
	if (pollInterval) clearInterval(pollInterval);
	pollInterval = setInterval(fetchMatcher, intervalMs);
}

export function stopPricePolling() {
	if (pollInterval) {
		clearInterval(pollInterval);
		pollInterval = null;
	}
}
