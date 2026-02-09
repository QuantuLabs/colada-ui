import { writable, derived } from 'svelte/store';
import type { PublicKey, Transaction, VersionedTransaction } from '@solana/web3.js';

export interface WalletState {
	connected: boolean;
	publicKey: PublicKey | null;
	wallet: WalletAdapter | null;
	connecting: boolean;
}

export interface WalletAdapter {
	name: string;
	icon: string;
	publicKey: PublicKey | null;
	connected: boolean;
	connect(): Promise<void>;
	disconnect(): Promise<void>;
	signTransaction<T extends Transaction | VersionedTransaction>(tx: T): Promise<T>;
	signAllTransactions<T extends Transaction | VersionedTransaction>(txs: T[]): Promise<T[]>;
}

const initial: WalletState = {
	connected: false,
	publicKey: null,
	wallet: null,
	connecting: false
};

export const walletStore = writable<WalletState>(initial);

export const publicKey = derived(walletStore, ($w) => $w.publicKey);
export const connected = derived(walletStore, ($w) => $w.connected);

export async function connectWallet(adapter: WalletAdapter) {
	walletStore.update((s) => ({ ...s, connecting: true }));
	try {
		await adapter.connect();
		walletStore.set({
			connected: true,
			publicKey: adapter.publicKey,
			wallet: adapter,
			connecting: false
		});
	} catch {
		walletStore.update((s) => ({ ...s, connecting: false }));
	}
}

export async function disconnectWallet() {
	walletStore.update((s) => {
		s.wallet?.disconnect();
		return initial;
	});
}
