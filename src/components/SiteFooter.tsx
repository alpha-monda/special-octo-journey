import { Link } from '@tanstack/react-router'
import { ArrowUpRight, PhoneCall } from 'lucide-react'

export function SiteFooter() {
  return (
    <footer className="site-footer">
      <div className="footer-top">
        <div>
          <div className="brand-lockup footer-brand">
            <span className="brand-mark"><PhoneCall size={18} /></span>
            <span>AI AGENCY <b>XYZ</b></span>
          </div>
          <p>Human-aware AI answering agents for businesses that cannot afford to miss the call.</p>
        </div>
        <div className="footer-links">
          <Link to="/pricing">Pricing</Link>
          <Link to="/products">Products</Link>
          <Link to="/consulting">Consulting</Link>
          <Link to="/faq">FAQ</Link>
          <Link to="/dashboard">Dashboard <ArrowUpRight size={14} /></Link>
        </div>
      </div>
      <div className="footer-bottom">
        <span>© 2026 AI AGENCY XYZ</span>
        <span>Calls handled. Context kept. Opportunities captured.</span>
      </div>
    </footer>
  )
}
