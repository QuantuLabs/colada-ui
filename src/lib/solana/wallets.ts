import type { Adapter } from '@solana/wallet-adapter-base';

export function getWallets(): Adapter[] {
	// Wallet adapters auto-detect installed wallets in browser
	return [];
}
