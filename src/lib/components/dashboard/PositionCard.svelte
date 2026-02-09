<script lang="ts">
	import { traderStore } from '$lib/stores/trader';
	import { matcherStore } from '$lib/stores/prices';
	import { formatSol, formatPnl, formatBps, shortenAddress } from '$lib/utils/format';
	import { BarChart3 } from 'lucide-svelte';

	let trader = $derived($traderStore);
	let matcher = $derived($matcherStore);
</script>

{#if trader}
	<div class="card p-5">
		<h3 class="text-text-muted text-sm mb-4 flex items-center gap-2">
			<BarChart3 size={14} />
			Position Details
		</h3>
		<div class="space-y-3">
			<div class="flex items-center justify-between text-sm">
				<span class="text-text-muted">Agent NFT</span>
				<span class="font-mono text-xs">{shortenAddress(trader.agentNft.toBase58(), 6)}</span>
			</div>
			<div class="flex items-center justify-between text-sm">
				<span class="text-text-muted">Total PnL</span>
				<span class="font-mono {trader.totalPnl >= 0n ? 'text-profit' : 'text-loss'}">{formatPnl(trader.totalPnl)}</span>
			</div>
			<div class="flex items-center justify-between text-sm">
				<span class="text-text-muted">Fees Generated</span>
				<span class="font-mono">{formatSol(trader.totalFeesGenerated)} SOL</span>
			</div>
			<div class="flex items-center justify-between text-sm">
				<span class="text-text-muted">Trade Count</span>
				<span class="font-mono">{trader.tradeCount}</span>
			</div>
			<div class="flex items-center justify-between text-sm">
				<span class="text-text-muted">Fee Rate</span>
				<span class="font-mono">{formatBps(trader.feeRateBps)}</span>
			</div>
			{#if matcher}
				<div class="flex items-center justify-between text-sm">
					<span class="text-text-muted">Market Price</span>
					<span class="font-mono">{formatSol(matcher.basePrice)} SOL</span>
				</div>
				<div class="flex items-center justify-between text-sm">
					<span class="text-text-muted">Liquidity</span>
					<span class="font-mono">{formatSol(matcher.liquidity)} SOL</span>
				</div>
			{/if}
		</div>
	</div>
{/if}
