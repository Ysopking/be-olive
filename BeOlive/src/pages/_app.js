import '../styles/globals.css'
import { CartProvider } from '../context/cart'
import Footer from '../components/Footer'

export default function App({ Component, pageProps }) {
  return (
    <CartProvider>
      <Component {...pageProps} />
      <Footer />
    </CartProvider>
  )
}
