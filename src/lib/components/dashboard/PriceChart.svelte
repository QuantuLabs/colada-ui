<script lang="ts">
	import { onMount, onDestroy } from 'svelte';
	import { priceHistory, matcherStore } from '$lib/stores/prices';
	import { formatPrice } from '$lib/utils/format';
	import { TrendingUp, TrendingDown } from 'lucide-svelte';

	let chartContainer: HTMLDivElement;
	let chart: any;
	let lineSeries: any;

	onMount(async () => {
		const { createChart, ColorType, LineStyle } = await import('lightweight-charts');
		chart = createChart(chartContainer, {
			width: chartContainer.clientWidth,
			height: 300,
			layout: {
				background: { type: ColorType.Solid, color: 'transparent' },
				textColor: '#94a3b8',
				fontFamily: 'Inter, system-ui, sans-serif',
				fontSize: 11
			},
			grid: {
				vertLines: { color: 'rgba(255,255,255,0.03)' },
				horzLines: { color: 'rgba(255,255,255,0.03)' }
			},
			crosshair: {
				vertLine: { color: 'rgba(249,115,22,0.3)', labelBackgroundColor: '#f97316' },
				horzLine: { color: 'rgba(249,115,22,0.3)', labelBackgroundColor: '#f97316' }
			},
			rightPriceScale: { borderVisible: false },
			timeScale: { borderVisible: false, timeVisible: true }
		});

		lineSeries = chart.addLineSeries({
			color: '#f97316',
			lineWidth: 2,
			crosshairMarkerRadius: 4,
			crosshairMarkerBorderColor: '#f97316',
			crosshairMarkerBackgroundColor: '#0a0e1a',
			priceFormat: { type: 'price', precision: 6, minMove: 0.000001 }
		});

		const ro = new ResizeObserver(() => {
			chart?.applyOptions({ width: chartContainer.clientWidth });
		});
		ro.observe(chartContainer);

		return () => ro.disconnect();
	});

	onDestroy(() => {
		chart?.remove();
	});

	$effect(() => {
		if (lineSeries && $priceHistory.length > 0) {
			lineSeries.setData($priceHistory);
		}
	});

	let currentPrice = $derived($matcherStore?.basePrice ?? 0n);
	let priceChange = $derived($priceHistory.length >= 2
		? $priceHistory[$priceHistory.length - 1].value - $priceHistory[$priceHistory.length - 2].value
		: 0);
	let isUp = $derived(priceChange >= 0);
</script>

<div class="card p-4">
	<div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
		<div>
			<h3 class="text-text-muted text-sm">Price</h3>
			<div class="flex items-center gap-2">
				<span class="text-xl sm:text-2xl font-mono font-bold">{formatPrice(currentPrice)} SOL</span>
				<span class="flex items-center gap-1 text-xs sm:text-sm {isUp ? 'text-profit' : 'text-loss'}">
					{#if isUp}<TrendingUp size={14} />{:else}<TrendingDown size={14} />{/if}
					{priceChange >= 0 ? '+' : ''}{priceChange.toFixed(6)}
				</span>
			</div>
		</div>
		<div class="flex items-center gap-2">
			{#if $matcherStore}
				<span class="badge badge-neutral text-xs">Spread: {$matcherStore.spreadBps} bps</span>
			{/if}
		</div>
	</div>
	<div bind:this={chartContainer} class="w-full"></div>
</div>
