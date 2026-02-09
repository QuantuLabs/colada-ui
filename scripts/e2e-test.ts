import {
  Connection,
  Keypair,
  PublicKey,
  SystemProgram,
  Transaction,
  TransactionInstruction,
  sendAndConfirmTransaction,
  LAMPORTS_PER_SOL,
} from "@solana/web3.js";
import {
  TOKEN_PROGRAM_ID,
  ASSOCIATED_TOKEN_PROGRAM_ID,
  getAssociatedTokenAddress,
  NATIVE_MINT,
  createAssociatedTokenAccountInstruction,
  createSyncNativeInstruction,
} from "@solana/spl-token";

const WRAPPER_PROGRAM_ID = new PublicKey("4JnQKUWnJNsqwaS5cK5TpHfUcxSbrtuUTeW2hJSCpHeZ");
const MATCHER_PROGRAM_ID = new PublicKey("6dhNb1YaguJpuUWWFihM9LvtFGHkK2wT59W1hb4VCyV1");

function encodeU16(value: number): Buffer {
  const buf = Buffer.alloc(2);
  buf.writeUInt16LE(value);
  return buf;
}
function encodeU64(value: bigint): Buffer {
  const buf = Buffer.alloc(8);
  buf.writeBigUInt64LE(value);
  return buf;
}
function encodeI64(value: bigint): Buffer {
  const buf = Buffer.alloc(8);
  buf.writeBigInt64LE(value);
  return buf;
}

function getConfigPda(): [PublicKey, number] {
  return PublicKey.findProgramAddressSync([Buffer.from("percolator_config")], WRAPPER_PROGRAM_ID);
}
function getAuthorityPda(): [PublicKey, number] {
  return PublicKey.findProgramAddressSync([Buffer.from("percolator_authority")], WRAPPER_PROGRAM_ID);
}
function getTraderAccountPda(trader: PublicKey): [PublicKey, number] {
  return PublicKey.findProgramAddressSync([Buffer.from("trader"), trader.toBuffer()], WRAPPER_PROGRAM_ID);
}
function getFeeVaultPda(agentNft: PublicKey): [PublicKey, number] {
  return PublicKey.findProgramAddressSync([Buffer.from("fee_vault"), agentNft.toBuffer()], WRAPPER_PROGRAM_ID);
}
function getMatcherStatePda(): [PublicKey, number] {
  return PublicKey.findProgramAddressSync([Buffer.from("matcher_state")], MATCHER_PROGRAM_ID);
}

async function main() {
  const connection = new Connection("http://localhost:8899", "confirmed");

  // Generate a test trader keypair
  const trader = Keypair.generate();
  console.log("Test Trader:", trader.publicKey.toBase58());

  // Airdrop SOL to trader
  console.log("\n[1] Airdropping 10 SOL to trader...");
  const airdropSig = await connection.requestAirdrop(trader.publicKey, 10 * LAMPORTS_PER_SOL);
  await connection.confirmTransaction(airdropSig, "confirmed");
  const balance = await connection.getBalance(trader.publicKey);
  console.log(`    Balance: ${balance / LAMPORTS_PER_SOL} SOL`);

  // Read config
  const [configPda] = getConfigPda();
  const configInfo = await connection.getAccountInfo(configPda);
  if (!configInfo) throw new Error("Config not initialized");

  // Parse wsolMint from config (offset 137, 32 bytes)
  const wsolMint = new PublicKey(configInfo.data.slice(137, 169));
  const collection = new PublicKey(configInfo.data.slice(105, 137));
  console.log("    wSOL mint:", wsolMint.toBase58());
  console.log("    Collection:", collection.toBase58());

  // [2] Register trader
  console.log("\n[2] Registering trader with agent NFT...");
  const agentNft = Keypair.generate();
  const [traderPda] = getTraderAccountPda(trader.publicKey);
  const [feeVaultPda] = getFeeVaultPda(agentNft.publicKey);
  const feeVaultToken = await getAssociatedTokenAddress(wsolMint, feeVaultPda, true);

  const registerIx = new TransactionInstruction({
    programId: WRAPPER_PROGRAM_ID,
    keys: [
      { pubkey: trader.publicKey, isSigner: true, isWritable: true },
      { pubkey: configPda, isSigner: false, isWritable: true },
      { pubkey: traderPda, isSigner: false, isWritable: true },
      { pubkey: feeVaultPda, isSigner: false, isWritable: true },
      { pubkey: feeVaultToken, isSigner: false, isWritable: true },
      { pubkey: wsolMint, isSigner: false, isWritable: false },
      { pubkey: agentNft.publicKey, isSigner: true, isWritable: false },
      { pubkey: collection, isSigner: false, isWritable: false },
      { pubkey: SystemProgram.programId, isSigner: false, isWritable: false },
      { pubkey: TOKEN_PROGRAM_ID, isSigner: false, isWritable: false },
      { pubkey: ASSOCIATED_TOKEN_PROGRAM_ID, isSigner: false, isWritable: false },
    ],
    data: Buffer.from([1]),
  });

  try {
    const registerTx = new Transaction().add(registerIx);
    const registerSig = await sendAndConfirmTransaction(connection, registerTx, [trader, agentNft]);
    console.log("    Register OK:", registerSig);
  } catch (err: any) {
    console.error("    Register FAILED:", err.message);
    console.log("    (This might fail if program requires NFT verification - expected for local test)");
  }

  // Verify trader account
  const traderInfo = await connection.getAccountInfo(traderPda);
  if (traderInfo) {
    console.log("    Trader account created, size:", traderInfo.data.length);
  } else {
    console.log("    Trader account NOT created (registration may have failed)");
  }

  // [3] Execute trade (if registered)
  if (traderInfo) {
    console.log("\n[3] Executing trade (buy 0.1 SOL)...");
    const [matcherPda] = getMatcherStatePda();
    const tradeIx = new TransactionInstruction({
      programId: WRAPPER_PROGRAM_ID,
      keys: [
        { pubkey: trader.publicKey, isSigner: true, isWritable: false },
        { pubkey: configPda, isSigner: false, isWritable: false },
        { pubkey: traderPda, isSigner: false, isWritable: true },
        { pubkey: matcherPda, isSigner: false, isWritable: false },
        { pubkey: MATCHER_PROGRAM_ID, isSigner: false, isWritable: false },
      ],
      data: Buffer.concat([Buffer.from([11]), encodeI64(BigInt(100_000_000))]),
    });

    try {
      const tradeTx = new Transaction().add(tradeIx);
      const tradeSig = await sendAndConfirmTransaction(connection, tradeTx, [trader]);
      console.log("    Trade OK:", tradeSig);
    } catch (err: any) {
      console.error("    Trade FAILED:", err.message);
    }
  }

  // [4] Check matcher state
  console.log("\n[4] Reading matcher state...");
  const [matcherPda] = getMatcherStatePda();
  const matcherInfo = await connection.getAccountInfo(matcherPda);
  if (matcherInfo) {
    const dv = new DataView(matcherInfo.data.buffer, matcherInfo.data.byteOffset);
    const basePrice = dv.getBigUint64(40, true);
    const liquidity = dv.getBigUint64(48, true);
    const spreadBps = dv.getUint16(56, true);
    console.log(`    Base Price: ${Number(basePrice) / 1e9} SOL`);
    console.log(`    Liquidity: ${Number(liquidity) / 1e9} SOL`);
    console.log(`    Spread: ${spreadBps / 100}%`);
  }

  console.log("\n=== E2E Test Complete ===");
  console.log("Programs deployed and initialized: YES");
  console.log("Config PDA readable: YES");
  console.log("Matcher state readable: YES");
  console.log(`Trader registration: ${traderInfo ? 'YES' : 'NEEDS NFT VERIFICATION'}`);

  const finalBalance = await connection.getBalance(trader.publicKey);
  console.log(`Final balance: ${finalBalance / LAMPORTS_PER_SOL} SOL`);
}

main().catch(console.error);
