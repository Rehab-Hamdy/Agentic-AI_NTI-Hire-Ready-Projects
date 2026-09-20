// Generates the n8n workflow JSON with all nodes:
// Webhook → Validate → If → Google Sheets → Email → Respond Success
//                          └→ Respond Error
const fs = require('fs');
const path = require('path');

const jsCode = fs.readFileSync(path.join(__dirname, 'order-processor.js'), 'utf-8');

const workflow = {
  name: "Flavour House - Order Processing",
  nodes: [
    // ─── STICKY NOTE ───
    {
      parameters: {
        content: "## 🍽️ Flavour House — Order Workflow\n\n**Flow:** Website → Webhook → Validate → Save → Notify → Respond\n\n**Setup required:**\n1. **Google Sheets:** Create a spreadsheet with an \"Orders\" sheet.\n   Column headers (Row 1): `order_id | date | customer_name | customer_phone | order_type | address | items_text | total | status`\n   Then open the Google Sheets node, connect credentials, and select your spreadsheet.\n\n2. **Email:** Open the \"Email Kitchen Staff\" node.\n   Set From/To email addresses. Connect your SMTP credentials.\n\n3. **Activate:** Toggle the workflow ON for production use.\n   Use the Test URL while developing.",
        height: 400,
        width: 560,
        color: 3
      },
      id: "sticky-1",
      name: "Sticky Note",
      type: "n8n-nodes-base.stickyNote",
      typeVersion: 1,
      position: [-200, 40]
    },

    // ─── 1. WEBHOOK TRIGGER ───
    {
      parameters: {
        httpMethod: "POST",
        path: "order",
        responseMode: "responseNode",
        options: {}
      },
      id: "node-webhook",
      name: "Webhook",
      type: "n8n-nodes-base.webhook",
      typeVersion: 2,
      position: [420, 300],
      webhookId: "flavour-house-order"
    },

    // ─── 2. CODE: VALIDATE & PROCESS ───
    {
      parameters: {
        jsCode: jsCode
      },
      id: "node-validate",
      name: "Validate and Process Order",
      type: "n8n-nodes-base.code",
      typeVersion: 2,
      position: [660, 300]
    },

    // ─── 3. IF: ORDER VALID? ───
    {
      parameters: {
        conditions: {
          options: {
            caseSensitive: true,
            leftValue: ""
          },
          conditions: [
            {
              id: "cond-success",
              leftValue: "={{ $json.success }}",
              rightValue: true,
              operator: {
                type: "boolean",
                operation: "true"
              }
            }
          ],
          combinator: "and"
        },
        options: {}
      },
      id: "node-if",
      name: "Is Order Valid?",
      type: "n8n-nodes-base.if",
      typeVersion: 2,
      position: [900, 300]
    },

    // ─── 4. GOOGLE SHEETS: SAVE ORDER (YES branch) ───
    {
      parameters: {
        operation: "append",
        documentId: {
          __rl: true,
          value: "",
          mode: "list",
          cachedResultName: "Select your spreadsheet"
        },
        sheetName: {
          __rl: true,
          value: "",
          mode: "list",
          cachedResultName: "Orders"
        },
        columns: {
          mappingMode: "autoMapInputData",
          value: {}
        },
        options: {}
      },
      id: "node-sheets",
      name: "Save to Google Sheets",
      type: "n8n-nodes-base.googleSheets",
      typeVersion: 4.5,
      position: [1160, 180]
    },

    // ─── 5. EMAIL: NOTIFY KITCHEN (YES branch) ───
    {
      parameters: {
        fromEmail: "orders@flavourhouse.com",
        toEmail: "kitchen@flavourhouse.com",
        subject: "=🍽️ New Order: {{ $json.order_id }}",
        emailType: "text",
        message: "=NEW ORDER RECEIVED\n========================\n\nOrder ID: {{ $json.order_id }}\nDate: {{ $json.date }}\n\nCustomer: {{ $json.customer_name }}\nPhone: {{ $json.customer_phone }}\nType: {{ $json.order_type }}\nAddress: {{ $json.address }}\n\nItems:\n{{ $json.items_text }}\n\nTotal: ${{ $json.total }}\nStatus: {{ $json.status }}\n\n========================\nPlease prepare this order.",
        options: {}
      },
      id: "node-email",
      name: "Email Kitchen Staff",
      type: "n8n-nodes-base.emailSend",
      typeVersion: 2.1,
      position: [1400, 180]
    },

    // ─── 6. RESPOND: SUCCESS (YES branch) ───
    {
      parameters: {
        respondWith: "json",
        responseBody: '={{ JSON.stringify({ success: true, order_id: $json.order_id, total: $json.total, status: $json.status, estimated_time: $json.estimated_time }) }}',
        options: {
          responseCode: 200,
          responseHeaders: {
            entries: [
              { name: "Access-Control-Allow-Origin", value: "*" },
              { name: "Access-Control-Allow-Headers", value: "Content-Type" }
            ]
          }
        }
      },
      id: "node-respond-success",
      name: "Respond Success",
      type: "n8n-nodes-base.respondToWebhook",
      typeVersion: 1.1,
      position: [1640, 180]
    },

    // ─── 7. RESPOND: ERROR (NO branch) ───
    {
      parameters: {
        respondWith: "json",
        responseBody: '={{ JSON.stringify({ success: false, error: $json.error, message: $json.message, field: $json.field }) }}',
        options: {
          responseCode: 400,
          responseHeaders: {
            entries: [
              { name: "Access-Control-Allow-Origin", value: "*" },
              { name: "Access-Control-Allow-Headers", value: "Content-Type" }
            ]
          }
        }
      },
      id: "node-respond-error",
      name: "Respond Error",
      type: "n8n-nodes-base.respondToWebhook",
      typeVersion: 1.1,
      position: [1160, 460]
    }
  ],
  connections: {
    "Webhook": {
      main: [[{ node: "Validate and Process Order", type: "main", index: 0 }]]
    },
    "Validate and Process Order": {
      main: [[{ node: "Is Order Valid?", type: "main", index: 0 }]]
    },
    "Is Order Valid?": {
      main: [
        // Output 0 = TRUE branch
        [{ node: "Save to Google Sheets", type: "main", index: 0 }],
        // Output 1 = FALSE branch
        [{ node: "Respond Error", type: "main", index: 0 }]
      ]
    },
    "Save to Google Sheets": {
      main: [[{ node: "Email Kitchen Staff", type: "main", index: 0 }]]
    },
    "Email Kitchen Staff": {
      main: [[{ node: "Respond Success", type: "main", index: 0 }]]
    }
  },
  active: false,
  settings: {
    executionOrder: "v1"
  },
  pinData: {},
  versionId: "2",
  tags: []
};

const outputPath = path.join(__dirname, '..', 'n8n-workflow.json');
fs.writeFileSync(outputPath, JSON.stringify(workflow, null, 2), 'utf-8');
console.log('✓ Generated: ' + outputPath);
console.log('  Nodes: ' + workflow.nodes.map(n => n.name).filter(n => n !== 'Sticky Note').join(' → '));
