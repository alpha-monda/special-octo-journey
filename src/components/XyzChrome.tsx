import { Link } from '@tanstack/react-router'
import { Menu, X } from 'lucide-react'
import { useState } from 'react'

const NAV = [
  { label: 'Agents', to: '/agents' },
  { label: 'Strategy', to: '/strategy' },
  { label: 'Websites', to: '/websites' },
  { label: 'About', to: '/about' },
] as const

export function XyzHeader({ cta = { label: 'Book a call', to: '/book' } }: { cta?: { label: string; to: string; hash?: string } }) {
  const [open, setOpen] = useState(false)
  return (
    <header className="xyz xyz-header">
      <Link to="/" className="logo" aria-label="AI Agency XYZ home">
        <img src="/brand/logo-wordmark.webp" alt="AI Agency XYZ" width={260} height={40} />
      </Link>
      <nav aria-label="Main">
        {NAV.map((n) => (
          <Link key={n.to} to={n.to} className="navlink">{n.label}</Link>
        ))}
      </nav>
      <div className="actions">
        <Link to="/dashboard" className="navlink">Log in</Link>
        <Link to={cta.to} hash={cta.hash} className="pill sm">{cta.label}</Link>
      </div>
      <button type="button" className="menu-btn" aria-label={open ? 'Close menu' : 'Open menu'} aria-expanded={open} onClick={() => setOpen(!open)}>
        {open ? <X size={22} /> : <Menu size={22} />}
      </button>
      {open && (
        <nav className="mobile-menu" aria-label="Mobile">
          {NAV.map((n) => (
            <Link key={n.to} to={n.to} className="navlink" onClick={() => setOpen(false)}>{n.label}</Link>
          ))}
          <Link to="/dashboard" className="navlink" onClick={() => setOpen(false)}>Log in</Link>
          <Link to={cta.to} hash={cta.hash} className="pill sm" onClick={() => setOpen(false)}>{cta.label}</Link>
        </nav>
      )}
    </header>
  )
}

export function XyzFooter() {
  return (
    <footer className="xyz xyz-footer">
      <img src="/brand/logo-wordmark.webp" alt="AI Agency XYZ" width={220} height={34} loading="lazy" />
      <nav aria-label="Footer">
        {NAV.map((n) => (
          <Link key={n.to} to={n.to} className="navlink">{n.label}</Link>
        ))}
        <Link to="/dashboard" className="navlink">Log in</Link>
        <Link to="/privacy" className="navlink">Privacy</Link>
        <Link to="/terms" className="navlink">Terms</Link>
        <a className="navlink mail" href="mailto:hello@aiagencyxyz.com">hello@aiagencyxyz.com</a>
      </nav>
    </footer>
  )
}

export function CheckOrb() {
  return (
    <div className="orb-check" aria-hidden="true">
      <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="#080C1C" strokeWidth="3.2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M5 12.5l4.5 4.5L19 7.5" />
      </svg>
    </div>
  )
}
