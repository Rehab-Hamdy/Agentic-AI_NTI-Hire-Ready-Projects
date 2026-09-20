# n8n Backend API Contract

This document defines the API contract between the Flavour House frontend and the n8n workflow backend.

---

## Overview

```
Frontend (Browser)
   │
   ├── POST (JSON)
   │
   ▼
n8n Webhook (Trigger Node)
   │
   ├── Validate request
   ├── Fetch menu from Google Sheets / DB
   ├── Validate items & phone
   ├── Calculate total (server-side)
   ├── Generate order ID
   ├── Save order
   ├── Notify kitchen
   │
   ▼
JSON Response → Frontend
```

---

## Webhook Endpoint

| Property | Value |
|----------|-------|
| **Method** | `POST` |
| **URL** | Configured in `js/config.js` as `N8N_WEBHOOK_URL` |
| **Content-Type** | `application/json` |
| **Authentication** | None (or add API key header if needed) |

---

## Request Payload

```json
{
  "session_id": "550e8400-e29b-41d4-a716-446655440000",
  "customer": {
    "name": "Ahmed Ali",
    "phone": "01012345678",
    "address": "Nasr City, Cairo"
  },
  "order_type": "delivery",
  "items": [
    {
      "item_id": 1,
      "name": "Classic Burger",
      "quantity": 2,
      "price": 8
    },
    {
      "item_id": 3,
      "name": "French Fries",
      "quantity": 1,
      "price": 4
    }
  ],
  "total": 20
}
```

### Field Descriptions

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `session_id` | string (UUID) | Yes | Unique browser session identifier |
| `customer.name` | string | Yes | Customer's full name (min 2 chars) |
| `customer.phone` | string | Yes | Egyptian mobile number (11 digits, starts with 010/011/012/015) |
| `customer.address` | string | Delivery only | Delivery address (required when `order_type` is `"delivery"`) |
| `order_type` | string | Yes | Either `"pickup"` or `"delivery"` |
| `items` | array | Yes | Non-empty array of order items |
| `items[].item_id` | number | Yes | Menu item ID from the database |
| `items[].name` | string | Yes | Item name (for reference only) |
| `items[].quantity` | number | Yes | Quantity ordered (min 1) |
| `items[].price` | number | Yes | Frontend price (for reference only — **DO NOT trust**) |
| `total` | number | Yes | Frontend-calculated total (for reference only — **DO NOT trust**) |

> ⚠️ **Important**: The backend must NOT use the frontend `price` or `total` values for billing. Always recalculate from the server-side menu data.

---

## n8n Workflow Steps

The n8n workflow should implement the following steps:

### 1. Webhook Trigger
- Receive the POST request
- Parse the JSON body

### 2. Session Identification
- Log the `session_id` for tracking
- Check for duplicate submissions (optional: rate limiting)

### 3. Retrieve Current Menu
- Fetch the current menu from Google Sheets or database
- This is the source of truth for item availability and pricing

### 4. Validate Item IDs
- Verify each `item_id` exists in the menu
- If an item ID is not found, return an error

### 5. Validate Quantities
- Each quantity must be a positive integer (≥ 1)
- Optionally enforce maximum quantities per item

### 6. Check Item Availability
- Verify each item has `available: true` in the menu
- If an item is out of stock, return `ITEM_OUT_OF_STOCK` error

### 7. Calculate Server-Side Total
- For each item: `item_total = menu_price × quantity`
- Sum all item totals for the order total
- This replaces the frontend total entirely

### 8. Validate Phone Number
- Regex: `/^01[0125]\d{8}$/`
- Must be exactly 11 digits
- Must start with 010, 011, 012, or 015
- If invalid, return `INVALID_PHONE` error

### 9. Validate Customer Information
- Name: non-empty, minimum 2 characters
- Address: required and non-empty if `order_type` is `"delivery"`
- Order type: must be exactly `"pickup"` or `"delivery"`

### 10. Generate Order ID
- Format: `ORD-YYYYMMDD-XXXX`
- Example: `ORD-20260907-A82F`
- Must be unique

### 11. Save Order
- Save to Google Sheets or database with all order details:
  - Order ID
  - Session ID
  - Customer info
  - Items with server-side prices
  - Server-calculated total
  - Timestamp
  - Status: `"received"`

### 12. Set Initial Status
- Status: `"received"`
- Possible statuses: `received` → `preparing` → `ready` → `delivered`/`picked_up`

### 13. Return Response to Frontend
- Send the success response with order ID and total

### 14. Notify Kitchen / Fulfillment
- Send notification via:
  - Email
  - Telegram
  - Slack
  - SMS
  - Or any other notification channel
- Include: order ID, items, customer info, order type

### 15. Error Handling
- Return structured JSON errors (see below)

---

## Response Schemas

### Success Response

```json
{
  "success": true,
  "order_id": "ORD-20260907-A82F",
  "total": 20,
  "status": "received",
  "estimated_time": 25
}
```

| Field | Type | Description |
|-------|------|-------------|
| `success` | boolean | Always `true` for success |
| `order_id` | string | Unique order identifier |
| `total` | number | Server-calculated total (may differ from frontend) |
| `status` | string | Initial order status (`"received"`) |
| `estimated_time` | number | Estimated preparation time in minutes |

### Error Responses

#### Invalid Phone Number

```json
{
  "success": false,
  "error": "INVALID_PHONE",
  "message": "Please enter a valid phone number."
}
```

#### Item Out of Stock

```json
{
  "success": false,
  "error": "ITEM_OUT_OF_STOCK",
  "item_id": 3,
  "message": "French Fries is currently out of stock."
}
```

#### Invalid Item

```json
{
  "success": false,
  "error": "INVALID_ITEM",
  "item_id": 99,
  "message": "Item not found in menu."
}
```

#### Invalid Order

```json
{
  "success": false,
  "error": "INVALID_ORDER",
  "message": "There is a problem with your order. Please review your items and try again."
}
```

#### Missing Required Fields

```json
{
  "success": false,
  "error": "MISSING_FIELDS",
  "fields": ["name", "phone"],
  "message": "Please fill in all required fields."
}
```

### Error Code Summary

| Error Code | HTTP Status | Description |
|------------|-------------|-------------|
| `INVALID_PHONE` | 400 | Phone number failed validation |
| `ITEM_OUT_OF_STOCK` | 400 | One or more items are unavailable |
| `INVALID_ITEM` | 400 | Item ID not found in menu |
| `INVALID_ORDER` | 400 | General order validation failure |
| `MISSING_FIELDS` | 400 | Required customer fields missing |
| `SERVER_ERROR` | 500 | Internal server error |

---

## Google Sheets Menu Schema

If using Google Sheets as the menu database, use this schema:

| Column | Type | Description |
|--------|------|-------------|
| `id` | Number | Unique item ID |
| `name` | String | Item display name |
| `description` | String | Short description |
| `price` | Number | Current price |
| `category` | String | Category (mains, sides, salads, etc.) |
| `available` | Boolean | Whether the item is currently available |
| `image_url` | String | URL to item image (optional) |

---

## Google Sheets Order Schema

For saving orders:

| Column | Type | Description |
|--------|------|-------------|
| `order_id` | String | Generated order ID (e.g., ORD-20260907-A82F) |
| `session_id` | String | Browser session UUID |
| `customer_name` | String | Customer name |
| `customer_phone` | String | Customer phone |
| `order_type` | String | "pickup" or "delivery" |
| `delivery_address` | String | Address (empty for pickup) |
| `items` | String (JSON) | JSON string of items array |
| `total` | Number | Server-calculated total |
| `status` | String | Order status |
| `created_at` | DateTime | Order timestamp |

---

## Menu Fetch Endpoint (Optional Future)

To make the menu dynamic, add a second n8n webhook:

| Property | Value |
|----------|-------|
| **Method** | `GET` |
| **Path** | `/menu` |
| **Response** | JSON array of menu items |

```json
[
  {
    "id": 1,
    "name": "Classic Burger",
    "description": "Juicy beef patty with melted cheddar...",
    "price": 8,
    "image": "https://example.com/burger.png",
    "available": true,
    "category": "mains"
  }
]
```

The frontend's `menu-data.js` is structured to easily swap mock data for this API call.
