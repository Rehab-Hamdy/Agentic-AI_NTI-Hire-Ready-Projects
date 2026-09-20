# 🎯 LeadScout AI — Lead Qualification & Sales Notification System

> An **n8n** workflow that captures leads through a web form, uses **Google Gemini** to extract and score them against a B2B qualification rubric, logs every lead to **Google Sheets**, and instantly emails the sales team when a lead is **hot**.

**Suggested repository name:** `leadscout-ai-n8n-lead-qualification`

![n8n](https://img.shields.io/badge/Automation-n8n-ea4b71?logo=n8n&logoColor=white)
![Gemini](https://img.shields.io/badge/AI-Google%20Gemini-4285f4?logo=googlegemini&logoColor=white)
![Google Sheets](https://img.shields.io/badge/CRM-Google%20Sheets-34a853?logo=googlesheets&logoColor=white)
![Gmail](https://img.shields.io/badge/Alerts-Gmail-ea4335?logo=gmail&logoColor=white)

---

## Overview

Sales teams lose time reading unstructured inquiries. This workflow turns a free-text business brief into a structured, scored lead in seconds:

1. A prospect fills out a short form (name, email, phone, and a free-text brief).
2. Contact details are validated.
3. Gemini extracts 12 structured business fields from the brief.
4. Gemini scores the lead across 7 weighted categories (max 90 points).
5. A deterministic rule classifies the lead as **hot**, **warm**, or **cold**.
6. The lead is saved to Google Sheets.
7. **Hot leads** trigger an email to the sales rep.

---

## Workflow Diagram

```
┌──────────────────┐
│   Form Trigger   │  Name · Email · Phone · Brief
└────────┬─────────┘
         ▼
┌──────────────────────────┐
│  Validate Contact Info   │  email format + phone digit count
└────────┬─────────────────┘
         ▼
┌──────────────────────────┐   NO   ┌──────────────────────────┐
│    IF Contact Valid?     │ ─────► │  Invalid Contact - Stop  │
└────────┬─────────────────┘        └──────────────────────────┘
         │ YES
         ▼
┌──────────────────────────┐
│    Extract Lead Info     │  Gemini + structured output parser
└────────┬─────────────────┘
         ▼
┌──────────────────────────┐
│  Merge Extracted Fields  │  contact data + extracted fields
└────────┬─────────────────┘
         ▼
┌──────────────────────────┐
│  Gemini LLM - Score Lead │  7 categories, max 90 pts
└────────┬─────────────────┘
         ▼
┌──────────────────────────┐
│ Generate Lead ID &       │  LD-YYYYMMDD-XXX + hot/warm/cold
│ Classify                 │
└────────┬─────────────────┘
         ▼
┌──────────────────────────┐
│  Google Sheets - Save    │  append row
└────────┬─────────────────┘
         ▼
┌──────────────────────────┐   NO   ┌──────────────────────────┐
│     IF Lead Is Hot?      │ ─────► │  End - No Notification   │
└────────┬─────────────────┘        └──────────────────────────┘
         │ YES
         ▼
┌──────────────────────────┐
│  Send Email to Sales Rep │  Gmail
└──────────────────────────┘
```

---

## Features

- **Public lead form** built with n8n's Form Trigger (no frontend code needed)
- **Input validation** for email format and phone number (7–15 digits; allows `+`, spaces, hyphens, parentheses)
- **AI-powered extraction** of structured data from free text, with instructions to leave a field empty rather than guess
- **Bias-aware scoring prompt:** the model is told to score only on stated facts and not on name, gender, age, nationality, grammar, or language
- **Deterministic classification** in code, so hot/warm/cold labels are reproducible rather than model-decided
- **Full lead log** in Google Sheets (28 columns including all sub-scores and the rationale)
- **Instant email alert** to sales for hot leads

---

## Scoring Model

| # | Category | Max Points |
|---|----------|-----------:|
| 1 | Product / Service Fit | 20 |
| 2 | Purchase Intent | 15 |
| 3 | Business Potential | 15 |
| 4 | Budget | 10 |
| 5 | Problem / Challenge | 10 |
| 6 | Urgency / Timeline | 10 |
| 7 | Decision-Making Authority | 10 |
| | **Total** | **90** |

### Classification thresholds

| Classification | Total score | Action |
|----------------|-------------|--------|
| 🔥 **Hot** | ≥ 72 | Saved + email to sales rep |
| 🌤️ **Warm** | 45 – 71 | Saved only |
| ❄️ **Cold** | < 45 | Saved only |

### Extracted fields

`company_name`, `company_location`, `team_size`, `annual_revenue`, `budget`, `hiring_plans`, `problem`, `product_service`, `marketing_team_size`, `customer_growth_rate`, `expected_timeline`, `decision_authority`

---

## Setup

### Prerequisites

- An n8n instance ([n8n Cloud](https://n8n.io/) or self-hosted)
- A **Google Gemini** API key
- A **Google account** with access to Sheets and Gmail (OAuth2)

### 1. Import the workflow

In n8n: **Workflows → Import from file →** select `Lead Qualification & Sales Notification System.json`.

### 2. Replace the placeholders

Personal values were removed from the exported file. Set each of these before running:

| Placeholder | Where | What to do |
|-------------|-------|-----------|
| `YOUR_GOOGLE_SHEETS_CREDENTIAL_ID` / `_NAME` | **Google Sheets - Save Lead** node | Select or create your Google Sheets OAuth2 credential |
| `YOUR_GOOGLE_SHEET_ID` | **Google Sheets - Save Lead** node | Paste the ID from your sheet's URL (`/spreadsheets/d/<ID>/edit`) |
| `YOUR_GMAIL_CREDENTIAL_ID` / `_NAME` | **Send Email to Sales Rep** node | Select or create your Gmail OAuth2 credential |
| `YOUR_SALES_REP_EMAIL@example.com` | **Send Email to Sales Rep** node | Enter the address that should receive hot-lead alerts |
| *(Gemini credential)* | **Gemini Chat Model** node | Add your Google Gemini (PaLM) API credential |

### 3. Prepare the Google Sheet

Create a sheet with these exact headers in row 1:

```
lead_id | name | email | phone | company_name | company_location | team_size | annual_revenue | budget | hiring_plans | problem | product_service | marketing_team_size | customer_growth_rate | expected_timeline | decision_authority | brief | fit_score | intent_score | business_potential_score | budget_score | problem_score | urgency_score | decision_authority_score | total_score | classification | rationale | notification_sent
```

### 4. Test it

1. Open the **Form Trigger** node and copy the **Test URL**.
2. Click **Execute Workflow** and submit the form.
3. Check the execution, your sheet, and (for a hot lead) the sales inbox.

### 5. Go live

Toggle the workflow **Active** and share the **Production URL** of the form.

---

## Example Submission

**Brief:**

> We're a 120-person logistics company in Cairo with about $8M annual revenue. Our marketing team of 4 needs an automated lead nurturing platform. Budget is around $30k, we plan to hire 3 more people, and we want to launch within 6 weeks. I'm the COO and make the final decision.

**Expected outcome:** high scores for budget, urgency, and authority, so the lead is likely classified as **hot**, saved to the sheet, and the sales rep receives an email.

---

## Customization

| Goal | Where to change it |
|------|--------------------|
| Adjust hot/warm/cold cut-offs | **Generate Lead ID & Classify** node (`72` and `45`) |
| Change scoring categories or weights | **Gemini LLM - Score Lead** prompt and **Scoring Output Parser** schema, then update the max total |
| Extract different fields | **Extract Lead Info** prompt, **Extraction Output Parser**, **Merge Extracted Fields**, and the sheet columns |
| Stricter phone/email rules | **Validate Contact Info** node |
| Notify via Slack/Telegram/CRM | Add a node after **IF Lead Is Hot?** (true branch) |
| Use another LLM | Swap the **Gemini Chat Model** node for any n8n chat model |

---

## Known Limitations & Ideas

- **`notification_sent` is always `No`.** The column is written before the email is sent and is never updated afterwards. Add a Sheets "update row" node after the Gmail node to fix this.
- **Invalid contact info is silently dropped.** The submitter gets no error message, because the rejection branch ends in a no-op node. Consider a form-response page or a follow-up email.
- **Lead ID collisions are possible.** IDs use a 3-digit random suffix (`LD-YYYYMMDD-XXX`).
- **LLM totals are trusted.** The classification uses the model's `total_score`; recomputing it in code as the sum of the seven sub-scores would guard against arithmetic errors.
- **No duplicate detection.** The same email can create multiple rows.
- Scores are only as good as the information in the brief; missing details lower the score by design.

---

## Security Notes

- Never commit credentials, sheet IDs, or personal email addresses. This repository's workflow file uses placeholders only.
- Lead data (names, emails, phone numbers) is personal data. Restrict access to the sheet and follow your local privacy regulations.

---

## License

Add a license of your choice (e.g. MIT).
