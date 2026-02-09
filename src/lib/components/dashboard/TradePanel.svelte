<script lang="ts">
	import { walletStore } from '$lib/stores/wallet';
	import { traderStore } from '$lib/stores/trader';
	import { configStore } from '$lib/stores/protocol';
	import { matcherStore } from '$lib/stores/prices';
	import { connection } from '$lib/solana/connection';
	import { WRAPPER_PROGRAM_ID, MATCHER_PROGRAM_ID } from '$lib/solana/sdk';
	import { getConfigPda, getTraderAccountPda, getMatcherStatePda } from '$lib/solana/sdk/pda';
	import { createExecuteTradeIx, createDepositIx, createWithdrawIx } from '$lib/solana/sdk/instructions';
	import { getExplorerUrl } from '$lib/solana/connection';
	import { Transaction } from '@solana/web3.js';
	import { getAssociatedTokenAddress, NATIVE_MINT } from '@solana/spl-token';
	import { solToLamports, formatSol } from '$lib/utils/format';
	import { fetchTrader } from '$lib/stores/trader';
	import { ArrowUpRight, ArrowDownRight, Plus, Minus } from 'lucide-svelte';

	type Tab = 'trade' | 'deposit' | 'withdraw';
	let activeTab = $state<Tab>('trade');
	let amount = $state('');
	let isBuy = $state(true);
	let loading = $state(false);
	let txResult = $state<{ sig: string; error?: string } | null>(null);

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
			await fetchTrader();
		} catch (e: any) {
			txResult = { sig: '', error: e.message };
		} finally {
			loading = false;
		}
	}

	async function handleTrade() {
		const pk = $walletStore.publicKey!;
		const size = solToLamports(parseFloat(amount));
		const [configPda] = getConfigPda(WRAPPER_PROGRAM_ID);
		const [traderPda] = getTraderAccountPda(WRAPPER_PROGRAM_ID, pk);
		const [matcherPda] = getMatcherStatePda(MATCHER_PROGRAM_ID);

		const ix = createExecuteTradeIx({
			trader: pk,
			configPda,
			traderAccountPda: traderPda,
			matcherState: matcherPda,
			matcherProgram: MATCHER_PROGRAM_ID,
			size: isBuy ? size : -size
		});
		await sendTx(ix);
	}

	async function handleDeposit() {
		const pk = $walletStore.publicKey!;
		const lamports = solToLamports(parseFloat(amount));
		const [configPda] = getConfigPda(WRAPPER_PROGRAM_ID);
		const [traderPda] = getTraderAccountPda(WRAPPER_PROGRAM_ID, pk);
		const config = $configStore!;
		const vaultToken = await getAssociatedTokenAddress(config.wsolMint, config.authority, true);
		const traderToken = await getAssociatedTokenAddress(NATIVE_MINT, pk);

		const ix = createDepositIx({
			trader: pk,
			configPda,
			traderAccountPda: traderPda,
			vaultToken,
			traderToken,
			amount: lamports
		});
		await sendTx(ix);
	}

	async function handleWithdraw() {
		const pk = $walletStore.publicKey!;
		const lamports = solToLamports(parseFloat(amount));
		const [configPda] = getConfigPda(WRAPPER_PROGRAM_ID);
		const [traderPda] = getTraderAccountPda(WRAPPER_PROGRAM_ID, pk);
		const [authorityPda] = getConfigPda(WRAPPER_PROGRAM_ID);
		const config = $configStore!;
		const vaultToken = await getAssociatedTokenAddress(config.wsolMint, config.authority, true);
		const traderToken = await getAssociatedTokenAddress(NATIVE_MINT, pk);

		const ix = createWithdrawIx({
			trader: pk,
			configPda,
			traderAccountPda: traderPda,
			authorityPda,
			vaultToken,
			traderToken,
			amount: lamports
		});
		await sendTx(ix);
	}

	function handleSubmit() {
		if (!amount || parseFloat(amount) <= 0) return;
		if (activeTab === 'trade') handleTrade();
		else if (activeTab === 'deposit') handleDeposit();
		else handleWithdraw();
	}

	let isDisabled = $derived(!$walletStore.connected || !$traderStore || loading || !amount || parseFloat(amount) <= 0);
</script>

<div class="card p-5">
	<div class="flex gap-1 mb-4 p-1 rounded-xl bg-white/5">
		{#each (['trade', 'deposit', 'withdraw'] as const) as tab}
			<button
				onclick={() => activeTab = tab}
				class="flex-1 py-2 text-sm rounded-lg capitalize transition-colors {activeTab === tab ? 'bg-white/10 text-text-primary font-medium' : 'text-text-muted hover:text-text-secondary'}"
			>
				{tab}
			</button>
		{/each}
	</div>

	{#if activeTab === 'trade'}
		<div class="flex gap-2 mb-4">
			<button
				onclick={() => isBuy = true}
				class="flex-1 py-2.5 rounded-xl text-sm font-medium flex items-center justify-center gap-1.5 transition-colors {isBuy ? 'bg-profit/20 text-profit border border-profit/30' : 'bg-white/5 text-text-muted border border-transparent'}"
			>
				<ArrowUpRight size={16} />
				Buy
			</button>
			<button
				onclick={() => isBuy = false}
				class="flex-1 py-2.5 rounded-xl text-sm font-medium flex items-center justify-center gap-1.5 transition-colors {!isBuy ? 'bg-loss/20 text-loss border border-loss/30' : 'bg-white/5 text-text-muted border border-transparent'}"
			>
				<ArrowDownRight size={16} />
				Sell
			</button>
		</div>
	{/if}

	<div class="mb-4">
		<label class="text-xs text-text-muted mb-1 block">
			{activeTab === 'trade' ? 'Size' : 'Amount'} (SOL)
		</label>
		<input
			type="number"
			step="0.001"
			min="0"
			bind:value={amount}
			placeholder="0.00"
			class="input-field text-lg"
		/>
		{#if $traderStore}
			<p class="text-xs text-text-muted mt-1">Balance: {formatSol($traderStore.depositedBalance)} SOL</p>
		{/if}
	</div>

	<button
		onclick={handleSubmit}
		disabled={isDisabled}
		class="w-full py-3 rounded-xl font-medium text-sm transition-all {
			activeTab === 'trade'
				? isBuy ? 'bg-profit text-white hover:bg-profit/90' : 'bg-loss text-white hover:bg-loss/90'
				: 'btn-primary'
		}"
		class:opacity-50={isDisabled}
		class:cursor-not-allowed={isDisabled}
	>
		{#if loading}
			Processing...
		{:else if activeTab === 'trade'}
			{isBuy ? 'Buy' : 'Sell'} {amount || '0'} SOL
		{:else if activeTab === 'deposit'}
			Deposit {amount || '0'} SOL
		{:else}
			Withdraw {amount || '0'} SOL
		{/if}
	</button>

	{#if txResult}
		<div class="mt-3 text-xs">
			{#if txResult.error}
				<p class="text-loss">{txResult.error}</p>
			{:else}
				<a href={getExplorerUrl(txResult.sig)} target="_blank" rel="noopener" class="text-accent-orange hover:underline">
					View transaction
				</a>
			{/if}
		</div>
	{/if}
</div>
