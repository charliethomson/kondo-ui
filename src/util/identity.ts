// https://developer.mozilla.org/en-US/docs/Web/API/SubtleCrypto/digest#converting_a_digest_to_a_hex_string
export type Identity = string;
export async function getIdentity(context: string): Promise<Identity> {
  const msgUint8 = new TextEncoder().encode(context);
  const hashBuffer = await crypto.subtle.digest("SHA-256", msgUint8);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
  return hashHex;
}

export async function generateIdentities<T extends object>(
  ts: T[],
  withContext: (t: T) => string
): Promise<(T & { identity: string })[]> {
  return await Promise.all(
    ts.map(async (t) => ({ ...t, identity: await getIdentity(withContext(t)) }))
  );
}
