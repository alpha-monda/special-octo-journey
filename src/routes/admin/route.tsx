import { createFileRoute, Link, Outlet, redirect, useRouter } from '@tanstack/react-router'
import { LogOut, PhoneCall } from 'lucide-react'
import { getAdminSession, logout } from '@/server/admin.functions'

export const Route = createFileRoute('/admin')({
  head: () => ({ meta: [{ title: 'Admin | AI AGENCY XYZ' }, { name: 'robots', content: 'noindex, nofollow' }] }),
  beforeLoad: async ({ location }) => {
    if (location.pathname === '/admin/login') return
    const { signedIn } = await getAdminSession()
    if (!signedIn) throw redirect({ to: '/admin/login' })
  },
  component: AdminLayout,
})

function AdminLayout() {
  const router = useRouter()
  const signOut = async () => {
    await logout()
    await router.navigate({ to: '/admin/login' })
  }
  return (
    <div className="admin-shell">
      <header className="admin-header">
        <Link to="/admin" className="brand-lockup">
          <span className="brand-mark"><PhoneCall size={18} /></span>
          <span>AI AGENCY <b>XYZ</b> · admin</span>
        </Link>
        {router.state.location.pathname !== '/admin/login' && (
          <button type="button" className="text-link admin-signout" onClick={signOut}><LogOut size={15} /> Sign out</button>
        )}
      </header>
      <main className="admin-main"><Outlet /></main>
    </div>
  )
}
