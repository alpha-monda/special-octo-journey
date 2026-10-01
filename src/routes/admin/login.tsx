import { createFileRoute, useRouter } from '@tanstack/react-router'
import { useState } from 'react'
import { login } from '@/server/admin.functions'

export const Route = createFileRoute('/admin/login')({ component: AdminLogin })

function AdminLogin() {
  const router = useRouter()
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setBusy(true)
    setError('')
    try {
      const { ok } = await login({ data: { password } })
      if (!ok) return setError('Wrong password.')
      await router.navigate({ to: '/admin' })
    } catch {
      setError('Sign-in is not set up yet (ADMIN_PASSWORD is missing in Netlify).')
    } finally {
      setBusy(false)
    }
  }

  return (
    <form className="admin-card admin-login" onSubmit={submit}>
      <h1>Admin sign in</h1>
      <label><span>Password</span><input type="password" autoComplete="current-password" required value={password} onChange={(e) => setPassword(e.target.value)} /></label>
      {error && <p className="agent-error" role="alert">{error}</p>}
      <button className="button button-dark" disabled={busy}>{busy ? 'Signing in…' : 'Sign in'}</button>
    </form>
  )
}
