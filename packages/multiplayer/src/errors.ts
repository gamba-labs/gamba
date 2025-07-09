/* ──────────────────────────────────────────────────────────────
   errors.ts – translate Anchor custom‑program error codes into
               human‑readable messages.
   Generated straight from the `errors` array in the IDL – keep
   the file in‑sync whenever you regenerate the IDL.
   ───────────────────────────────────────────────────────────── */

   import rawIdl from "./idl/multiplayer.json" with { type: "json" };

   /* ------------------------------------------------------------------ */
   /*  Types & lookup table                                               */
   /* ------------------------------------------------------------------ */
   type IdlError = { code: number; name: string; msg: string };
   
   export const ERROR_MAP = new Map<number, IdlError>(
     // @ts‑ignore  – rawIdl is `any`; it certainly has `.errors`
     (rawIdl as any).errors.map((e: IdlError) => [e.code, e]),
   );
   
   /* ------------------------------------------------------------------ */
   /*  Helper – returns prettified message *or* null if not ours          */
   /* ------------------------------------------------------------------ */
   export function decodeAnchorError(err: unknown): string | null {
     /* 1. Anchor/ProgramError objects (have a numeric `code`) */
     if (err && typeof err === "object" && "code" in err) {
       const maybe = ERROR_MAP.get(Number((err as any).code));
       if (maybe) return `${maybe.name} (${maybe.code}): ${maybe.msg}`;
     }
   
     /* 2. RPC text e.g. `"custom program error: 0xbbc"` */
     if (typeof err === "string") {
       const m = err.match(/custom program error: 0x([0-9a-f]+)/i);
       if (m) {
         const code  = parseInt(m[1], 16);
         const maybe = ERROR_MAP.get(code);
         if (maybe) return `${maybe.name} (${maybe.code}): ${maybe.msg}`;
       }
     }
   
     return null; // not a Gamba error
   }
   