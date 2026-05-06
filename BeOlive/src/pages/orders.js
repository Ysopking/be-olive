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
    <div className="min-h-screen bg-white">
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-light text-gray-900 mb-12 tracking-tight">Meine Bestellungen</h1>

          {orders.length === 0 ? (
            <div className="text-center py-24">
              <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h2 className="text-2xl font-light text-gray-900 mb-4">Noch keine Bestellungen</h2>
              <p className="text-gray-600 mb-8">Ihre Bestellhistorie wird hier angezeigt</p>
              <a href="/" className="inline-block bg-black text-white px-8 py-3 rounded-full font-medium hover:bg-gray-800 transition-colors duration-200">
                Shoppen beginnen
              </a>
            </div>
          ) : (
            <div className="space-y-6">
              {orders.map(order => (
                <div key={order.id} className="bg-white border border-gray-200 rounded-3xl p-8 shadow-sm">
                  <div className="flex items-start justify-between mb-6">
                    <div>
                      <h2 className="text-xl font-semibold text-gray-900 mb-1">
                        Bestellung #{order.orderNumber}
                      </h2>
                      <p className="text-gray-600 text-sm">
                        {new Date(order.createdAt).toLocaleDateString('de-DE', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </p>
                    </div>
                    <div className="text-right">
                      <div className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${
                        order.status === 'completed' ? 'bg-green-100 text-green-800' :
                        order.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {order.status === 'completed' ? 'Abgeschlossen' :
                         order.status === 'pending' ? 'Ausstehend' : order.status}
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4 mb-6">
                    {order.items.map(item => (
                      <div key={item.id} className="flex items-center justify-between py-3 border-b border-gray-100 last:border-b-0">
                        <div className="flex-1">
                          <h3 className="font-medium text-gray-900">{item.title}</h3>
                          <p className="text-sm text-gray-600">
                            {(item.priceCents / 100).toFixed(2)} € × {item.quantity}
                          </p>
                        </div>
                        <div className="text-right">
                          <span className="font-semibold text-gray-900">
                            {(item.priceCents * item.quantity / 100).toFixed(2)} €
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="flex justify-between items-center pt-4 border-t border-gray-200">
                    <span className="text-lg font-semibold text-gray-900">Gesamt</span>
                    <span className="text-2xl font-bold text-gray-900">
                      {(order.totalCents / 100).toFixed(2)} €
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default withAuth(Orders);