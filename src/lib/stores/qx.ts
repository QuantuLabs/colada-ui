import { writable, derived, get } from 'svelte/store';
import { connection } from '$lib/solana/connection';
import { PublicKey } from '@solana/web3.js';
import { publicKey } from './wallet';

const QX_MINT = new PublicKey(import.meta.env.VITE_QX_MINT || '11111111111111111111111111111111');

export const qxBalance = writable<bigint>(0n);
export const qxStaked = writable<bigint>(0n);

export interface FeeTier {
	name: string;
	discount: number;
	minBalance: bigint;
	color: string;
}

export const FEE_TIERS: FeeTier[] = [
	{ name: 'Base', discount: 0, minBalance: 0n, color: '#64748b' },
	{ name: 'Holder', discount: 5, minBalance: 1n, color: '#8b5cf6' },
	{ name: 'Silver', discount: 10, minBalance: 1_000_000_000_000n, color: '#94a3b8' },
	{ name: 'Gold', discount: 20, minBalance: 10_000_000_000_000n, color: '#eab308' },
	{ name: 'Diamond', discount: 30, minBalance: 100_000_000_000_000n, color: '#06b6d4' }
];

export const currentTier = derived(qxBalance, ($bal) => {
	for (let i = FEE_TIERS.length - 1; i >= 0; i--) {
		if ($bal >= FEE_TIERS[i].minBalance) return FEE_TIERS[i];
	}
	return FEE_TIERS[0];
});

export const nextTier = derived(qxBalance, ($bal) => {
	for (const tier of FEE_TIERS) {
		if ($bal < tier.minBalance) return tier;
	}
	return null;
});

export async function fetchQxBalance() {
	const pk = get(publicKey);
	if (!pk || QX_MINT.equals(PublicKey.default)) {
		qxBalance.set(0n);
		return;
	}
	try {
		const resp = await connection.getTokenAccountsByOwner(pk, { mint: QX_MINT });
		let total = 0n;
		for (const { account } of resp.value) {
			const data = Buffer.from(account.data);
			if (data.length >= 72) {
				total += data.readBigUInt64LE(64);
			}
		}
		qxBalance.set(total);
	} catch {
		qxBalance.set(0n);
	}
}
