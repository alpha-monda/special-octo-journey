import { createFileRoute, Link } from '@tanstack/react-router'
import { AudioWaveform, BarChart3, Bell, Bot, CalendarCheck, ChevronDown, CircleCheck, Clock3, Download, Headphones, MoreHorizontal, PhoneCall, PlugZap, Search, Settings, Users } from 'lucide-react'

export const Route = createFileRoute('/dashboard')({ component: Dashboard })

const callRows = [
  { caller: 'Marisol G.', number: '(512) 555-0182', intent: 'New patient', agent: 'Alex · Main Line', duration: '03:42', outcome: 'Booked', status: 'positive' },
  { caller: 'David Chen', number: '(512) 555-0144', intent: 'Service quote', agent: 'Alex · Main Line', duration: '05:18', outcome: 'Qualified', status: 'positive' },
  { caller: 'Unknown', number: '(737) 555-0129', intent: 'Urgent repair', agent: 'Night Shift', duration: '02:51', outcome: 'Escalated', status: 'warning' },
  { caller: 'Lauren K.', number: '(512) 555-0198', intent: 'Reschedule', agent: 'Alex · Main Line', duration: '01:44', outcome: 'Resolved', status: 'neutral' },
  { caller: 'Thomas R.', number: '(737) 555-0166', intent: 'Billing question', agent: 'Billing Line', duration: '04:09', outcome: 'Review', status: 'warning' },
]

function Dashboard() {
  return (
    <div className="dashboard-shell">
      <aside className="dashboard-sidebar">
        <Link to="/" className="dashboard-brand"><span><PhoneCall /></span><b>AI AGENCY<br />XYZ</b></Link>
        <nav>
          <a className="active"><BarChart3 />Overview</a><a><PhoneCall />Calls</a><a><Bot />Agents</a><a><Users />Contacts</a><a><Headphones />Human review <em>3</em></a><a><PlugZap />Integrations</a>
        </nav>
        <div className="sidebar-bottom"><a><Settings />Settings</a><div className="user-chip"><span>JC</span><div><strong>Jamie Cole</strong><small>Growth plan</small></div><ChevronDown size={15} /></div></div>
      </aside>
      <main className="dashboard-main">
        <header className="dashboard-topbar"><div><h1>Good morning, Jamie.</h1><p>Here’s what your agents handled this week.</p></div><div className="dashboard-tools"><label><Search size={16} /><input placeholder="Search calls" /></label><button><Bell size={18} /><i /></button><button className="button button-dark button-small"><Download size={16} /> Export</button></div></header>
        <div className="demo-banner"><span>DEMO WORKSPACE</span><p>Showing realistic sample data. Connect Retell or import call records to populate your live workspace.</p><button><PlugZap size={16} /> Connect Retell</button></div>
        <section className="dashboard-stats">
          <article><div><span>Total calls</span><PhoneCall /></div><strong>1,284</strong><p><b>↑ 18.4%</b> vs. last month</p></article>
          <article><div><span>Answered</span><CircleCheck /></div><strong>98.7%</strong><p><b>↑ 2.1%</b> answer rate</p></article>
          <article><div><span>Appointments</span><CalendarCheck /></div><strong>247</strong><p><b>↑ 12.8%</b> booked</p></article>
          <article><div><span>Avg. duration</span><Clock3 /></div><strong>3m 42s</strong><p><em>↓ 8 sec</em> more efficient</p></article>
        </section>
        <section className="dashboard-grid">
          <article className="volume-card dashboard-card"><div className="card-heading"><div><span>Call volume</span><strong>386 calls</strong></div><button>This week <ChevronDown size={14} /></button></div><div className="dashboard-chart"><div className="chart-labels"><span>120</span><span>80</span><span>40</span><span>0</span></div><div className="chart-bars">{[['Mon',55],['Tue',72],['Wed',62],['Thu',88],['Fri',78],['Sat',37],['Sun',28]].map(([day, height]) => <div key={String(day)}><i style={{ height: `${height}%` }}><em>{height}</em></i><span>{day}</span></div>)}</div></div></article>
          <article className="outcome-card dashboard-card"><div className="card-heading"><div><span>Call outcomes</span><strong>Resolution mix</strong></div><MoreHorizontal /></div><div className="donut-wrap"><div className="donut"><span><strong>68%</strong>resolved</span></div><div className="donut-legend">{[['Resolved','68%'],['Qualified','17%'],['Escalated','10%'],['Other','5%']].map(([label, value], index) => <p key={label} className={`legend-${index}`}><i />{label}<strong>{value}</strong></p>)}</div></div></article>
        </section>
        <section className="calls-table-card dashboard-card"><div className="card-heading"><div><span>Recent conversations</span><strong>Latest call activity</strong></div><button>View all calls</button></div><div className="table-scroll"><table><thead><tr><th>Caller</th><th>Intent</th><th>Agent</th><th>Duration</th><th>Outcome</th><th /></tr></thead><tbody>{callRows.map(row => <tr key={row.number}><td><span className="caller-avatar"><AudioWaveform /></span><div><strong>{row.caller}</strong><small>{row.number}</small></div></td><td>{row.intent}</td><td>{row.agent}</td><td>{row.duration}</td><td><em className={`status ${row.status}`}>{row.outcome}</em></td><td><MoreHorizontal /></td></tr>)}</tbody></table></div></section>
      </main>
    </div>
  )
}
