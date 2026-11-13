# Fresh Integration Guide: Embedding AI Scribe in Your EMR

Follow these 4 steps to embed CoreHealth AI Scribe into any web application or existing EMR.

---

## Step 1: Install the SDK

### Option A: npm (React, Vue, Angular, Svelte, Vite, Webpack)
```bash
npm install @corehealth/scribe-sdk
```

### Option B: CDN / Direct `<script>` Tag (Vanilla HTML / PHP / Blade / Django Templates)
```html
<script src="https://api.corehealth.ng/js/corehealth-scribe-sdk.umd.js"></script>
```

---

## Step 2: Implement Your Backend Token Minting Route

Never put your `client_secret` in frontend browser code. Instead, create a route in your backend (e.g. `/api/ch-scribe-token`) that exchanges your credentials for an ephemeral session token:

### Node.js / Express Example
```javascript
app.get('/api/ch-scribe-token', async (req, res) => {
  const { patient_id, encounter_id, clinician_id } = req.query;

  const response = await fetch(`${process.env.CH_BASE_URL}/api/sdk/auth/token`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      client_id: process.env.CH_CLIENT_ID,
      client_secret: process.env.CH_CLIENT_SECRET,
      patient_id: parseInt(patient_id, 10),
      encounter_id: parseInt(encounter_id, 10),
      clinician_id: parseInt(clinician_id, 10),
      scope: 'scribe:process scribe:sign interop:compositions',
      ttl: 3600
    })
  });

  const data = await response.json();
  res.json(data); // Returns { sdk_token: "SKT_...", expires_in: 3600 }
});
```

---

## Step 3: Mount the Scribe UI in Your Consultation Screen

Add a container element where the Scribe studio should live:
```html
<div id="scribe-container"></div>
```

Initialize and mount the SDK in your frontend:

```javascript
import { CoreHealthScribe } from '@corehealth/scribe-sdk';

// 1. Fetch ephemeral token from your backend
const tokenRes = await fetch('/api/ch-scribe-token?patient_id=492&encounter_id=1017&clinician_id=38');
const { sdk_token } = await tokenRes.json();

// 2. Initialize Scribe Studio
const scribe = new CoreHealthScribe({
  baseUrl: 'https://api.corehealth.ng', // Or your local Edge Node IP
  sdkToken: sdk_token,
  track: 'web-component', // Or 'iframe' for strict CSP
  mountTarget: '#scribe-container',
  patientId: 492,
  encounterId: 1017,
  locale: 'en-NG',
  theme: 'light',

  // Fired when the clinician reviews and signs the consultation note
  onSignedOff: async (payload) => {
    console.log('Signed note:', payload.final_signed_note);

    // Forward to your backend to save to your local database / CDR
    await fetch('/api/encounters/1017/save-signed-notes', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
  },

  onError: (error) => {
    console.error('Scribe Error:', error);
  }
});

// 3. Mount to DOM
await scribe.mount();
```

---

## Step 4: Handle Downstream Data in Your Backend

When `onSignedOff` triggers, the payload contains:
- `final_signed_note`: The full text of the approved SOAP note.
- `original_transcript`: The raw dictated speech.
- `openehr_composition`: Full openEHR `COMPOSITION.encounter.v1` document.
- `fhir_bundle`: HL7 FHIR R4 Transaction Bundle (Encounter, Observation, MedicationRequest, ServiceRequest).

Save these records to your relational database, push the openEHR composition to your Clinical Data Repository (CDR), or ingest the FHIR bundle into your FHIR store.

