import {
  Connection,
  Keypair,
  PublicKey,
  SystemProgram,
  Transaction,
  TransactionInstruction,
  sendAndConfirmTransaction,
} from "@solana/web3.js";
import * as fs from "fs";
import * as os from "os";
import * as path from "path";

const WRAPPER_PROGRAM_ID = new PublicKey(
  "4JnQKUWnJNsqwaS5cK5TpHfUcxSbrtuUTeW2hJSCpHeZ"
);
const MATCHER_PROGRAM_ID = new PublicKey(
  "6dhNb1YaguJpuUWWFihM9LvtFGHkK2wT59W1hb4VCyV1"
);
const WSOL_MINT = new PublicKey(
  "So11111111111111111111111111111111111111112"
);
const REGISTRY_PROGRAM = new PublicKey(
  "8oo48pya1SZD23ZhzoNMhxR2UGb8BRa41Su4qP9EuaWm"
);

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

function getConfigPda(): [PublicKey, number] {
  return PublicKey.findProgramAddressSync(
    [Buffer.from("percolator_config")],
    WRAPPER_PROGRAM_ID
  );
}

function getAuthorityPda(): [PublicKey, number] {
  return PublicKey.findProgramAddressSync(
    [Buffer.from("percolator_authority")],
    WRAPPER_PROGRAM_ID
  );
}

function getMatcherStatePda(): [PublicKey, number] {
  return PublicKey.findProgramAddressSync(
    [Buffer.from("matcher_state")],
    MATCHER_PROGRAM_ID
  );
}

async function main() {
  const walletPath = path.join(os.homedir(), ".config", "solana", "id.json");
  const secretKey = JSON.parse(fs.readFileSync(walletPath, "utf-8"));
  const admin = Keypair.fromSecretKey(Uint8Array.from(secretKey));

  const collection = Keypair.generate().publicKey;

  const connection = new Connection("http://localhost:8899", "confirmed");

  const [configPda] = getConfigPda();
  const [authorityPda] = getAuthorityPda();
  const [matcherStatePda] = getMatcherStatePda();

  console.log("=== Percolator Local Initialization ===\n");
  console.log("Wallet:          ", admin.publicKey.toBase58());
  console.log("Config PDA:      ", configPda.toBase58());
  console.log("Authority PDA:   ", authorityPda.toBase58());
  console.log("Matcher State PDA:", matcherStatePda.toBase58());
  console.log("Collection:      ", collection.toBase58());
  console.log();

  // Airdrop SOL to admin
  console.log("Airdropping 10 SOL to admin...");
  const sig = await connection.requestAirdrop(admin.publicKey, 10_000_000_000);
  await connection.confirmTransaction(sig, "confirmed");
  console.log("Airdrop OK");

  // Wrapper Initialize
  const wrapperInitIx = new TransactionInstruction({
    programId: WRAPPER_PROGRAM_ID,
    keys: [
      { pubkey: admin.publicKey, isSigner: true, isWritable: true },
      { pubkey: configPda, isSigner: false, isWritable: true },
      { pubkey: authorityPda, isSigner: false, isWritable: false },
      { pubkey: collection, isSigner: false, isWritable: false },
      { pubkey: WSOL_MINT, isSigner: false, isWritable: false },
      { pubkey: REGISTRY_PROGRAM, isSigner: false, isWritable: false },
      { pubkey: SystemProgram.programId, isSigner: false, isWritable: false },
    ],
    data: Buffer.concat([
      Buffer.from([0]),
      encodeU16(1000),
      encodeU64(BigInt(10_000_000)),
      encodeU64(BigInt(100_000)),
      encodeU64(BigInt(150)),
    ]),
  });

  console.log("Sending wrapper initialize...");
  try {
    const tx = new Transaction().add(wrapperInitIx);
    const s = await sendAndConfirmTransaction(connection, tx, [admin]);
    console.log("Wrapper initialize OK:", s);
  } catch (err: any) {
    if (err.message?.includes("already in use")) {
      console.log("Wrapper config already initialized, skipping.");
    } else {
      console.error("Wrapper initialize failed:", err.message || err);
      process.exit(1);
    }
  }

  // Matcher Initialize
  const matcherInitIx = new TransactionInstruction({
    programId: MATCHER_PROGRAM_ID,
    keys: [
      { pubkey: admin.publicKey, isSigner: true, isWritable: true },
      { pubkey: matcherStatePda, isSigner: false, isWritable: true },
      { pubkey: SystemProgram.programId, isSigner: false, isWritable: false },
    ],
    data: Buffer.concat([
      Buffer.from([0]),
      encodeU64(BigInt(100_000_000)),
      encodeU64(BigInt(1_000_000_000_000)),
      encodeU16(10),
    ]),
  });

  console.log("Sending matcher initialize...");
  try {
    const tx = new Transaction().add(matcherInitIx);
    const s = await sendAndConfirmTransaction(connection, tx, [admin]);
    console.log("Matcher initialize OK:", s);
  } catch (err: any) {
    if (err.message?.includes("already in use")) {
      console.log("Matcher state already initialized, skipping.");
    } else {
      console.error("Matcher initialize failed:", err.message || err);
      process.exit(1);
    }
  }

  console.log("\nDone. Both programs initialized on localhost.");
}

main().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
