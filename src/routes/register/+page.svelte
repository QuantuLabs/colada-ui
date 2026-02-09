<script lang="ts">
	import { walletStore } from '$lib/stores/wallet';
	import { configStore } from '$lib/stores/protocol';
	import { traderStore, isRegistered, fetchTrader } from '$lib/stores/trader';
	import { connection, getExplorerUrl } from '$lib/solana/connection';
	import { WRAPPER_PROGRAM_ID } from '$lib/solana/sdk';
	import { getConfigPda, getTraderAccountPda, getFeeVaultPda } from '$lib/solana/sdk/pda';
	import { createRegisterTraderIx } from '$lib/solana/sdk/instructions';
	import { Transaction, Keypair } from '@solana/web3.js';
	import { getAssociatedTokenAddress } from '@solana/spl-token';
	import { formatSol } from '$lib/utils/format';
	import { CheckCircle, ArrowRight, Loader, UserPlus } from 'lucide-svelte';

	let step = $state(1);
	let loading = $state(false);
	let error = $state('');
	let txSig = $state('');

	async function handleRegister() {
		const wallet = $walletStore.wallet;
		const pk = $walletStore.publicKey;
		const config = $configStore;
		if (!wallet || !pk || !config) return;

		loading = true;
		error = '';
		try {
			const agentNft = Keypair.generate();
			const [configPda] = getConfigPda(WRAPPER_PROGRAM_ID);
			const [traderPda] = getTraderAccountPda(WRAPPER_PROGRAM_ID, pk);
			const [feeVaultPda] = getFeeVaultPda(WRAPPER_PROGRAM_ID, agentNft.publicKey);
			const feeVaultToken = await getAssociatedTokenAddress(config.wsolMint, feeVaultPda, true);

			const ix = createRegisterTraderIx({
				trader: pk,
				configPda,
				traderAccountPda: traderPda,
				feeVaultPda,
				feeVaultToken,
				wsolMint: config.wsolMint,
				agentNft: agentNft.publicKey,
				collection: config.collection
			});

			const tx = new Transaction().add(ix);
			tx.feePayer = pk;
			tx.recentBlockhash = (await connection.getLatestBlockhash()).blockhash;
			tx.partialSign(agentNft);
			const signed = await wallet.signTransaction(tx);
			const sig = await connection.sendRawTransaction(signed.serialize());
			await connection.confirmTransaction(sig, 'confirmed');
			txSig = sig;
			step = 2;
			await fetchTrader();
		} catch (e: any) {
			error = e.message;
		} finally {
			loading = false;
		}
	}
</script>

<svelte:head>
	<title>Register | Colada</title>
</svelte:head>

<div class="max-w-lg mx-auto space-y-6">
	<div class="text-center">
		<h1 class="text-2xl font-bold gradient-text mb-2">Register as Trader</h1>
		<p class="text-text-muted text-sm">Mint an agent NFT and start trading</p>
	</div>

	<div class="flex items-center justify-center gap-4 mb-8">
		{#each [1, 2] as s}
			<div class="flex items-center gap-2">
				<div class="w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium {step >= s ? 'bg-accent-orange text-white' : 'bg-white/10 text-text-muted'}">
					{#if step > s}
						<CheckCircle size={16} />
					{:else}
						{s}
					{/if}
				</div>
				<span class="text-sm {step >= s ? 'text-text-primary' : 'text-text-muted'}">
					{s === 1 ? 'Register' : 'Complete'}
				</span>
			</div>
			{#if s < 2}
				<ArrowRight size={16} class="text-text-muted" />
			{/if}
		{/each}
	</div>

	{#if !$walletStore.connected}
		<div class="card p-8 text-center">
			<UserPlus size={40} class="text-text-muted mx-auto mb-3" />
			<p class="text-text-muted">Connect your wallet to register</p>
		</div>
	{:else if $isRegistered}
		<div class="card p-8 text-center">
			<CheckCircle size={40} class="text-profit mx-auto mb-3" />
			<p class="text-text-primary font-medium mb-2">Already Registered</p>
			<p class="text-text-muted text-sm mb-4">Your trader account is active.</p>
			<a href="/dashboard" class="btn-primary inline-flex items-center gap-2 text-sm">
				Go to Dashboard <ArrowRight size={14} />
			</a>
		</div>
	{:else if step === 1}
		<div class="card p-6 space-y-4">
			{#if $configStore}
				<div class="space-y-2 text-sm">
					<div class="flex justify-between">
						<span class="text-text-muted">Registration Fee</span>
						<span class="font-mono">{formatSol($configStore.registrationFee)} SOL</span>
					</div>
					<div class="flex justify-between">
						<span class="text-text-muted">Default Fee Rate</span>
						<span class="font-mono">{($configStore.defaultFeeRateBps / 100).toFixed(2)}%</span>
					</div>
				</div>
			{/if}

			{#if error}
				<p class="text-loss text-sm">{error}</p>
			{/if}

			<button onclick={handleRegister} disabled={loading} class="w-full btn-primary flex items-center justify-center gap-2">
				{#if loading}
					<Loader size={16} class="animate-spin" />
					Registering...
				{:else}
					<UserPlus size={16} />
					Register & Mint Agent NFT
				{/if}
			</button>
		</div>
	{:else}
		<div class="card p-8 text-center">
			<CheckCircle size={40} class="text-profit mx-auto mb-3" />
			<p class="text-text-primary font-medium mb-2">Registration Complete</p>
			<p class="text-text-muted text-sm mb-4">Your agent NFT has been minted.</p>
			{#if txSig}
				<a href={getExplorerUrl(txSig)} target="_blank" rel="noopener" class="text-accent-orange text-sm hover:underline block mb-4">
					View transaction
				</a>
			{/if}
			<a href="/dashboard" class="btn-primary inline-flex items-center gap-2 text-sm">
				Go to Dashboard <ArrowRight size={14} />
			</a>
		</div>
	{/if}
</div>
