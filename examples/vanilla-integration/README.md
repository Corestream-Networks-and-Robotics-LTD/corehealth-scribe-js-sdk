# CoreHealth AI Scribe — Vanilla JS Reference Demo

> **Turnkey, zero-build-step reference integration demonstrating how an external EMR embeds the CoreHealth AI Scribe using a lightweight Node.js/Express backend proxy.**

---

## Architecture Overview

```
Browser (Partner EMR Frontend)
       │
       ▼ (Fetch ephemeral token)
Node.js Express Proxy (server.js on :3001) ─── holds client_secret in .env
       │
       ▼ (Exchange credentials for SKT_ JWT)
CoreHealth Cloud / Edge Backend (:8000)
```

The Express proxy securely holds your partner credentials (`CH_CLIENT_ID` and `CH_CLIENT_SECRET`) in an environment file (`.env`). It mints ephemeral `SKT_` session tokens via `POST /api/sdk/scribe/session` and persists signed clinical notes with openEHR and FHIR R4 enrichment without exposing secret keys to client browsers.

---

## 1. Environment Configuration (`.env`)

1. Copy the provided environment configuration template:

   ```bash
   cp .env.example .env
   ```

2. Review or update `.env`. Partner EMR client credentials are administered directly in **CoreHealth Admin &rarr; Hospital Configuration &rarr; AI Scribe & SDK** (`/hospital-config#sdk-settings`):

   ```ini
   # CoreHealth Edge or Cloud Backend URL
   CH_BASE_URL=http://127.0.0.1:8000

   # Client Credentials (issued in CoreHealth Admin -> Hospital Configuration -> AI Scribe & SDK)
   CH_CLIENT_ID=your_client_id_here
   CH_CLIENT_SECRET=your_client_secret_here

   # Express Proxy Port
   PORT=3001

   # Consultation Context Defaults
   CH_DEFAULT_LOCALE=en-NG
   CH_DEFAULT_PATIENT_ID=492
   CH_DEFAULT_ENCOUNTER_ID=1017
   CH_DEFAULT_CLINICIAN_ID=38
   ```

---

## 2. Install Dependencies

Install the lightweight proxy dependencies (`express`, `cors`, `dotenv`):

```bash
npm install
```

---

## 3. Start the Reference Server

Launch the backend proxy:

```bash
node server.js
```

The proxy logs:

```text
[CoreHealth Proxy] Target CoreHealth Base: http://127.0.0.1:8000
[CoreHealth Proxy] Configured Client ID: partner-emr-dev
====================================================
[CoreHealth Scribe Reference Proxy]
Listening live on: http://localhost:3001
Open http://localhost:3001 in your browser
====================================================
```

---

## 4. Verify Live Integration via Automated Test

Before opening the browser, verify backend proxy token minting and sign-off persistence:

```bash
node test.js
```

Expected output:
```text
=== Step 1: Requesting Ephemeral Session Token ===
✓ Success! Received token: SKT_eyJ0eXAi...
=== Step 2: Testing Consultation Sign-off Route ===
✓ Success! Received response:
  - Success: true
  - Encounter ID: 1017
  - FHIR Bundle entries: 5
  - openEHR content items: 8
=== All Integration Tests Passed Cleanly! ===
```

---

## 5. Open in Browser & Dictate

1. Navigate to `http://localhost:3001` in your browser.
2. The page executes `GET /ch-scribe-token?patient_id=492&encounter_id=1017` and mounts the `<corehealth-scribe-studio>` Web Component.
3. Switch between **Track A (Web Component)** and **Track B (Sandboxed iFrame)** to evaluate both embedding approaches side-by-side.
4. Click **Load Sample** to inject clinical narrative, then click **Process Note**.
5. Observe real-time structuring into SOAP format and extraction of recommended orders (medications, malaria microscopy, full blood count) with tariff estimates.
6. Click **Accept & Sign Note & Orders**.
7. Inspect the tabulated 4-tab clinical suite:
   - **All Overview**: KPI metrics grid, signed note preview, and standards conformance badges.
   - **HL7 FHIR R4**: Canonical Transaction Bundle in tabulated view + raw JSON view.
   - **openEHR COMPOSITION**: Composition archetype hierarchy in tabulated view + raw JSON view.
   - **Clinical Orders**: Staged and approved orders in tabulated view + raw JSON view.

---

## 6. Support & Resources

- **Public Production CDN**: `https://corehealth.corestream.ng/js/corehealth-scribe-sdk.umd.js`
- **Technical Inquiries**: Contact CoreHealth Engineering at `hello@corestream.ng`.
