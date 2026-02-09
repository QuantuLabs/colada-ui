<script lang="ts">
	import { qxBalance, currentTier, nextTier, FEE_TIERS } from '$lib/stores/qx';
	import { Coins } from 'lucide-svelte';

	let tier = $derived($currentTier);
	let next = $derived($nextTier);
	let balance = $derived(Number($qxBalance) / 1e9);
	let progress = $derived(next ? Number($qxBalance) / Number(next.minBalance) * 100 : 100);
</script>

<div class="flex items-center gap-3">
	<div class="badge" style="background: {tier.color}20; color: {tier.color}; border: 1px solid {tier.color}40;">
		<Coins size={12} />
		{tier.name}
		{#if tier.discount > 0}
			&middot; -{tier.discount}% fees
		{/if}
	</div>
	{#if balance > 0}
		<span class="text-xs text-text-muted font-mono">{balance.toFixed(2)} $QX</span>
	{/if}
	{#if next}
		<div class="hidden sm:flex items-center gap-2 text-xs text-text-muted">
			<div class="w-20 h-1.5 rounded-full bg-white/10 overflow-hidden">
				<div class="h-full rounded-full bg-accent-purple transition-all" style="width: {Math.min(progress, 100)}%"></div>
			</div>
			<span>Next: {next.name}</span>
		</div>
	{/if}
</div>
