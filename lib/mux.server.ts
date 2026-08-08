import Mux from "@mux/mux-node";

let client: Mux | null = null;

/** Server-only Mux client for cron cleanup — Studio uploads use secrets stored in Sanity. */
export function getMuxClient(): Mux {
  const tokenId = process.env.MUX_TOKEN_ID;
  const tokenSecret = process.env.MUX_TOKEN_SECRET;
  if (!tokenId || !tokenSecret) {
    throw new Error("MUX_TOKEN_ID and MUX_TOKEN_SECRET are required for server-side Mux operations");
  }
  if (!client) {
    client = new Mux({ tokenId, tokenSecret });
  }
  return client;
}

/** Deletes a Mux asset; treats 404 as success (already removed). */
export async function deleteMuxAsset(assetId: string): Promise<void> {
  try {
    await getMuxClient().video.assets.delete(assetId);
  } catch (err: unknown) {
    const status = (err as { status?: number })?.status;
    if (status === 404) return;
    throw err;
  }
}
