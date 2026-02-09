#!/bin/bash
SRC="../percolator-8004/sdk/src"
DST="src/lib/solana/sdk"

for f in constants.ts types.ts pda.ts serialization.ts accounts.ts instructions.ts index.ts; do
  cp "$SRC/$f" "$DST/$f"
  echo "  synced $f"
done
echo "SDK sync complete."
