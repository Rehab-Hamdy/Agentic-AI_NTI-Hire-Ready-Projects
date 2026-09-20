// Restaurant configuration
// ─────────────────────────────────────────────────
// After importing n8n-workflow.json into n8n:
//
// 1. Open the workflow in n8n
// 2. Click the "Webhook" node
// 3. Copy the URL shown (Test URL or Production URL)
// 4. Paste it below replacing 'YOUR_N8N_WEBHOOK_URL'
//
// Examples:
//   Test:       http://localhost:5678/webhook-test/order
//   Production: http://localhost:5678/webhook/order
//   Cloud:      https://your-n8n.app.n8n.cloud/webhook/order
// ─────────────────────────────────────────────────

export const CONFIG = {
  RESTAURANT_NAME: 'Flavour House',
  CURRENCY_SYMBOL: '$',
  N8N_WEBHOOK_URL: 'https://rehabhamdy.app.n8n.cloud/webhook/order',
  SESSION_ID: crypto.randomUUID(),
};
