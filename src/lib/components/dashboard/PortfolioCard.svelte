<script lang="ts">
	import { traderStore, feeVaultStore } from '$lib/stores/trader';
	import { configStore } from '$lib/stores/protocol';
	import { formatSol, formatPnl, formatBps } from '$lib/utils/format';
	import { Wallet, TrendingUp, Receipt, Activity } from 'lucide-svelte';

	let trader = $derived($traderStore);
	let feeVault = $derived($feeVaultStore);
	let config = $derived($configStore);
</script>

{#if trader}
	<div class="card p-5">
		<h3 class="text-text-muted text-sm mb-4 flex items-center gap-2">
			<Wallet size={14} />
			Portfolio
		</h3>
		<div class="grid grid-cols-2 gap-3 sm:gap-4">
			<div>
				<p class="text-text-muted text-xs">Balance</p>
				<p class="text-lg sm:text-xl font-mono font-bold">{formatSol(trader.depositedBalance)} SOL</p>
			</div>
			<div>
				<p class="text-text-muted text-xs">Total PnL</p>
				<p class="text-lg sm:text-xl font-mono font-bold {trader.totalPnl >= 0n ? 'text-profit' : 'text-loss'}">
					{formatPnl(trader.totalPnl)}
				</p>
			</div>
			<div>
				<p class="text-text-muted text-xs">Trades</p>
				<p class="text-base sm:text-lg font-mono">{trader.tradeCount}</p>
			</div>
			<div>
				<p class="text-text-muted text-xs">Fee Rate</p>
				<p class="text-base sm:text-lg font-mono">{formatBps(trader.feeRateBps)}</p>
			</div>
		</div>

		{#if feeVault}
			<div class="mt-4 pt-4 border-t border-border-default">
				<div class="flex items-center justify-between">
					<div>
						<p class="text-text-muted text-xs">Pending Fees</p>
						<p class="font-mono text-accent-orange">{formatSol(feeVault.pendingFees)} SOL</p>
					</div>
					<div>
						<p class="text-text-muted text-xs">Total Claimed</p>
						<p class="font-mono">{formatSol(feeVault.totalClaimed)} SOL</p>
					</div>
				</div>
			</div>
		{/if}

		<div class="mt-3">
			<span class="badge {trader.isActive ? 'badge-profit' : 'badge-loss'}">
				{trader.isActive ? 'Active' : 'Inactive'}
			</span>
		</div>
	</div>
{:else}
	<div class="card p-5 flex flex-col items-center justify-center min-h-[200px] text-center">
		<Activity size={32} class="text-text-muted mb-2" />
		<p class="text-text-muted">Connect wallet & register to start trading</p>
		<a href="/register" class="btn-primary mt-3 text-sm">Register</a>
	</div>
{/if}
