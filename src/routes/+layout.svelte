<script lang="ts">
	import '../app.css';
	import WalletButton from '$lib/components/wallet/WalletButton.svelte';
	import { startPolling, stopPolling } from '$lib/stores/protocol';
	import { walletStore } from '$lib/stores/wallet';
	import { startTraderPolling, stopTraderPolling } from '$lib/stores/trader';
	import { startPricePolling, stopPricePolling } from '$lib/stores/prices';
	import { fetchQxBalance } from '$lib/stores/qx';
	import { onMount, onDestroy } from 'svelte';
	import { page } from '$app/stores';
	import { Activity, BarChart3, Settings, Trophy, Coins, UserPlus } from 'lucide-svelte';

	let { children } = $props();

	const navItems = [
		{ href: '/dashboard', label: 'Dashboard', icon: Activity },
		{ href: '/register', label: 'Register', icon: UserPlus },
		{ href: '/leaderboard', label: 'Leaderboard', icon: Trophy },
		{ href: '/stake', label: '$QX', icon: Coins },
		{ href: '/admin', label: 'Admin', icon: Settings }
	];

	onMount(() => {
		startPolling();
		startPricePolling();
	});

	onDestroy(() => {
		stopPolling();
		stopPricePolling();
		stopTraderPolling();
	});

	$effect(() => {
		if ($walletStore.connected) {
			startTraderPolling();
			fetchQxBalance();
		} else {
			stopTraderPolling();
		}
	});
</script>

<div class="min-h-screen flex flex-col">
	<!-- Nav -->
	<nav class="border-b border-border-default px-4 sm:px-6 py-3 flex items-center justify-between backdrop-blur-xl bg-bg-primary/80 sticky top-0 z-30">
		<div class="flex items-center gap-8">
			<a href="/dashboard" class="flex items-center gap-2">
				<div class="w-8 h-8 rounded-lg bg-gradient-to-br from-accent-orange to-accent-teal flex items-center justify-center font-bold text-sm">C</div>
				<span class="text-lg font-bold gradient-text">Colada</span>
			</a>
			<div class="hidden md:flex items-center gap-1">
				{#each navItems as item}
					{@const isActive = $page.url.pathname.startsWith(item.href)}
					<a
						href={item.href}
						class="flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors {isActive ? 'bg-white/10 text-text-primary' : 'text-text-muted hover:text-text-secondary hover:bg-white/5'}"
					>
						<item.icon size={16} />
						{item.label}
					</a>
				{/each}
			</div>
		</div>
		<WalletButton />
	</nav>

	<!-- Mobile Nav -->
	<div class="md:hidden fixed bottom-0 left-0 right-0 z-30 border-t border-border-default bg-bg-primary/95 backdrop-blur-xl px-2 py-2 flex justify-around">
		{#each navItems as item}
			{@const isActive = $page.url.pathname.startsWith(item.href)}
			<a
				href={item.href}
				class="flex flex-col items-center gap-1 px-3 py-1 text-xs transition-colors {isActive ? 'text-accent-orange' : 'text-text-muted'}"
			>
				<item.icon size={18} />
				{item.label}
			</a>
		{/each}
	</div>

	<!-- Main -->
	<main class="flex-1 px-4 md:px-6 py-6 pb-20 md:pb-6 max-w-7xl mx-auto w-full">
		{@render children()}
	</main>
</div>
