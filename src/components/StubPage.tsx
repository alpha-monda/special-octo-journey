import { Link } from '@tanstack/react-router'
import { XyzFooter, XyzHeader } from '@/components/XyzChrome'

// Placeholder for nav destinations that aren't designed yet. Honest "coming
// soon" copy only: no invented content.
export function StubPage({ eyebrow, title, accent, body, children }: { eyebrow: string; title: string; accent?: string; body: string; children?: React.ReactNode }) {
  return (
    <div className="xyz">
      <XyzHeader />
      <main className="stub">
        <p className="eyebrow" style={{ color: 'var(--x-orange)' }}>{eyebrow}</p>
        <h1 className="disp h-lg">
          {title} {accent && <em style={{ color: 'var(--x-orange)' }}>{accent}</em>}
        </h1>
        <p className="copy" style={{ maxWidth: 720 }}>{body}</p>
        {children ?? (
          <div className="btn-row">
            <a className="pill" href="mailto:hello@aiagencyxyz.com">Email us</a>
            <Link to="/agents" className="puff white">See AI agents</Link>
          </div>
        )}
      </main>
      <XyzFooter />
    </div>
  )
}
