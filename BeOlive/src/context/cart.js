import { createContext, useEffect, useState } from 'react'
export const CartContext = createContext({})
export function CartProvider({ children }) {
  const [items, setItems] = useState([])
  useEffect(()=>{ try { const raw = localStorage.getItem('cart_v1'); if(raw) setItems(JSON.parse(raw)) } catch(e){} }, [])
  useEffect(()=>{ try{ localStorage.setItem('cart_v1', JSON.stringify(items)) }catch(e){} }, [items])
  function addItem(item) { setItems(curr=>{ const idx = curr.findIndex(i=>i.productId===item.productId); if(idx>=0){ const copy=[...curr]; copy[idx].quantity += item.quantity||1; return copy } return [...curr, {...item, quantity: item.quantity||1}] }) }
  function removeItem(productId){ setItems(curr=>curr.filter(i=>i.productId!==productId)) }
  function updateQuantity(productId, qty){ setItems(curr=>curr.map(i=> i.productId===productId ? {...i, quantity: qty} : i)) }
  function clear(){ setItems([]) }
  const totalCents = items.reduce((s,it)=> s + (it.priceCents||0)*(it.quantity||1), 0)
  return <CartContext.Provider value={{ items, addItem, removeItem, updateQuantity, clear, totalCents }}>{children}</CartContext.Provider>
}
