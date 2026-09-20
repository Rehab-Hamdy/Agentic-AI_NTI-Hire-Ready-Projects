// Egyptian mobile: starts with 010, 011, 012, or 015, followed by 8 digits = 11 digits total
export function validatePhone(phone) {
  const cleaned = phone.replace(/\s+/g, '').trim();
  const regex = /^01[0125]\d{8}$/;
  if (!cleaned) {
    return { valid: false, message: 'Phone number is required.' };
  }
  if (!regex.test(cleaned)) {
    return { valid: false, message: 'Please enter a valid Egyptian mobile number. Example: 01012345678' };
  }
  return { valid: true, message: '', cleaned };
}

export function validateName(name) {
  const trimmed = name.trim();
  if (!trimmed) {
    return { valid: false, message: 'Full name is required.' };
  }
  if (trimmed.length < 2) {
    return { valid: false, message: 'Name must be at least 2 characters.' };
  }
  return { valid: true, message: '', cleaned: trimmed };
}

export function validateAddress(address) {
  const trimmed = address.trim();
  if (!trimmed) {
    return { valid: false, message: 'Delivery address is required.' };
  }
  if (trimmed.length < 5) {
    return { valid: false, message: 'Please enter a complete address.' };
  }
  return { valid: true, message: '', cleaned: trimmed };
}

export function validateOrder(cart) {
  if (!cart || cart.length === 0) {
    return { valid: false, message: 'Your cart is empty.' };
  }
  for (const entry of cart) {
    if (!entry.item.available) {
      return { valid: false, message: `${entry.item.name} is no longer available.` };
    }
    if (entry.quantity < 1) {
      return { valid: false, message: `Invalid quantity for ${entry.item.name}.` };
    }
  }
  return { valid: true, message: '' };
}
