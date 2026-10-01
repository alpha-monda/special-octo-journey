import { createHmac, timingSafeEqual } from 'node:crypto'
import { deleteCookie, getCookie, setCookie } from '@tanstack/react-start/server'

// Single-owner admin login. The password lives in the ADMIN_PASSWORD env var;
// the session is an HttpOnly cookie holding "<expiry>.<hmac>".

const COOKIE = 'xyz_admin'
const SESSION_MS = 12 * 60 * 60 * 1000

function secret() {
  const password = process.env.ADMIN_PASSWORD
  if (!password || password.length < 12) throw new Error('ADMIN_PASSWORD must be set (12+ characters)')
  return `admin-session:${password}`
}

function sign(value: string) {
  return createHmac('sha256', secret()).update(value).digest('hex')
}

function safeEqual(a: string, b: string) {
  const ab = Buffer.from(a)
  const bb = Buffer.from(b)
  return ab.length === bb.length && timingSafeEqual(ab, bb)
}

export async function adminLogin(password: string) {
  const expected = process.env.ADMIN_PASSWORD ?? ''
  if (!expected || !safeEqual(sign(password), sign(expected))) {
    // Slow down guessing.
    await new Promise((r) => setTimeout(r, 1000))
    return false
  }
  const expiry = String(Date.now() + SESSION_MS)
  setCookie(COOKIE, `${expiry}.${sign(expiry)}`, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: SESSION_MS / 1000,
  })
  return true
}

export function adminLogout() {
  deleteCookie(COOKIE, { path: '/' })
}

export function isAdmin() {
  const value = getCookie(COOKIE)
  if (!value || !process.env.ADMIN_PASSWORD) return false
  const [expiry, mac] = value.split('.')
  if (!expiry || !mac || Number(expiry) < Date.now()) return false
  return safeEqual(mac, sign(expiry))
}

export function requireAdmin() {
  if (!isAdmin()) throw new Error('Not signed in')
}
