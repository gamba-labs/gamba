import rawIdl from "./idl/multiplayer.json" with { type: "json" };

type IdlError = { code: number; name: string; msg: string };

export const ERROR_MAP = new Map<number, IdlError>(
  // @ts-ignore: IDL shape includes errors
  (rawIdl as any).errors.map((e: IdlError) => [e.code, e]),
);

export function decodeAnchorError(err: unknown): string | null {
  if (err && typeof err === "object" && "code" in err) {
    const maybe = ERROR_MAP.get(Number((err as any).code));
    if (maybe) return `${maybe.name} (${maybe.code}): ${maybe.msg}`;
  }

  if (typeof err === "string") {
    const m = err.match(/custom program error: 0x([0-9a-f]+)/i);
    if (m) {
      const code  = parseInt(m[1], 16);
      const maybe = ERROR_MAP.get(code);
      if (maybe) return `${maybe.name} (${maybe.code}): ${maybe.msg}`;
    }
  }

  return null;
}
   