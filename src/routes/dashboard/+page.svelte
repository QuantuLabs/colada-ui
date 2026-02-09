<script lang="ts">
	import PriceChart from '$lib/components/dashboard/PriceChart.svelte';
	import PortfolioCard from '$lib/components/dashboard/PortfolioCard.svelte';
	import TradePanel from '$lib/components/dashboard/TradePanel.svelte';
	import PositionCard from '$lib/components/dashboard/PositionCard.svelte';
	import QXBadge from '$lib/components/token/QXBadge.svelte';
	import { configStore } from '$lib/stores/protocol';
	import { walletStore } from '$lib/stores/wallet';
	import { AlertCircle } from 'lucide-svelte';
</script>

<svelte:head>
	<title>Dashboard | Percolator</title>
</svelte:head>

<div class="space-y-6">
	{#if $configStore?.isPaused}
		<div class="card p-4 border-loss/30 flex items-center gap-3">
			<AlertCircle size={20} class="text-loss" />
			<span class="text-sm text-loss font-medium">Protocol is paused</span>
		</div>
	{/if}

	{#if $walletStore.connected}
		<div class="flex items-center gap-3">
			<QXBadge />
		</div>
	{/if}

	<PriceChart />

	<div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
		<div class="lg:col-span-1 space-y-6">
			<TradePanel />
		</div>
		<div class="lg:col-span-1">
			<PortfolioCard />
		</div>
		<div class="lg:col-span-1">
			<PositionCard />
		</div>
	</div>
</div>
