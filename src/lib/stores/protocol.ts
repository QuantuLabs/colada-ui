import { writable } from 'svelte/store';
import { connection } from '$lib/solana/connection';
import { WRAPPER_PROGRAM_ID } from '$lib/solana/sdk';
import { getConfigPda } from '$lib/solana/sdk/pda';
import { parsePercolatorConfig } from '$lib/solana/sdk/accounts';
import type { PercolatorConfig } from '$lib/solana/sdk/types';

export const configStore = writable<PercolatorConfig | null>(null);
export const configLoading = writable(false);
export const configError = writable<string | null>(null);

let pollInterval: ReturnType<typeof setInterval> | null = null;

export async function fetchConfig() {
	configLoading.set(true);
	configError.set(null);
	try {
		const [configPda] = getConfigPda(WRAPPER_PROGRAM_ID);
		const info = await connection.getAccountInfo(configPda);
		if (!info) {
			configStore.set(null);
			configError.set('Config not initialized');
			return;
		}
		const config = parsePercolatorConfig(Buffer.from(info.data));
		configStore.set(config);
	} catch (e: any) {
		configError.set(e.message);
	} finally {
		configLoading.set(false);
	}
}

export function startPolling(intervalMs = 10_000) {
	fetchConfig();
	if (pollInterval) clearInterval(pollInterval);
	pollInterval = setInterval(fetchConfig, intervalMs);
}

export function stopPolling() {
	if (pollInterval) {
		clearInterval(pollInterval);
		pollInterval = null;
	}
}
