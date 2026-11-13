# Running the Vanilla JS Reference Example

This guide walks you through running the included reference demo (`examples/vanilla-integration/`) in under 2 minutes.

---

## Architecture of the Demo

The demo runs two components:
1. **Frontend (`index.html`)**: Interactive consultation interface with tabs to toggle between Track A (Web Component) and Track B (iFrame).
2. **Backend Proxy (`server.js`)**: Lightweight Node.js server that holds partner credentials (`client_id` & `client_secret`) and exchanges them for short-lived session tokens (`SKT_...`).

---

## Step 1: Navigate to the Example Directory

```bash
cd examples/vanilla-integration
```

---

## Step 2: Configure Environment

Copy `.env.example` to `.env` (optional — sensible defaults are already set):
```bash
cp .env.example .env
```

Default configuration:
- `PORT=3001`
- `CH_BASE_URL=http://127.0.0.1:8000` (CoreHealth edge or cloud node)
- `CH_CLIENT_ID=partner-emr-dev`
- `CH_CLIENT_SECRET=partner_dev_secret_2026`

> **Note:** If CoreHealth is not running locally, the proxy automatically falls back to offline mock mode so you can test the UI lifecycle immediately!

---

## Step 3: Start the Server

```bash
node server.js
```

You will see:
```text
====================================================
[CoreHealth Scribe Reference Proxy]
Listening live on: http://localhost:3001
Open http://localhost:3001 in your browser
====================================================
```

---

## Step 4: Interact with the Live Scribe Studio

1. Open `http://localhost:3001` in Chrome or any modern browser.
2. Observe the status bar: the proxy fetches the ephemeral token and mounts the AI Scribe Studio.
3. Switch between **Track A (Web Component)** and **Track B (iFrame)** using the top tabs.
4. Click **Start Dictation**, speak into your microphone, or type in the consultation box.
5. Click **Stop Dictation** — observe the AI structuring into SOAP format and extracting prescription orders.
6. Click **Accept & Sign Note** — observe the signed data forwarded to the backend proxy, returning the full **openEHR COMPOSITION** and **HL7 FHIR R4 Transaction Bundle** in the live JSON viewer!
