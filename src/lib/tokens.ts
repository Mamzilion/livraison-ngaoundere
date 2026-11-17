import { createHash } from "node:crypto";

/** On ne stocke jamais le lien en clair : seulement son empreinte SHA-256. */
export function hashToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}
