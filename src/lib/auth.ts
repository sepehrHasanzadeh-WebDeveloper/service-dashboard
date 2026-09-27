export const AUTH_COOKIE_NAME = "dashboard_session";
export const SESSION_MAX_AGE = 7 * 60 * 60;

type SessionPayload = {
  username: string;
  expiresAt: number;
};

function getAuthSecret() {
  const secret = process.env.AUTH_SECRET?.trim();

  if (!secret) {
    throw new Error("AUTH_SECRET is not configured.");
  }

  return secret;
}

function bytesToBase64Url(bytes: Uint8Array) {
  let binary = "";

  for (const byte of bytes) binary += String.fromCharCode(byte);

  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}

function base64UrlToBytes(value: string) {
  const base64 = value.replace(/-/g, "+").replace(/_/g, "/");
  const padded = base64.padEnd(Math.ceil(base64.length / 4) * 4, "=");
  const binary = atob(padded);
  const bytes = new Uint8Array(binary.length);

  for (let index = 0; index < binary.length; index += 1) bytes[index] = binary.charCodeAt(index);

  return bytes;
}

function encodePayload(payload: SessionPayload) {
  return bytesToBase64Url(new TextEncoder().encode(JSON.stringify(payload)));
}

function decodePayload(value: string): SessionPayload | null {
  try {
    const payload = JSON.parse(new TextDecoder().decode(base64UrlToBytes(value))) as Partial<SessionPayload>;

    if (typeof payload.username !== "string" || typeof payload.expiresAt !== "number") return null;

    return { username: payload.username, expiresAt: payload.expiresAt };
  } catch {
    return null;
  }
}

async function importSigningKey() {
  return crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(getAuthSecret()),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign", "verify"],
  );
}

export async function createSessionToken(username: string) {
  const payload = encodePayload({
    username,
    expiresAt: Math.floor(Date.now() / 1000) + SESSION_MAX_AGE,
  });
  const signature = await crypto.subtle.sign("HMAC", await importSigningKey(), new TextEncoder().encode(payload));

  return `${payload}.${bytesToBase64Url(new Uint8Array(signature))}`;
}

export async function verifySessionToken(token?: string | null) {
  if (!token) return null;

  try {
    const [payload, encodedSignature] = token.split(".");

    if (!payload || !encodedSignature) return null;

    const isValidSignature = await crypto.subtle.verify(
      "HMAC",
      await importSigningKey(),
      base64UrlToBytes(encodedSignature),
      new TextEncoder().encode(payload),
    );

    if (!isValidSignature) return null;

    const session = decodePayload(payload);

    if (!session || session.expiresAt <= Math.floor(Date.now() / 1000)) return null;

    return session;
  } catch {
    return null;
  }
}

export async function isValidSessionToken(token?: string | null) {
  return Boolean(await verifySessionToken(token));
}

export function getDashboardCredentials() {
  return {
    username: process.env.DASHBOARD_USERNAME?.trim() ?? "",
    password: process.env.DASHBOARD_PASSWORD ?? "",
  };
}

export function safeStringEqual(left: string, right: string) {
  let difference = left.length ^ right.length;
  const length = Math.max(left.length, right.length);

  for (let index = 0; index < length; index += 1) {
    difference |= (left.charCodeAt(index) || 0) ^ (right.charCodeAt(index) || 0);
  }

  return difference === 0;
}
