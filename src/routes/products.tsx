import { createFileRoute } from '@tanstack/react-router'
import { ArrowUpRight, ShoppingBag } from 'lucide-react'
import { XyzFooter, XyzHeader } from '@/components/XyzChrome'

export const Route = createFileRoute('/products')({ component: Products })

const products = [
  { name: 'PLEASE HOLD / NEVER', type: 'Heavyweight tee', price: '$32', color: 'product-orange', art: 'PLEASE\nHOLD\n/ NEVER' },
  { name: 'HUMAN IN THE LOOP', type: 'Washed black tee', price: '$36', color: 'product-black', art: 'HUMAN\nIN THE\nLOOP' },
  { name: 'ANSWER EVERYTHING', type: 'Studio mug', price: '$22', color: 'product-cream', art: 'ANSWER\nEVERYTHING' },
  { name: 'GOOD CALLS ONLY', type: 'Canvas cap', price: '$28', color: 'product-blue', art: 'GOOD\nCALLS\nONLY' },
]

function Products() {
  return (
    <div className="page-shell cream-page">
      <XyzHeader />
      <main>
        <section className="subpage-hero product-hero">
          <p className="eyebrow"><ShoppingBag size={15} /> AI agency field goods</p>
          <h1>Wear the<br /><i>conversation.</i></h1>
          <p>Original AI AGENCY XYZ designs, produced on demand through Printify. Built for operators, automators, and people still willing to answer the phone.</p>
        </section>
        <section className="product-grid">
          {products.map((product, index) => (
            <article className="product-card" key={product.name}>
              <div className={`product-art ${product.color}`}>
                <span className="product-index">0{index + 1}</span>
                <strong>{product.art.split('\n').map(line => <span key={line}>{line}</span>)}</strong>
                <small>AI AGENCY XYZ™</small>
              </div>
              <div className="product-info"><div><h2>{product.name}</h2><p>{product.type}</p></div><div><strong>{product.price}</strong><button aria-label={`View ${product.name}`}><ArrowUpRight /></button></div></div>
            </article>
          ))}
        </section>
        <section className="shop-note"><span>PRINTED ON DEMAND</span><p>Storefront artwork and fulfillment hooks are ready for your final Printify catalog, designs, variants, and checkout links.</p></section>
      </main>
      <XyzFooter />
    </div>
  )
}
