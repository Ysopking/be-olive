export default function handler(req, res) {
  res.json([
    { id: 1, title: 'Olivewood Board Small', description: 'Kleine Schneidbrett aus Olivenholz', priceCents: 2490, currency: 'EUR' },
    { id: 2, title: 'Olivewood Spoon', description: 'Handgefertigter Löffel', priceCents: 1990, currency: 'EUR' }
  ])
}
