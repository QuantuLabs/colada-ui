<script lang="ts">
	import { page } from '$app/stores';
	import { onMount } from 'svelte';
	import { connection, getExplorerUrl } from '$lib/solana/connection';
	import { WRAPPER_PROGRAM_ID } from '$lib/solana/sdk';
	import { getFeeVaultPda, getTraderAccountPda } from '$lib/solana/sdk/pda';
	import { parseFeeVault } from '$lib/solana/sdk/accounts';
	import { PublicKey } from '@solana/web3.js';
	import { formatSol, shortenAddress } from '$lib/utils/format';
	import type { FeeVault } from '$lib/solana/sdk/types';
	import { Loader, ExternalLink, Wallet, Receipt } from 'lucide-svelte';

	let agentId = $derived($page.params.id);
	let feeVault = $state<FeeVault | null>(null);
	let loading = $state(true);
	let error = $state('');

	$effect(() => {
		loadAgent(agentId);
	});

	async function loadAgent(id: string) {
		loading = true;
		error = '';
		try {
			const nft = new PublicKey(id);
			const [fvPda] = getFeeVaultPda(WRAPPER_PROGRAM_ID, nft);
			const info = await connection.getAccountInfo(fvPda);
			if (info) {
				feeVault = parseFeeVault(Buffer.from(info.data));
			} else {
				error = 'Agent not found';
			}
		} catch (e: any) {
			error = e.message;
		} finally {
			loading = false;
		}
	}
</script>

<svelte:head>
	<title>Agent {shortenAddress(agentId)} | Colada</title>
</svelte:head>

<div class="max-w-2xl mx-auto space-y-6">
	<div>
		<h1 class="text-2xl font-bold gradient-text mb-1">Agent Details</h1>
		<p class="text-text-muted text-sm font-mono">{agentId}</p>
	</div>

	{#if loading}
		<div class="card p-8 flex items-center justify-center">
			<Loader size={24} class="animate-spin text-text-muted" />
		</div>
	{:else if error}
		<div class="card p-8 text-center">
			<p class="text-loss">{error}</p>
		</div>
	{:else if feeVault}
		<div class="card p-5 space-y-4">
			<h3 class="text-sm text-text-muted flex items-center gap-2">
				<Receipt size={14} />
				Fee Vault
			</h3>
			<div class="grid grid-cols-2 gap-4">
				<div>
					<p class="text-xs text-text-muted">Pending Fees</p>
					<p class="text-xl font-mono font-bold text-accent-orange">{formatSol(feeVault.pendingFees)} SOL</p>
				</div>
				<div>
					<p class="text-xs text-text-muted">Total Claimed</p>
					<p class="text-xl font-mono font-bold">{formatSol(feeVault.totalClaimed)} SOL</p>
				</div>
			</div>
			<div class="pt-3 border-t border-border-default text-sm">
				<div class="flex items-center justify-between">
					<span class="text-text-muted">Agent NFT</span>
					<span class="font-mono text-xs">{shortenAddress(feeVault.agentNft.toBase58(), 8)}</span>
				</div>
			</div>
		</div>
	{/if}
</div>
