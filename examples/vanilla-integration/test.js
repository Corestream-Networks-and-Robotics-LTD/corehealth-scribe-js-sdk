/**
 * Automated Test for Vanilla Integration Proxy
 */

import http from 'http';
import assert from 'assert';

const PORT = 3099;
process.env.PORT = String(PORT);

// Import and start server
import('./server.js').then(async () => {
  console.log('Testing proxy endpoints...');

  // 1. Test token minting endpoint
  const tokenRes = await fetch(`http://localhost:${PORT}/ch-scribe-token?patient_id=492&encounter_id=1017`);
  assert.strictEqual(tokenRes.status, 200, 'GET /ch-scribe-token should return 200');
  const tokenData = await tokenRes.json();
  assert.ok(tokenData.sdk_token, 'Response should contain sdk_token');
  assert.ok(tokenData.sdk_token.startsWith('SKT_'), 'Token should start with SKT_');
  console.log('✓ GET /ch-scribe-token passed');

  // 2. Test signoff persistence endpoint
  const signRes = await fetch(`http://localhost:${PORT}/encounters/1017/scribe-signoff`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      patient_id: 492,
      encounter_id: 1017,
      final_signed_note: 'Patient with hypertension well controlled on Metformin.',
      original_transcript: 'Dictated text...'
    })
  });
  assert.strictEqual(signRes.status, 200, 'POST /encounters/:id/scribe-signoff should return 200');
  const signData = await signRes.json();
  assert.ok(signData.openehr_composition, 'Payload should contain openehr_composition');
  assert.ok(signData.fhir_bundle, 'Payload should contain fhir_bundle');
  assert.strictEqual(signData.fhir_bundle.resourceType, 'Bundle', 'FHIR bundle should have resourceType Bundle');
  console.log('✓ POST /encounters/1017/scribe-signoff passed');

  console.log('====================================================');
  console.log('ALL PROXY INTEGRATION TESTS PASSED CLEANLY!');
  console.log('====================================================');
  process.exit(0);
}).catch(err => {
  console.error('Test failure:', err);
  process.exit(1);
});

