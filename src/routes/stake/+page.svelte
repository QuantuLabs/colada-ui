<script lang="ts">
	import { qxBalance, qxStaked, currentTier, nextTier, FEE_TIERS } from '$lib/stores/qx';
	import { walletStore } from '$lib/stores/wallet';
	import { Coins, Lock, Unlock, TrendingUp, ArrowRight, Shield } from 'lucide-svelte';

	let tier = $derived($currentTier);
	let next = $derived($nextTier);
	let balance = $derived(Number($qxBalance) / 1e9);
	let staked = $derived(Number($qxStaked) / 1e9);
</script>

<svelte:head>
	<title>$QX Staking | Colada</title>
</svelte:head>

<div class="max-w-2xl mx-auto space-y-6">
	<div class="text-center">
		<h1 class="text-2xl font-bold gradient-text mb-2">$QX Token</h1>
		<p class="text-text-muted text-sm">Stake $QX for fee discounts and Colada rewards</p>
	</div>

	{#if !$walletStore.connected}
		<div class="card p-8 text-center text-text-muted">Connect wallet to view $QX balance</div>
	{:else}
		<!-- Current Tier -->
		<div class="gradient-border rounded-2xl p-5">
			<div class="flex items-center justify-between mb-4">
				<div class="flex items-center gap-3">
					<div class="w-12 h-12 rounded-xl flex items-center justify-center" style="background: {tier.color}20;">
						<Shield size={24} style="color: {tier.color};" />
					</div>
					<div>
						<p class="text-xs text-text-muted">Current Tier</p>
						<p class="text-xl font-bold" style="color: {tier.color};">{tier.name}</p>
					</div>
				</div>
				<div class="text-right">
					<p class="text-xs text-text-muted">Fee Discount</p>
					<p class="text-xl font-bold text-accent-orange">-{tier.discount}%</p>
				</div>
			</div>

			{#if next}
				<div class="bg-white/5 rounded-xl p-3">
					<div class="flex items-center justify-between text-xs text-text-muted mb-2">
						<span>{tier.name}</span>
						<span>{next.name} (-{next.discount}%)</span>
					</div>
					<div class="w-full h-2 rounded-full bg-white/10 overflow-hidden">
						<div class="h-full rounded-full bg-gradient-to-r from-accent-orange to-accent-teal transition-all" style="width: {Math.min(Number($qxBalance) / Number(next.minBalance) * 100, 100)}%"></div>
					</div>
					<p class="text-xs text-text-muted mt-1">
						{balance.toFixed(2)} / {(Number(next.minBalance) / 1e9).toFixed(0)} $QX
					</p>
				</div>
			{/if}
		</div>

		<!-- Balance -->
		<div class="grid grid-cols-2 gap-4">
			<div class="card p-5">
				<p class="text-xs text-text-muted mb-1 flex items-center gap-1"><Coins size={12} /> Balance</p>
				<p class="text-2xl font-mono font-bold">{balance.toFixed(2)}</p>
				<p class="text-xs text-text-muted">$QX</p>
			</div>
			<div class="card p-5">
				<p class="text-xs text-text-muted mb-1 flex items-center gap-1"><Lock size={12} /> Staked</p>
				<p class="text-2xl font-mono font-bold">{staked.toFixed(2)}</p>
				<p class="text-xs text-text-muted">$QX</p>
			</div>
		</div>

		<!-- All Tiers -->
		<div class="card p-5">
			<h3 class="text-sm text-text-muted mb-4">Fee Discount Tiers</h3>
			<div class="space-y-3">
				{#each FEE_TIERS as t}
					{@const isCurrent = t.name === tier.name}
					<div class="flex items-center justify-between p-3 rounded-xl {isCurrent ? 'bg-white/5 border border-border-hover' : ''}">
						<div class="flex items-center gap-3">
							<div class="w-3 h-3 rounded-full" style="background: {t.color};"></div>
							<span class="text-sm {isCurrent ? 'text-text-primary font-medium' : 'text-text-muted'}">{t.name}</span>
						</div>
						<div class="flex items-center gap-4 text-sm">
							<span class="text-text-muted font-mono">{Number(t.minBalance) === 0 ? 'Any' : `${(Number(t.minBalance) / 1e9).toLocaleString()} $QX`}</span>
							<span class="font-medium" style="color: {t.color};">-{t.discount}%</span>
						</div>
					</div>
				{/each}
			</div>
		</div>

		<!-- Coming Soon -->
		<div class="card p-5 text-center">
			<h3 class="text-sm text-text-muted mb-2">Colada Revenue Pool</h3>
			<p class="text-xs text-text-muted">Coming soon — Stake $QX to earn a share of Colada fees</p>
		</div>
	{/if}
</div>
