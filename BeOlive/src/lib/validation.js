export function validateProduct(data) {
  const errors = [];
  if (!data.title || data.title.length < 3) errors.push('Title must be at least 3 characters');
  if (!data.slug || !/^[a-z0-9-]+$/.test(data.slug)) errors.push('Slug must be lowercase alphanumeric with dashes');
  if (data.priceCents === undefined || data.priceCents < 0) errors.push('Price must be non-negative');
  if (data.stock === undefined || data.stock < 0) errors.push('Stock must be non-negative');
  return errors;
}

export function validateOrder(data) {
  const errors = [];
  if (!data.email || !/\S+@\S+\.\S+/.test(data.email)) errors.push('Valid email required');
  if (!data.shippingAddress) errors.push('Shipping address required');
  if (!data.items || data.items.length === 0) errors.push('Order must have items');
  return errors;
}

export function sanitizeString(str) {
  return str ? str.trim().replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '') : '';
}