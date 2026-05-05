import { useState, useEffect } from 'react';
import { withAuth } from '../lib/withAuth';

function Orders() {
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      fetch('/api/orders', {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      .then(res => res.json())
      .then(data => {
        if (data.orders) setOrders(data.orders);
      });
    }
  }, []);

  return (
    <div className="container">
      <h1 className="text-2xl font-bold mb-6">Meine Bestellungen</h1>
      {orders.length === 0 ? (
        <p>Keine Bestellungen gefunden.</p>
      ) : (
        orders.map(order => (
          <div key={order.id} className="border p-4 mb-4">
            <h2 className="font-semibold">Bestellung #{order.orderNumber}</h2>
            <p>Status: {order.status}</p>
            <p>Gesamt: {(order.totalCents / 100).toFixed(2)} {order.currency}</p>
            <p>Erstellt: {new Date(order.createdAt).toLocaleDateString()}</p>
            <div>
              <h3>Artikel:</h3>
              {order.items.map(item => (
                <div key={item.id} className="ml-4">
                  {item.title} - {(item.priceCents / 100).toFixed(2)} {order.currency} x {item.quantity}
                </div>
              ))}
            </div>
          </div>
        ))
      )}
    </div>
  );
}

export default withAuth(Orders);