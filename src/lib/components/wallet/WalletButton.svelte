<script lang="ts">
	import { walletStore, connectWallet, disconnectWallet, type WalletAdapter } from '$lib/stores/wallet';
	import { shortenAddress } from '$lib/utils/format';
	import { LogOut, Wallet } from 'lucide-svelte';

	let showDropdown = $state(false);
	let detectedWallets = $state<any[]>([]);

	function detectWallets() {
		const wallets: any[] = [];
		const w = (window as any);
		if (w.solana?.isPhantom) {
			wallets.push({ name: 'Phantom', icon: 'https://phantom.app/img/phantom-icon-purple.svg', adapter: w.solana });
		}
		if (w.solflare?.isSolflare) {
			wallets.push({ name: 'Solflare', icon: 'https://solflare.com/favicon.ico', adapter: w.solflare });
		}
		if (w.backpack?.isBackpack) {
			wallets.push({ name: 'Backpack', icon: 'https://backpack.app/favicon.ico', adapter: w.backpack });
		}
		detectedWallets = wallets;
	}

	async function handleConnect(wallet: any) {
		const adapter: WalletAdapter = {
			name: wallet.name,
			icon: wallet.icon,
			publicKey: null,
			connected: false,
			async connect() {
				await wallet.adapter.connect();
				this.publicKey = wallet.adapter.publicKey;
				this.connected = true;
			},
			async disconnect() {
				await wallet.adapter.disconnect();
				this.publicKey = null;
				this.connected = false;
			},
			async signTransaction(tx: any) {
				return wallet.adapter.signTransaction(tx);
			},
			async signAllTransactions(txs: any[]) {
				return wallet.adapter.signAllTransactions(txs);
			}
		};
		await connectWallet(adapter);
		showDropdown = false;
	}

	function handleDisconnect() {
		disconnectWallet();
		showDropdown = false;
	}

	function toggleDropdown() {
		if (!$walletStore.connected) detectWallets();
		showDropdown = !showDropdown;
	}
</script>

<div class="relative">
	{#if $walletStore.connected && $walletStore.publicKey}
		<button onclick={toggleDropdown} class="btn-ghost flex items-center gap-2 text-sm">
			<Wallet size={16} />
			<span class="font-mono">{shortenAddress($walletStore.publicKey.toBase58())}</span>
		</button>
	{:else}
		<button onclick={toggleDropdown} class="btn-primary flex items-center gap-2 text-sm" disabled={$walletStore.connecting}>
			<Wallet size={16} />
			{$walletStore.connecting ? 'Connecting...' : 'Connect Wallet'}
		</button>
	{/if}

	{#if showDropdown}
		<!-- svelte-ignore a11y_click_events_have_key_events a11y_no_static_element_interactions -->
		<div class="fixed inset-0 z-40" onclick={() => showDropdown = false}></div>
		<div class="absolute right-0 top-full mt-2 z-50 card p-2 min-w-[220px]">
			{#if $walletStore.connected}
				<button onclick={handleDisconnect} class="w-full flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-white/5 text-sm text-red-400">
					<LogOut size={16} />
					Disconnect
				</button>
			{:else}
				{#if detectedWallets.length === 0}
					<p class="text-sm text-text-muted px-3 py-2">No wallets detected</p>
				{/if}
				{#each detectedWallets as wallet}
					<button onclick={() => handleConnect(wallet)} class="w-full flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-white/5 text-sm">
						<img src={wallet.icon} alt={wallet.name} class="w-5 h-5 rounded" />
						{wallet.name}
					</button>
				{/each}
			{/if}
		</div>
	{/if}
</div>
