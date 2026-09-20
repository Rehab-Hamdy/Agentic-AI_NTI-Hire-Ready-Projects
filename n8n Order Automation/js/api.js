import { CONFIG } from './config.js';

export async function submitOrder(orderData) {
  const payload = {
    session_id: CONFIG.SESSION_ID,
    customer: {
      name: orderData.customerInfo.name,
      phone: orderData.customerInfo.phone,
      address: orderData.customerInfo.address || ""
    },
    order_type: orderData.customerInfo.orderType,
    items: orderData.cart.map(entry => ({
      item_id: entry.item.id,
      name: entry.item.name,
      quantity: entry.quantity,
      price: entry.item.price
    })),
    total: orderData.total
  };

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 15000);

  try {
    console.log('[Order] Sending to:', CONFIG.N8N_WEBHOOK_URL);
    console.log('[Order] Payload:', JSON.stringify(payload, null, 2));

    const response = await fetch(CONFIG.N8N_WEBHOOK_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload),
      signal: controller.signal
    });
    
    clearTimeout(timeoutId);

    // Read raw text first to handle non-JSON responses
    const rawText = await response.text();
    console.log('[Order] Response status:', response.status);
    console.log('[Order] Response body:', rawText);

    // Try to parse as JSON
    let result;
    try {
      result = JSON.parse(rawText);
    } catch (parseError) {
      console.error('[Order] Response is not valid JSON:', rawText);
      return { 
        success: false, 
        error: 'UNKNOWN_ERROR', 
        message: 'The server returned an invalid response. Check the n8n workflow execution log.' 
      };
    }

    // Handle array response (n8n sometimes wraps in array)
    if (Array.isArray(result)) {
      result = result[0];
    }

    return result;
  } catch (error) {
    clearTimeout(timeoutId);
    console.error('[Order] Fetch error:', error.message);
    
    if (error.name === 'AbortError') {
      return { 
        success: false, 
        error: 'NETWORK_ERROR', 
        message: "Request timed out. Please try again." 
      };
    }
    return { 
      success: false, 
      error: 'NETWORK_ERROR', 
      message: "We couldn't connect to the restaurant. Please check your connection and try again." 
    };
  }
}
