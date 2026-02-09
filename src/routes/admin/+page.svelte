<script lang="ts">
	import { walletStore } from '$lib/stores/wallet';
	import { configStore, fetchConfig } from '$lib/stores/protocol';
	import { matcherStore, fetchMatcher } from '$lib/stores/prices';
	import { connection, getExplorerUrl } from '$lib/solana/connection';
	import { WRAPPER_PROGRAM_ID, MATCHER_PROGRAM_ID } from '$lib/solana/sdk';
	import { getConfigPda, getMatcherStatePda } from '$lib/solana/sdk/pda';
	import { createPauseIx, createUnpauseIx, createUpdateConfigIx, createUpdatePriceIx } from '$lib/solana/sdk/instructions';
	import { Transaction } from '@solana/web3.js';
	import { formatSol, formatBps, shortenAddress } from '$lib/utils/format';
	import { solToLamports } from '$lib/utils/format';
	import { Settings, Pause, Play, RefreshCw, Loader, DollarSign } from 'lucide-svelte';

	let loading = $state(false);
	let txResult = $state<{ sig: string; error?: string } | null>(null);
	let newPrice = $state('');
	let newFeeRate = $state('');

	async function sendTx(ix: any) {
		const wallet = $walletStore.wallet;
		if (!wallet?.publicKey) return;
		loading = true;
		txResult = null;
		try {
			const tx = new Transaction().add(ix);
			tx.feePayer = wallet.publicKey;
			tx.recentBlockhash = (await connection.getLatestBlockhash()).blockhash;
			const signed = await wallet.signTransaction(tx);
			const sig = await connection.sendRawTransaction(signed.serialize());
			await connection.confirmTransaction(sig, 'confirmed');
			txResult = { sig };
			await fetchConfig();
			await fetchMatcher();
		} catch (e: any) {
			txResult = { sig: '', error: e.message };
		} finally {
			loading = false;
		}
	}

	function handlePause() {
		const [configPda] = getConfigPda(WRAPPER_PROGRAM_ID);
		sendTx(createPauseIx({ admin: $walletStore.publicKey!, configPda }));
	}

	function handleUnpause() {
		const [configPda] = getConfigPda(WRAPPER_PROGRAM_ID);
		sendTx(createUnpauseIx({ admin: $walletStore.publicKey!, configPda }));
	}

	function handleUpdatePrice() {
		if (!newPrice) return;
		const [matcherPda] = getMatcherStatePda(MATCHER_PROGRAM_ID);
		sendTx(createUpdatePriceIx({
			admin: $walletStore.publicKey!,
			matcherStatePda: matcherPda,
			newPrice: solToLamports(parseFloat(newPrice))
		}));
	}

	function handleUpdateFee() {
		if (!newFeeRate) return;
		const [configPda] = getConfigPda(WRAPPER_PROGRAM_ID);
		sendTx(createUpdateConfigIx({
			admin: $walletStore.publicKey!,
			configPda,
			updates: { defaultFeeRateBps: Math.round(parseFloat(newFeeRate) * 100) }
		}));
	}

	let config = $derived($configStore);
	let matcher = $derived($matcherStore);
	let isAdmin = $derived(config && $walletStore.publicKey?.equals(config.admin));
</script>

<svelte:head>
	<title>Admin | Colada</title>
</svelte:head>

<div class="max-w-2xl mx-auto space-y-6">
	<h1 class="text-2xl font-bold gradient-text flex items-center gap-2">
		<Settings size={24} />
		Admin Panel
	</h1>

	{#if !$walletStore.connected}
		<div class="card p-8 text-center text-text-muted">Connect wallet to access admin</div>
	{:else if !isAdmin}
		<div class="card p-8 text-center text-text-muted">Your wallet is not the admin</div>
	{:else if config}
		<!-- Protocol Status -->
		<div class="card p-5">
			<h3 class="text-sm text-text-muted mb-4">Protocol Status</h3>
			<div class="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm mb-4">
				<div>
					<p class="text-text-muted text-xs">Admin</p>
					<p class="font-mono text-xs break-all">{shortenAddress(config.admin.toBase58(), 6)}</p>
				</div>
				<div>
					<p class="text-text-muted text-xs">Status</p>
					<span class="badge {config.isPaused ? 'badge-loss' : 'badge-profit'}">
						{config.isPaused ? 'Paused' : 'Active'}
					</span>
				</div>
				<div>
					<p class="text-text-muted text-xs">Total Traders</p>
					<p class="font-mono">{config.totalTraders}</p>
				</div>
				<div>
					<p class="text-text-muted text-xs">Fee Rate</p>
					<p class="font-mono">{formatBps(config.defaultFeeRateBps)}</p>
				</div>
				<div>
					<p class="text-text-muted text-xs">Registration Fee</p>
					<p class="font-mono">{formatSol(config.registrationFee)} SOL</p>
				</div>
				<div>
					<p class="text-text-muted text-xs">Claim Cooldown</p>
					<p class="font-mono">{config.claimCooldownSlots.toString()} slots</p>
				</div>
			</div>

			<div class="flex gap-2">
				{#if config.isPaused}
					<button onclick={handleUnpause} disabled={loading} class="btn-primary flex items-center gap-1.5 text-sm">
						<Play size={14} /> Unpause
					</button>
				{:else}
					<button onclick={handlePause} disabled={loading} class="btn-ghost flex items-center gap-1.5 text-sm text-loss">
						<Pause size={14} /> Pause
					</button>
				{/if}
			</div>
		</div>

		<!-- Update Price -->
		<div class="card p-5">
			<h3 class="text-sm text-text-muted mb-4 flex items-center gap-2">
				<DollarSign size={14} />
				Update Market Price
			</h3>
			{#if matcher}
				<p class="text-xs text-text-muted mb-2">Current: {formatSol(matcher.basePrice)} SOL</p>
			{/if}
			<div class="flex gap-2">
				<input type="number" step="0.0001" bind:value={newPrice} placeholder="New price (SOL)" class="input-field flex-1" />
				<button onclick={handleUpdatePrice} disabled={loading || !newPrice} class="btn-primary text-sm">Update</button>
			</div>
		</div>

		<!-- Update Fee -->
		<div class="card p-5">
			<h3 class="text-sm text-text-muted mb-4">Update Default Fee Rate</h3>
			<div class="flex gap-2">
				<input type="number" step="0.01" max="50" bind:value={newFeeRate} placeholder="Fee rate (%)" class="input-field flex-1" />
				<button onclick={handleUpdateFee} disabled={loading || !newFeeRate} class="btn-primary text-sm">Update</button>
			</div>
		</div>

		{#if txResult}
			<div class="text-sm">
				{#if txResult.error}
					<p class="text-loss">{txResult.error}</p>
				{:else}
					<a href={getExplorerUrl(txResult.sig)} target="_blank" rel="noopener" class="text-accent-orange hover:underline">
						View transaction
					</a>
				{/if}
			</div>
		{/if}
	{/if}
</div>
