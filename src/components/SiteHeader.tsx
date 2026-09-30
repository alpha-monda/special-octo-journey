import { Link } from '@tanstack/react-router'
import { Menu, PhoneCall, X } from 'lucide-react'
import { useState } from 'react'

const links = [
  { label: 'How it works', to: '/', hash: 'how-it-works' },
  { label: 'Talk to it', to: '/agent' },
  { label: 'Pricing', to: '/pricing' },
  { label: 'Products', to: '/products' },
  { label: 'Consulting', to: '/consulting' },
]

export function SiteHeader({ dark = false }: { dark?: boolean }) {
  const [open, setOpen] = useState(false)

  return (
    <header className={`site-header ${dark ? 'site-header-dark' : ''}`}>
      <Link to="/" className="brand-lockup" aria-label="AI Agency XYZ home">
        <span className="brand-mark"><PhoneCall size={18} /></span>
        <span>AI AGENCY <b>XYZ</b></span>
      </Link>
      <nav className="desktop-nav" aria-label="Primary navigation">
        {links.map((link) => (
          <Link key={link.label} to={link.to} hash={link.hash} className="nav-link">
            {link.label}
          </Link>
        ))}
      </nav>
      <div className="header-actions">
        <Link to="/dashboard" className="text-link">Client login</Link>
        <Link to="/consulting" className="button button-small button-dark">Build my agent</Link>
      </div>
      <button className="menu-button" onClick={() => setOpen(!open)} aria-label="Toggle menu">
        {open ? <X /> : <Menu />}
      </button>
      {open && (
        <nav className="mobile-nav" aria-label="Mobile navigation">
          {links.map((link) => (
            <Link key={link.label} to={link.to} hash={link.hash} onClick={() => setOpen(false)}>
              {link.label}
            </Link>
          ))}
          <Link to="/dashboard" onClick={() => setOpen(false)}>Client dashboard</Link>
        </nav>
      )}
    </header>
  )
}
