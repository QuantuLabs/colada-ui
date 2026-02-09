import { Keypair, Transaction, VersionedTransaction } from '@solana/web3.js';
import type { WalletAdapter } from '$lib/stores/wallet';
import { connection } from './connection';

export class DevWallet implements WalletAdapter {
	name = 'Dev Wallet';
	icon = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="%23f97316"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/></svg>';
	publicKey;
	connected = false;

	private keypair: Keypair;

	constructor(keypair?: Keypair) {
		this.keypair = keypair ?? Keypair.generate();
		this.publicKey = this.keypair.publicKey;
	}

	async connect(): Promise<void> {
		const sig = await connection.requestAirdrop(this.keypair.publicKey, 10_000_000_000);
		await connection.confirmTransaction(sig, 'confirmed');
		this.connected = true;
		this.publicKey = this.keypair.publicKey;
	}

	async disconnect(): Promise<void> {
		this.connected = false;
	}

	async signTransaction<T extends Transaction | VersionedTransaction>(tx: T): Promise<T> {
		if (tx instanceof Transaction) {
			tx.partialSign(this.keypair);
		} else {
			tx.sign([this.keypair]);
		}
		return tx;
	}

	async signAllTransactions<T extends Transaction | VersionedTransaction>(txs: T[]): Promise<T[]> {
		for (const tx of txs) {
			await this.signTransaction(tx);
		}
		return txs;
	}
}
