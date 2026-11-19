/**
 * Server-only Whop API helpers. Never imported by client code (the `.server`
 * suffix makes the bundler enforce that). When hosted on Whop, requests to
 * WHOP_API_ORIGIN are signed by an outbound proxy (the key never reaches code);
 * locally, `whop apps dev` injects a short-lived WHOP_API_KEY.
 */
import { site } from '../site.config'

const API_VERSION = '2026-11-10-1'

export class WhopError extends Error {
  status: number
  constructor(status: number, message: string) {
    super(message)
    this.status = status
  }
}

function env(name: string): string | undefined {
  return (typeof process !== 'undefined' ? process.env?.[name] : undefined) || undefined
}

const isSandbox = site.whop.environment === 'sandbox'

export function accountId(): string {
  // In sandbox the hosting runtime's WHOP_ACCOUNT_ID is the *production* business: ignore it.
  return (isSandbox ? undefined : env('WHOP_ACCOUNT_ID')) || site.whop.accountId
}

export async function whop<T = any>(
  method: 'GET' | 'POST' | 'PATCH' | 'DELETE',
  path: string,
  body?: unknown,
  idempotencyKey?: string,
): Promise<T> {
  // Hosted on Whop: an outbound proxy signs requests to WHOP_API_ORIGIN, so no key is visible here.
  // Local `whop apps dev`: a short-lived WHOP_API_KEY is injected instead.
  // Sandbox is a separate Whop with its own keys; the hosting proxy only signs production
  // calls, so in sandbox mode we send the key from the WHOP_SANDBOX_API_KEY secret ourselves.
  const key = isSandbox ? env('WHOP_SANDBOX_API_KEY') : env('WHOP_API_KEY')
  const origin = isSandbox ? 'https://sandbox-api.whop.com' : env('WHOP_API_ORIGIN') || 'https://api.whop.com'
  if (isSandbox && !key) throw new WhopError(500, 'Sandbox mode needs the WHOP_SANDBOX_API_KEY secret.')
  const res = await fetch(`${origin}/api/v1${path}`, {
    method,
    headers: {
      ...(key ? { Authorization: `Bearer ${key}` } : {}),
      'Content-Type': 'application/json',
      // Pin the API version so behaviour never changes underneath the template.
      'Api-Version-Date': API_VERSION,
      ...(idempotencyKey ? { 'Idempotency-Key': idempotencyKey } : {}),
    },
    body: body === undefined ? undefined : JSON.stringify(body),
  })
  const text = await res.text()
  let json: any = null
  try {
    json = text ? JSON.parse(text) : null
  } catch {
    /* non-JSON error body */
  }
  if (!res.ok) {
    const msg = json?.error?.message || json?.message || text || res.statusText
    throw new WhopError(res.status, `Whop API ${method} ${path} → ${res.status}: ${String(msg).slice(0, 300)}`)
  }
  return json as T
}

/** Constant-time-ish passcode check for the staff-only invoice console. */
export function assertAdmin(passcode: string) {
  const expected = env('ADMIN_PASSCODE')
  if (!expected) {
    throw new WhopError(
      503,
      'Staff console is disabled: set the ADMIN_PASSCODE app secret to enable it (see README).',
    )
  }
  if (passcode.length !== expected.length) throw new WhopError(401, 'Wrong passcode.')
  let diff = 0
  for (let i = 0; i < expected.length; i++) diff |= passcode.charCodeAt(i) ^ expected.charCodeAt(i)
  if (diff !== 0) throw new WhopError(401, 'Wrong passcode.')
}
