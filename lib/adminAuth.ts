export const ADMIN_COOKIE = 'admin_session'

async function sha256(input: string): Promise<string> {
  const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(input))
  return Array.from(new Uint8Array(digest)).map(b => b.toString(16).padStart(2, '0')).join('')
}

export function isValidPassword(password: string): boolean {
  return password.length > 0 && password === process.env.ADMIN_PASSWORD
}

export async function expectedSessionToken(): Promise<string> {
  return sha256(`${process.env.ADMIN_PASSWORD ?? ''}:${ADMIN_COOKIE}`)
}

export async function isValidSessionToken(token: string | undefined): Promise<boolean> {
  if (!token) return false
  return token === (await expectedSessionToken())
}
