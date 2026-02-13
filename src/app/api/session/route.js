import { NextResponse } from "next/server";
import crypto from "crypto";

// ─── In-memory session store ────────────────────────────────────────────────
// Key: sessionId (string)  →  Value: { merchantId, authToken, createdAt }
// NOTE: This is ephemeral — sessions are lost on server restart.
//       Replace with Redis / DB for production use.
const sessions = new Map();

// Session TTL in milliseconds (15 minutes)
const SESSION_TTL_MS = 15 * 60 * 1000;

// ─── Helpers ────────────────────────────────────────────────────────────────

function generateSessionId() {
  return crypto.randomUUID();
}

/** Remove sessions that have exceeded their TTL. */
function pruneExpiredSessions() {
  const now = Date.now();
  for (const [id, data] of sessions) {
    if (now - data.createdAt > SESSION_TTL_MS) {
      sessions.delete(id);
    }
  }
}

/**
 * Return a consistent JSON error response.
 * @param {string} message  Human-readable error description
 * @param {number} status   HTTP status code
 */
function errorResponse(message, status = 400) {
  return NextResponse.json({ success: false, error: message }, { status });
}

// ─── POST  /api/session ─────────────────────────────────────────────────────
// Receives optional merchant_id and auth_token from an Android client,
// validates them (placeholder), creates a one-time session, and returns the
// session ID the client can use to access the KYC flow.
// ─────────────────────────────────────────────────────────────────────────────
export async function POST(request) {
  // 1. Parse the request body safely
  let body;
  try {
    body = await request.json();
  } catch {
    // Body is missing or not valid JSON — treat fields as absent
    body = {};
  }

  // 2. Extract & sanitise incoming fields
  const merchantId =
    typeof body.merchant_id === "string" ? body.merchant_id.trim() : null;
  const authToken =
    typeof body.auth_token === "string" ? body.auth_token.trim() : null;

  // ──────────────────────────────────────────────────────────────────────────
  // 3. *** PLACEHOLDER — Merchant / Token Validation ***
  //
  //    When the internal validation API is ready, replace the block below
  //    with an actual HTTP call, e.g.:
  //
  //    if (merchantId && authToken) {
  //      const res = await fetch("https://internal-api.example.com/validate", {
  //        method: "POST",
  //        headers: { "Content-Type": "application/json" },
  //        body: JSON.stringify({ merchant_id: merchantId, auth_token: authToken }),
  //      });
  //
  //      if (!res.ok) {
  //        return errorResponse("Invalid merchant credentials", 401);
  //      }
  //
  //      const validation = await res.json();
  //      if (!validation.valid) {
  //        return errorResponse("Merchant authentication failed", 403);
  //      }
  //    }
  //
  //    For now we accept any request and issue a session.
  // ──────────────────────────────────────────────────────────────────────────

  // 4. Prune stale sessions before creating a new one
  pruneExpiredSessions();

  // 5. Create a new session
  const sessionId = generateSessionId();
  sessions.set(sessionId, {
    merchantId,
    authToken,
    createdAt: Date.now(),
  });

  // 6. Return the session ID to the caller
  return NextResponse.json(
    {
      success: true,
      session_id: sessionId,
      message: "Session created. Use this session_id to access the KYC flow.",
    },
    { status: 201 },
  );
}

// ─── GET  /api/session?session_id=<id> ──────────────────────────────────────
// Returns the session data as JSON and then deletes the session (one-time use).
// ─────────────────────────────────────────────────────────────────────────────
export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const sessionId = searchParams.get("session_id");

  // 1. Validate the query parameter
  if (!sessionId || typeof sessionId !== "string" || !sessionId.trim()) {
    return errorResponse("Missing or empty 'session_id' query parameter", 400);
  }

  // 2. Prune expired sessions first
  pruneExpiredSessions();

  // 3. Look up the session
  const sessionData = sessions.get(sessionId.trim());

  if (!sessionData) {
    return errorResponse(
      "Session not found. It may have expired or already been used.",
      404,
    );
  }

  // 4. Delete after retrieval (one-time use)
  sessions.delete(sessionId.trim());

  // 5. Return session data (exclude the raw auth token for safety)
  return NextResponse.json(
    {
      success: true,
      session: {
        session_id: sessionId.trim(),
        merchant_id: sessionData.merchantId,
        created_at: new Date(sessionData.createdAt).toISOString(),
      },
    },
    { status: 200 },
  );
}
