# Corehealth by CorestreamNG — AI Scribe JavaScript/TypeScript Embeddable SDK

> **Zero-Disruption Voice-to-Structured-Note Clinical Scribe with openEHR & HL7 FHIR R4 Handoff.**

The CoreHealth AI Scribe SDK allows healthcare platforms, hospital systems, and partner EMRs to embed AI-assisted clinical dictation directly into existing clinical encounter interfaces without page redirects or modal pop-outs.

---

## Key Features

- **Compressed Scribe Catalog Protocol (CSCP)**: Pass your hospital or EMR catalog of products and services using super-compressed `#CAT:id|type|name` DSL or gzip-base64 via `CoreHealthScribe.compressCatalog(items)`. Achieves 10x-15x token reduction (~3 tokens/item) for scalable grounding without exceeding model context limits.
- **Interactive Suggested Orders & Prescriptions Deck**: Voice dictations automatically stage categorized clinical orders (medications, labs, imaging, procedures, nursing, consultation). Clinicians can check/uncheck items, edit dosage/frequency/instructions inline, calculate tariffs, see active allergy warnings, and add orders with `+ Add Order`.
- **Dynamic Medical Taxonomies**: Toggle seamlessly between clinical documentation standards:
  - **Doctor**: `SOAP`, `Traditional Clerking`, `POMR`
  - **Nurse**: `Focus DAR`, `SBAR`, `SOAPIE`
  - **Maternity**: `ANC`, `Labor`, `PNC`
  Lossless conversion preserves all clinical findings and observations.
- **Draft Persistence & Offline Protection**: Automatic continuous auto-saving to `localStorage` with a restoration prompt on browser reload, ensuring no lost notes during network interruptions.
- **Ephemeral Session & Zero Data Retention Guarantee**:
  - **Zero Persistent Storage in SDK Gateway**: No patient clinical data is stored or cached on the CoreHealth SDK Gateway beyond the active in-memory session. Session context terminates immediately at the end of the request.
  - **Capture the Callback**: If your frontend or backend fails to capture the `onSignedOff` callback or `corehealth:signed-off` event, the ephemeral session is discarded and cannot be retrieved; a fresh session must be initiated.
  - **PII-Stripped Context Injection (`patientSummary`)**: Your application can pass a de-identified clinical brief (`patientSummary` containing chronic conditions, active medications, and allergies) to improve speech structuring accuracy. All text is automatically filtered through the NDPA 2023 de-identification sanitizer.
- **Multi-Track Embedding**:
  - **Track A (Web Component)**: Shadow DOM encapsulated custom element `<corehealth-scribe-studio>` (zero CSS or JavaScript namespace leakage).
  - **Track B (Sandboxed iFrame)**: High-security isolated iframe with bidirectional `window.postMessage` bridge for strict Content Security Policy (CSP) environments.
- **Enterprise Security (Backend-Mediated Token Authentication)**: Backend-mediated authentication using ephemeral JWT session tokens (`SKT_...`). Never exposes API credentials to client browsers.
- **Standards-Based Interoperability**: Every consultation sign-off outputs both:
  - Canonical **openEHR COMPOSITION.encounter.v1** JSON with `INSTRUCTION` archetypes for approved orders.
  - Complete **HL7 FHIR R4 Transaction Bundle** (Encounter, Observation, MedicationRequest, ServiceRequest).
- **Statutory Privacy**: Compliant with Nigeria Data Protection Act (NDPA 2023) Sections 30 & 41-43 for local and cross-border clinical data processing.

---

## Quickstart: Run the Reference Example

A live, zero-dependency reference demo is included in `examples/vanilla-integration/`:

```bash
# Navigate to the reference example
cd examples/vanilla-integration

# Copy environment configuration template
cp .env.example .env

# Start the local Node.js proxy server (Node 18+)
node server.js
```

Open `http://localhost:3001` in your browser to test dictation, structuring with `gemini-2.5-flash`, suggested order staging, and EHR persistence!

👉 **[Read the Step-by-Step Example Walkthrough](./docs/running-the-example.md)**

---

## Documentation Directory

| Document | Purpose |
|---|---|
| 📖 **[Running the Example](./docs/running-the-example.md)** | Step-by-step instructions to run the local vanilla integration demo. |
| 🚀 **[Fresh Integration Guide](./docs/fresh-integration-guide.md)** | How to install and embed the SDK into your own EMR from scratch. |
| 🌐 **[Full Interoperability Guide](./docs/full-interoperability-guide.md)** | Complete guide to FHIR R4, openEHR ITS-REST, AQL, and NDPA APIs. |
| 📮 **[Postman Collection](./postman/CoreHealth-Interop-Collection.json)** | 25+ ready-to-run requests covering all interop & SDK endpoints. |
| 📑 **[OpenAPI 3.0 Specification](./openapi/corehealth-interop-openapi.json)** | Canonical machine-readable OpenAPI schema for the entire API. |

---

## Installation

### Via npm
```bash
npm install @corehealth/scribe-sdk
```

### Via CDN (Vanilla JS / Blade / PHP / Django)
```html
<script src="https://corehealth.corestream.ng/js/corehealth-scribe-sdk.umd.js"></script>
```

---

## 30-Second Integration Example

```javascript
import { CoreHealthScribe } from '@corehealth/scribe-sdk';

// 1. Fetch short-lived token from your backend proxy
const { sdk_token } = await fetch('/api/ch-scribe-token?patient_id=492&encounter_id=1017').then(r => r.json());

// 2. Initialize and mount Scribe
const scribe = new CoreHealthScribe({
  baseUrl: 'https://corehealth.corestream.ng',
  sdkToken: sdk_token,
  track: 'web-component', // or 'iframe'
  mountTarget: '#scribe-mount',
  patientId: 492,
  encounterId: 1017,
  locale: 'en-NG',
  onSignedOff: async (payload) => {
    // Save to your database / CDR
    await fetch('/api/encounters/1017/save-signed-notes', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
  }
});

await scribe.mount();
```

---

## Repository Structure

```
├── dist/                          # Compiled ESM and UMD builds
│   ├── corehealth-scribe-sdk.esm.js
│   └── corehealth-scribe-sdk.umd.js
├── src/                           # Source TypeScript / JavaScript files
│   ├── index.js                   # Main package entry
│   ├── CoreHealthScribe.js        # Controller class
│   ├── CoreHealthScribeElement.js # Shadow DOM Web Component
│   ├── IFrameBridge.js            # iFrame communication layer
│   └── types.d.ts                 # Full TypeScript definitions
├── examples/
│   └── vanilla-integration/       # Working reference integration with mock backend
│       ├── index.html
│       ├── server.js
│       └── package.json
├── docs/                          # Developer guides & technical references
│   ├── running-the-example.md
│   ├── fresh-integration-guide.md
│   └── full-interoperability-guide.md
├── openapi/
│   └── corehealth-interop-openapi.json
├── postman/
│   └── CoreHealth-Interop-Collection.json
├── package.json
└── README.md
```

---

## License

Apache-2.0 © 2026 Corehealth by CorestreamNG <hello@corestream.ng>
