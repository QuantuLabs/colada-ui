import { Connection, clusterApiUrl } from '@solana/web3.js';

const RPC_URL = import.meta.env.VITE_RPC_URL || clusterApiUrl('devnet');

export const connection = new Connection(RPC_URL, 'confirmed');

export function getExplorerUrl(signature: string): string {
	const cluster = RPC_URL.includes('localhost') || RPC_URL.includes('127.0.0.1') ? 'custom&customUrl=http://localhost:8899' : 'devnet';
	return `https://explorer.solana.com/tx/${signature}?cluster=${cluster}`;
}
