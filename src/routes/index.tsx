import { createFileRoute, Link } from '@tanstack/react-router'
import { XyzFooter, XyzHeader } from '@/components/XyzChrome'

export const Route = createFileRoute('/')({ component: Home })

const OFFERS = [
  { to: '/agents', img: '/brand/obj-agents-headphones.webp', alt: 'AI Answering Agents', tag: 'Never miss a call again.', price: 'from $29/mo' },
  { to: '/strategy', img: '/brand/obj-strategy-mug.webp', alt: 'AI Strategy & Training', tag: 'Find the wins. Train your team.' },
  { to: '/websites', img: '/brand/obj-websites-mouse.webp', alt: 'AI-Enabled Websites', tag: 'Sites that answer, book, and sell.' },
] as const

const EXPERIENCE = ['B2C', 'B2B', 'Retail', 'E-commerce', 'Dropship', 'Marketing', 'Agentic AI', 'MCP']

function Home() {
  return (
    <div className="xyz">
      <XyzHeader />
      <main>
        <section id="offers" className="triptych">
          <h1 className="sr-only">AI Agency XYZ: AI answering agents, AI strategy and training, and AI-enabled websites</h1>
          {OFFERS.map((o, i) => (
            <Link key={o.to} to={o.to} className="float-obj">
              <img src={o.img} alt={o.alt} width={380} height={380} fetchPriority={i === 0 ? 'high' : undefined} />
              <p className="tag">{o.tag}</p>
              {'price' in o && <p className="price">{o.price}</p>}
              <span className="learn">Learn more →</span>
            </Link>
          ))}
        </section>

        <section id="why" className="section why">
          <div className="why-copy">
            <p className="eyebrow" style={{ color: 'var(--x-gold)' }}>Why XYZ</p>
            <h2 className="disp h-xl" style={{ color: 'var(--x-white)' }}>
              Solve for <em style={{ color: 'var(--x-tangerine)' }}>x, y &amp; z.</em>
            </h2>
            <p className="lead" style={{ color: 'var(--x-white)' }}>The variables that take your business to the next level.</p>
            <Link to="/book" className="pill">Book a call</Link>
          </div>
          <AxisGraphic />
        </section>

        <section id="about" className="section split">
          <div className="split-copy">
            <p className="eyebrow" style={{ color: 'var(--x-orange)' }}>About us</p>
            <h2 className="disp h-lg">
              Human-centered. <em style={{ color: 'var(--x-orange)' }}>AI-supported.</em>
            </h2>
            <p className="copy">We design around your people. AI does the heavy lifting.</p>
            <p className="copy">We fill the slot. We don't replace your team.</p>
            <p className="copy">Map the work. Cut the waste. Automate the rest.</p>
          </div>
          <div className="quilt" style={{ flexGrow: 1, padding: 48, background: 'var(--x-gold)', color: 'var(--x-midnight)', display: 'flex', flexDirection: 'column', gap: 24 }}>
            <p className="eyebrow">Where we've done the work</p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 14 }}>
              {EXPERIENCE.map((e) => <span key={e} className="chip">{e}</span>)}
            </div>
          </div>
        </section>

        <section id="book" className="section" style={{ paddingTop: 0 }}>
          <div className="quilt dk cta-panel">
            <h2 className="disp">Ready to solve for <em style={{ color: 'var(--x-gold)' }}>XYZ?</em></h2>
            <Link to="/book" className="pill">Book a call</Link>
          </div>
        </section>
      </main>
      <XyzFooter />
    </div>
  )
}

// The 3D x/y/z axis from the design, rebuilt as inline SVG + positioned HTML labels.
function AxisGraphic() {
  return (
    <div className="axis" role="img" aria-label="X is time: hours back from busywork. Y is know-how: a team fluent in AI. Z is growth: more leads and more sales. Together they move you from today to the next level.">
      <svg width="680" height="640" viewBox="0 0 680 640" fill="none" aria-hidden="true">
        <defs>
          <marker id="xyz-ah" viewBox="0 0 10 10" refX="7" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
            <path d="M0 0 L10 5 L0 10 z" fill="#FFFFFF" />
          </marker>
        </defs>
        <g stroke="#FFFFFF" strokeWidth="5" strokeLinecap="round" markerEnd="url(#xyz-ah)">
          <line x1="300" y1="340" x2="570" y2="496" />
          <line x1="300" y1="340" x2="300" y2="40" />
          <line x1="300" y1="340" x2="90" y2="461" />
        </g>
        <g stroke="#F4B448" strokeWidth="3" strokeDasharray="4 10" strokeLinecap="round">
          <line x1="416" y1="288" x2="416" y2="528" />
          <line x1="416" y1="528" x2="521" y2="468" />
          <line x1="416" y1="528" x2="195" y2="400" />
        </g>
        <path d="M300 340 Q 340 278 382 298" stroke="#F28C38" strokeWidth="4" strokeDasharray="2 9" strokeLinecap="round" />
      </svg>
      <div aria-hidden="true">
        <div className="orb" style={{ left: 286, top: 326, width: 28, height: 28, background: 'radial-gradient(circle at 34% 30%, #E4E8EA 0%, #7C868A 45%, #343A3E 100%)' }} />
        <div style={{ position: 'absolute', left: 182, top: 320, fontSize: 16, fontWeight: 800, letterSpacing: '.14em', textTransform: 'uppercase', color: '#E8E9EA' }}>Today</div>
        <div className="orb" style={{ left: 382, top: 254, width: 68, height: 68, background: 'radial-gradient(circle at 34% 30%, #FCD8C4 0%, #F4845C 30%, #EA622C 62%, #B8481C 100%)' }} />
        <div style={{ position: 'absolute', left: 460, top: 236, padding: '10px 20px', borderRadius: 999, background: '#FFFFFF', color: '#4C5458', fontSize: 17, fontWeight: 800, letterSpacing: '.12em', textTransform: 'uppercase', boxShadow: 'inset 0 -5px 8px rgba(76,84,88,.18), inset 0 4px 6px rgba(255,255,255,.95), 0 14px 22px -10px rgba(0,0,0,.4)' }}>Next level</div>
        <AxisChip letter="X" title="Time" sub="Hours back from busywork." style={{ right: 0, top: 548 }} />
        <AxisChip letter="Y" title="Know-how" sub="A team fluent in AI." style={{ left: 328, top: 34 }} />
        <AxisChip letter="Z" title="Growth" sub="More leads. More sales." style={{ left: 0, top: 482 }} />
      </div>
    </div>
  )
}

function AxisChip({ letter, title, sub, style }: { letter: string; title: string; sub: string; style: React.CSSProperties }) {
  return (
    <div className="axis-chip" style={style}>
      <span className="disp letter">{letter}</span>
      <span className="t"><b>{title}</b><span>{sub}</span></span>
    </div>
  )
}
