import { useContext } from 'react'
import { CartContext } from '../../context/cart'
export default function ProductPage({ product }) {
  const { addItem } = useContext(CartContext)
  function addToCart(){ addItem({ productId: product.id, title: product.title, priceCents: product.priceCents, currency: product.currency||'EUR', quantity: 1 }); alert('Produkt zum Warenkorb hinzugefügt') }
  return (
    <div className="container">
      <h1 className="text-2xl font-bold">{product.title}</h1>
      <p className="mt-4">{product.description}</p>
      <div className="mt-6 font-bold">{(product.priceCents/100).toFixed(2)} {product.currency || 'EUR'}</div>
      <div className="mt-6 flex gap-3">
        <button onClick={addToCart} className="px-4 py-2 bg-gray-800 text-white rounded">In Warenkorb</button>
      </div>
    </div>
  )
}
ProductPage.getInitialProps = async ({ query }) => {
  const id = Number(query.id || 1)
  return { product: { id, title: 'Olivewood Item', description: 'Wunderschön verarbeitetes Olivenholz.', priceCents: 4990, currency: 'EUR' } }
}
