import { Link } from '@tanstack/react-router'
import { ChevronDown, Menu, X } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'

// Mirrors the Shopify "Main menu" (aiagencyxyz.myshopify.com).
export const SERVICES = [
  { label: 'AI Answering Agents', to: '/agents' },
  { label: 'AI-Enabled Websites', to: '/websites' },
  { label: 'AI Data Dashboards', to: '/dashboards' },
  { label: 'AI-Optimized Marketing', to: '/marketing' },
  { label: 'AI Strategy & Training', to: '/strategy' },
] as const

const NAV = [
  { label: 'Philosophy', to: '/philosophy' },
  { label: 'Store', to: '/store' },
  { label: 'Contact', to: '/contact' },
] as const

function ServicesMenu() {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  useEffect(() => {
    if (!open) return
    const close = (e: MouseEvent | KeyboardEvent) => {
      if (e instanceof KeyboardEvent ? e.key === 'Escape' : !ref.current?.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', close)
    document.addEventListener('keydown', close)
    return () => {
      document.removeEventListener('mousedown', close)
      document.removeEventListener('keydown', close)
    }
  }, [open])
  return (
    <div className="services" ref={ref}>
      <button type="button" className="navlink" aria-expanded={open} aria-controls="services-menu" onClick={() => setOpen(!open)}>
        Services <ChevronDown size={18} aria-hidden="true" />
      </button>
      {open && (
        <div id="services-menu" className="services-menu">
          {SERVICES.map((n) => (
            <Link key={n.to} to={n.to} className="navlink" onClick={() => setOpen(false)}>{n.label}</Link>
          ))}
        </div>
      )}
    </div>
  )
}

export function XyzHeader({ cta = { label: 'Book a call', to: '/book' } }: { cta?: { label: string; to: string; hash?: string } }) {
  const [open, setOpen] = useState(false)
  return (
    <header className="xyz xyz-header">
      <Link to="/" className="logo" aria-label="AI Agency XYZ home">
        <img src="/brand/logo-wordmark.webp" alt="AI Agency XYZ" width={260} height={40} />
      </Link>
      <nav aria-label="Main">
        <ServicesMenu />
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
          <p className="menu-label">Services</p>
          {SERVICES.map((n) => (
            <Link key={n.to} to={n.to} className="navlink" onClick={() => setOpen(false)}>{n.label}</Link>
          ))}
          <hr />
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
        {[...SERVICES, ...NAV].map((n) => (
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
