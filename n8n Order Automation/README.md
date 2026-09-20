# 🍽️ Flavour House - Automated Food Ordering & Processing System

An end-to-end, automated food ordering system powered by a modern **Vanilla JavaScript Web Application** and an **n8n Workflow Engine**.

---

## 📌 System Overview

The system delegates **all business logic, validation, order ID generation, data persistence, and staff notifications** to n8n. The website serves as a lightweight, interactive customer frontend.

```
+--------------------------------+           +-------------------------------------------------+
|                                |   POST    |                                                 |
|   Web Application (Frontend)   | --------> |                n8n Webhook Node                 |
|  (Catalog, Cart, Customer Form)| <-------- |                                                 |
|                                |   JSON    +------------------------+------------------------+
+--------------------------------+                                    |
                                                                      v
                                                    +-----------------------------------+
                                                    |  Validate & Process Order (Code)  |
                                                    |  - Menu lookup & item prices      |
                                                    |  - Name, Phone, Address rules     |
                                                    |  - Order ID & Time generation     |
                                                    +-----------------+-----------------+
                                                                      |
                                                                      v
                                                    +-----------------------------------+
                                                    |          Is Order Valid?          |
                                                    +-----------------+-----------------+
                                                                      |
                                           +--------------------------+--------------------------+
                                           | YES                                                 | NO
                                           v                                                     v
                        +------------------------------------+                +------------------------------------+
                        |       Save to Google Sheets        |                |           Respond Error            |
                        +------------------+-----------------+                |           (HTTP 400 JSON)          |
                                           |                                  +------------------------------------+
                                           v
                        +------------------------------------+
                        |        Email Kitchen Staff         |
                        +------------------+-----------------+
                                           |
                                           v
                        +------------------------------------+
                        |          Respond Success           |
                        |           (HTTP 200 JSON)          |
                        +------------------------------------+
```

---

## 🏗️ Architecture & Data Flow

1. **Customer Order Placement**:
   - Customer selects items, quantities, inputs contact info (Name, Egyptian Mobile Phone, Pickup/Delivery address) on the website.
   - Upon clicking **Confirm Order**, the web frontend packages the raw order data and sends an HTTP POST request to the **n8n Webhook URL**.

2. **n8n Validation & Processing**:
   - The **Webhook Node** receives the incoming JSON payload.
   - The **Validate and Process Order (Code Node)** validates all inputs against strict business rules:
     - **Name**: Must be string with at least 2 characters.
     - **Phone**: Must match Egyptian mobile format (`010`, `011`, `012`, `015` followed by 8 digits).
     - **Order Type**: Must be `pickup` or `delivery`.
     - **Address**: Required for delivery (min 5 chars).
     - **Items**: Validates item availability against menu database and calculates line totals.
     - **Order ID**: Generates a unique tracking ID (e.g. `ORD-20260907-A1B2`).

3. **Branching & Persistence**:
   - **If Validation Fails**: The workflow routes to **Respond Error** and returns an HTTP 400 JSON response containing field-specific error messages.
   - **If Validation Passes**:
     - Order record is appended to **Google Sheets** (`Orders` sheet).
     - Notification email is sent to **Kitchen Staff**.
     - Returns HTTP 200 JSON via **Respond Success**.

4. **Frontend Confirmation**:
   - The frontend reads the success response and smoothly displays the **Order Placed Successfully!** page.

---

## 📂 Project Structure

```
├── index.html              # Main HTML entry point
├── package.json            # Project metadata & serve script
├── n8n-workflow.json       # Exported n8n workflow blueprint
├── css/
│   ├── main.css            # Core styling, tokens, and components
│   └── responsive.css      # Layout adjustments for mobile & tablet
├── js/
│   ├── app.js              # Application setup & global event listeners
│   ├── config.js           # Environment configuration (Webhook URL)
│   ├── state.js            # Reactive state management (Cart, Customer info)
│   ├── api.js              # HTTP client communicating with n8n Webhook
│   ├── menu-data.js        # Menu catalog data
│   ├── validation.js       # Client-side form helper utilities
│   └── components/         # UI View components
│       ├── header.js
│       ├── menu.js
│       ├── cart.js
│       ├── checkout.js
│       ├── order-review.js
│       └── order-confirmation.js
```

---

## ⚡ n8n Workflow Breakdown

The n8n workflow (`n8n-workflow.json`) consists of 7 primary nodes:

### 1. Webhook (`POST /webhook/order`)
- **HTTP Method**: POST
- **Path**: `order`
- **Response Mode**: `responseNode` (Waits for downstream Respond nodes to return HTTP responses).

### 2. Validate and Process Order (`n8n-nodes-base.code`)
Executes JavaScript inside n8n to perform server-authoritative validation:
- Maintains single source of truth for Menu prices & item stock availability.
- Sanitizes phone numbers (removes spaces, dashes, parentheses).
- Formats dates (`YYYY-MM-DD HH:MM:SS`) and calculates estimated preparation time.
- Output JSON structure:
  ```json
  {
    "success": true,
    "order_id": "ORD-20260907-4F8A",
    "total": 24.00,
    "status": "received",
    "estimated_time": 30,
    "customer_name": "John Doe",
    "customer_phone": "01012345678",
    "order_type": "delivery",
    "address": "123 Main Street, Cairo",
    "items_text": "2x Classic Burger ($16.00)\n1x French Fries ($4.00)",
    "date": "2026-09-07 12:45:00"
  }
  ```

### 3. Is Order Valid? (`n8n-nodes-base.if`)
- Evaluates `{{ $json.success }} === true`.
- True branch -> Google Sheets & Email.
- False branch -> Respond Error.

### 4. Save to Google Sheets (`n8n-nodes-base.googleSheets`)
- **Operation**: Append Row
- **Sheet Headers**: `order_id | date | customer_name | customer_phone | order_type | address | items_text | total | status`

### 5. Email Kitchen Staff (`n8n-nodes-base.emailSend`)
- Sends formatted plain-text order summary to kitchen staff email.

### 6. Respond Success & Respond Error (`n8n-nodes-base.respondToWebhook`)
- Returns custom HTTP status codes (200 for success, 400 for errors).
- Includes CORS headers (`Access-Control-Allow-Origin: *`) allowing direct web fetch calls.

---

## 🔗 How to Connect Web App & n8n

### Step 1: Import Workflow into n8n (Local or Cloud)
1. Open your n8n dashboard (e.g. `http://localhost:5678` or `https://<your-instance>.app.n8n.cloud`).
2. Click **Workflows** -> **Import from file**.
3. Select `n8n-workflow.json` from this project.

### Step 2: Configure Webhook URL in Frontend
1. Open the **Webhook** node in n8n and copy the Webhook URL:
   - **Test URL** (for debugging with "Execute Workflow"): `http://localhost:5678/webhook-test/order`
   - **Production URL** (for active workflow): `https://<your-instance>.app.n8n.cloud/webhook/order`
2. Open `js/config.js` in your project code and paste the URL:
   ```javascript
   export const CONFIG = {
     N8N_WEBHOOK_URL: 'YOUR_COPIED_N8N_WEBHOOK_URL',
     SESSION_ID: 'session_' + Math.random().toString(36).substring(2, 9)
   };
   ```

### Step 3: Activate the n8n Workflow
Toggle the workflow **Active** (switch to ON) in the top-right corner of n8n.

---

## 🚀 Running the Web Application Locally

1. Open your terminal in the project directory.
2. Start the local server:
   ```bash
   npx serve -l 3000
   ```
3. Access the web app at `http://localhost:3000`.

---

## 📊 Google Sheets Setup (Optional for Persistence)

To persist orders to Google Sheets:
1. Create a Google Spreadsheet.
2. In Row 1, add these exact column headers:
   `order_id` | `date` | `customer_name` | `customer_phone` | `order_type` | `address` | `items_text` | `total` | `status`
3. In n8n, open **Save to Google Sheets** node, connect your Google OAuth credentials, and select your spreadsheet.
