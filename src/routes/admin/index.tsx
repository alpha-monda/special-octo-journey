import { createFileRoute, Link } from '@tanstack/react-router'
import { Plus } from 'lucide-react'
import { formatPhone } from '@/lib/format'
import { getCustomers } from '@/server/admin.functions'

export const Route = createFileRoute('/admin/')({
  loader: () => getCustomers(),
  component: AdminHome,
})

function AdminHome() {
  const customers = Route.useLoaderData()
  return (
    <>
      <div className="admin-title-row">
        <h1>Customers</h1>
        <Link to="/admin/new" className="button button-dark button-small"><Plus size={16} /> New customer</Link>
      </div>
      {customers.length === 0 ? (
        <div className="admin-card admin-empty">
          <p>No customers yet. Create the first one. The agent and phone number are set up automatically.</p>
        </div>
      ) : (
        <div className="admin-card admin-table-wrap">
          <table className="admin-table">
            <thead><tr><th>Business</th><th>Plan</th><th>Status</th><th>AI number</th><th>Created</th></tr></thead>
            <tbody>
              {customers.map((c) => (
                <tr key={c.id}>
                  <td><Link to="/admin/customers/$id" params={{ id: String(c.id) }} className="text-link">{c.name}</Link></td>
                  <td>{c.plan}</td>
                  <td><span className={`admin-status status-${c.status}`}>{c.status.replace('_', ' ')}</span></td>
                  <td>{formatPhone(c.phoneNumber)}</td>
                  <td>{new Date(c.createdAt).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  )
}
