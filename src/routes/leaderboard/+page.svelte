<script lang="ts">
	import { onMount } from 'svelte';
	import { connection } from '$lib/solana/connection';
	import { WRAPPER_PROGRAM_ID } from '$lib/solana/sdk';
	import { parseTraderAccount } from '$lib/solana/sdk/accounts';
	import type { TraderAccount } from '$lib/solana/sdk/types';
	import { formatSol, formatPnl, shortenAddress } from '$lib/utils/format';
	import { Trophy, Medal, Crown, TrendingUp } from 'lucide-svelte';

	interface RankedTrader {
		address: string;
		trader: TraderAccount;
	}

	let traders = $state<RankedTrader[]>([]);
	let loading = $state(true);
	let sortBy = $state<'pnl' | 'trades' | 'fees'>('pnl');

	onMount(async () => {
		try {
			const accounts = await connection.getProgramAccounts(WRAPPER_PROGRAM_ID, {
				filters: [{ memcmp: { offset: 0, bytes: 'dHJhZGVyX18' } }]
			});
			traders = accounts
				.map((a) => ({
					address: a.pubkey.toBase58(),
					trader: parseTraderAccount(Buffer.from(a.account.data))
				}))
				.filter((t) => t.trader.isActive);
		} catch {
			// silent
		} finally {
			loading = false;
		}
	});

	let sorted = $derived([...traders].sort((a, b) => {
		if (sortBy === 'pnl') return Number(b.trader.totalPnl - a.trader.totalPnl);
		if (sortBy === 'trades') return b.trader.tradeCount - a.trader.tradeCount;
		return Number(b.trader.totalFeesGenerated - a.trader.totalFeesGenerated);
	}));

	function getRankIcon(i: number) {
		if (i === 0) return Crown;
		if (i === 1) return Medal;
		if (i === 2) return Trophy;
		return null;
	}

	const rankColors = ['text-yellow-400', 'text-gray-300', 'text-amber-600'];
</script>

<svelte:head>
	<title>Leaderboard | Colada</title>
</svelte:head>

<div class="space-y-6">
	<div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
		<h1 class="text-2xl font-bold gradient-text flex items-center gap-2">
			<Trophy size={24} />
			Leaderboard
		</h1>
		<div class="flex gap-1 p-1 rounded-xl bg-white/5 self-start sm:self-auto">
			{#each (['pnl', 'trades', 'fees'] as const) as s}
				<button
					onclick={() => sortBy = s}
					class="px-3 py-1.5 text-xs rounded-lg capitalize {sortBy === s ? 'bg-white/10 text-text-primary' : 'text-text-muted hover:text-text-secondary'}"
				>
					{s === 'pnl' ? 'PnL' : s === 'trades' ? 'Trades' : 'Fees'}
				</button>
			{/each}
		</div>
	</div>

	{#if loading}
		<div class="card p-8 text-center text-text-muted">Loading...</div>
	{:else if sorted.length === 0}
		<div class="card p-8 text-center text-text-muted">No active traders</div>
	{:else}
		<div class="card overflow-x-auto">
			<table class="w-full text-sm">
				<thead>
					<tr class="border-b border-border-default text-text-muted text-xs">
						<th class="text-left p-4 w-16">#</th>
						<th class="text-left p-4">Agent</th>
						<th class="text-right p-4">PnL</th>
						<th class="text-right p-4 hidden sm:table-cell">Trades</th>
						<th class="text-right p-4 hidden md:table-cell">Fees Generated</th>
					</tr>
				</thead>
				<tbody>
					{#each sorted as { address, trader }, i}
						{@const Icon = getRankIcon(i)}
						<tr class="border-b border-border-default/50 hover:bg-white/3 transition-colors">
							<td class="p-4">
								{#if Icon}
									<Icon size={18} class={rankColors[i] || 'text-text-muted'} />
								{:else}
									<span class="text-text-muted">{i + 1}</span>
								{/if}
							</td>
							<td class="p-4">
								<a href="/agent/{trader.agentNft.toBase58()}" class="font-mono text-xs hover:text-accent-orange transition-colors">
									{shortenAddress(trader.agentNft.toBase58(), 6)}
								</a>
							</td>
							<td class="p-4 text-right font-mono {trader.totalPnl >= 0n ? 'text-profit' : 'text-loss'}">
								{formatPnl(trader.totalPnl)}
							</td>
							<td class="p-4 text-right font-mono hidden sm:table-cell">
								{trader.tradeCount}
							</td>
							<td class="p-4 text-right font-mono hidden md:table-cell">
								{formatSol(trader.totalFeesGenerated)} SOL
							</td>
						</tr>
					{/each}
				</tbody>
			</table>
		</div>
	{/if}
</div>
