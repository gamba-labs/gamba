import type { web3 } from "@coral-xyz/anchor";

/** Pretty-print an instruction’s account list (dev only). */
export function dumpIx(ix: web3.TransactionInstruction, label = "ix"): void {
  if (process.env.NODE_ENV === "production") return;   // stripped by tree-shaking

  console.groupCollapsed(`%c${label}`, "color:#888");
  ix.keys.forEach((k, i) =>
    console.log(
      i.toString().padStart(2, " "),
      k.pubkey.toBase58(),
      k.isSigner ? "signer" : "",
      k.isWritable ? "writable" : "",
    ),
  );
  console.groupEnd();
}
