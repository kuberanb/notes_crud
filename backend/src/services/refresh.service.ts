import { createHash, randomBytes, randomUUID } from "node:crypto";
import { pool } from "../db/pool.js";
import { createToken } from "./token.service.js";

const hashToken = (token: string) => createHash("sha256").update(token).digest("hex");
const generateToken = () => randomBytes(32).toString("hex");
const SESSION_DURATION = 7 * 24 * 60 * 60 * 1000;
const insertSession = "INSERT INTO refresh_tokens (token_hash,user_id,family_id,expires_at) VALUES ($1,$2,$3,$4)";
type Session = {
  user_id: number;
  family_id: string; // All tokens issued during one login belong to this family.
  expires_at: Date;
  revoked_at: Date | null;
};

export async function startSession(userId: number) {
  const refreshToken = generateToken();
  const expiresAt = new Date(Date.now() + SESSION_DURATION);
  // Store the hash; the actual token is sent to the user's cookie.
  await pool.query(
    insertSession,
    [hashToken(refreshToken), userId, randomUUID(), expiresAt],
  );
  return { refreshToken, expiresAt };
}

export async function useSession(token: unknown, logout = false) {
  if (typeof token !== "string" || !/^[a-f0-9]{64}$/.test(token)) return null;
  const tokenHash = hashToken(token);
  const lookup = await pool.query<Pick<Session, "family_id">>(
    "SELECT family_id FROM refresh_tokens WHERE token_hash = $1", [tokenHash],
  );
  const found = lookup.rows[0];
  if (!found) return null;

  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    // Serialize refresh/logout for the whole login, including replayed tokens.
    await client.query("SELECT pg_advisory_xact_lock(hashtext($1))", [found.family_id]);
    const query = await client.query<Session>(
      "SELECT * FROM refresh_tokens WHERE token_hash = $1 FOR UPDATE", [tokenHash],
    );
    const session = query.rows[0];

    if (!session || logout || session.revoked_at !== null || session.expires_at.getTime() <= Date.now()) {
      if (session) await client.query(
        "UPDATE refresh_tokens SET revoked_at = NOW() WHERE family_id = $1",
        [session.family_id],
      );
      await client.query("COMMIT");
      return null;
    }

    const refreshToken = generateToken();
    const accessToken = createToken(session.user_id);
    await client.query("UPDATE refresh_tokens SET revoked_at = NOW() WHERE token_hash = $1", [tokenHash]);
    await client.query(insertSession, [hashToken(refreshToken), session.user_id, session.family_id, session.expires_at]);
    await client.query("COMMIT");
    return { refreshToken, accessToken, expiresAt: session.expires_at };
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}
