import { useContext } from 'react'
import { CartContext } from '../../context/cart'
import prisma from '../../lib/prisma'

export default function ProductPage({ product }) {
  const { addItem } = useContext(CartContext)
  if (!product) return <div className="container"><p>Produkt nicht gefunden</p></div>
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
  const id = Number(query.id)
  if (!id) return { product: null }
  try {
    const product = await prisma.product.findUnique({
      where: { id }
    })
    return { product }
  } catch (error) {
    console.error('Product fetch error:', error)
    return { product: null }
  }
}
