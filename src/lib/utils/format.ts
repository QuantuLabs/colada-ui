const LAMPORTS_PER_SOL = 1_000_000_000n;

export function lamportsToSol(lamports: bigint): number {
	return Number(lamports) / 1e9;
}

export function solToLamports(sol: number): bigint {
	return BigInt(Math.round(sol * 1e9));
}

export function formatSol(lamports: bigint, decimals = 4): string {
	const sol = lamportsToSol(lamports);
	return sol.toFixed(decimals);
}

export function formatBps(bps: number): string {
	return `${(bps / 100).toFixed(2)}%`;
}

export function formatPnl(pnl: bigint): string {
	const sol = lamportsToSol(pnl);
	const sign = sol >= 0 ? '+' : '';
	return `${sign}${sol.toFixed(4)} SOL`;
}

export function formatPrice(lamports: bigint): string {
	const sol = lamportsToSol(lamports);
	if (sol >= 1) return sol.toFixed(2);
	if (sol >= 0.01) return sol.toFixed(4);
	return sol.toFixed(6);
}

export function shortenAddress(addr: string, chars = 4): string {
	return `${addr.slice(0, chars)}...${addr.slice(-chars)}`;
}

export function timeAgo(timestamp: bigint): string {
	const now = Date.now() / 1000;
	const diff = now - Number(timestamp);
	if (diff < 60) return 'just now';
	if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
	if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
	return `${Math.floor(diff / 86400)}d ago`;
}

export function formatNumber(n: number, decimals = 2): string {
	if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(decimals)}M`;
	if (n >= 1_000) return `${(n / 1_000).toFixed(decimals)}K`;
	return n.toFixed(decimals);
}
