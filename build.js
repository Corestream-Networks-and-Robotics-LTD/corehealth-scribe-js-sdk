import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const distDir = path.join(__dirname, 'dist');
if (!fs.existsSync(distDir)) {
  fs.mkdirSync(distDir, { recursive: true });
}

const iframeBridgeCode = fs.readFileSync(path.join(__dirname, 'src/IFrameBridge.js'), 'utf-8');
const elementCode = fs.readFileSync(path.join(__dirname, 'src/CoreHealthScribeElement.js'), 'utf-8');
const controllerCode = fs.readFileSync(path.join(__dirname, 'src/CoreHealthScribe.js'), 'utf-8');

// 1. ESM bundle
const esmBundle = `/**
 * CoreHealth AI Scribe SDK v1.0.0 (ESM)
 * (c) 2026 Corehealth by CorestreamNG <hello@corestream.ng>
 */
${iframeBridgeCode.replace(/export class IFrameBridge/g, 'class IFrameBridge')}
${elementCode.replace(/export class CoreHealthScribeElement/g, 'class CoreHealthScribeElement')}
${controllerCode
  .replace(/import { IFrameBridge } from '.\/IFrameBridge.js';/g, '')
  .replace(/import { CoreHealthScribeElement } from '.\/CoreHealthScribeElement.js';/g, '')
  .replace(/export class CoreHealthScribe/g, 'class CoreHealthScribe')}

if (typeof window !== 'undefined' && typeof customElements !== 'undefined') {
  if (!customElements.get('corehealth-scribe-studio')) {
    customElements.define('corehealth-scribe-studio', CoreHealthScribeElement);
  }
}

export { CoreHealthScribe, IFrameBridge, CoreHealthScribeElement };
export default CoreHealthScribe;
`;

fs.writeFileSync(path.join(distDir, 'corehealth-scribe-sdk.esm.js'), esmBundle);

// 2. UMD bundle
const umdBundle = `(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) :
  typeof define === 'function' && define.amd ? define(['exports'], factory) :
  (global = typeof globalThis !== 'undefined' ? globalThis : global || self, factory(global.CoreHealth = global.CoreHealth || {}));
})(this, (function (exports) { 'use strict';

${iframeBridgeCode.replace(/export class IFrameBridge/g, 'var IFrameBridge = class IFrameBridge')}
${elementCode.replace(/export class CoreHealthScribeElement/g, 'var CoreHealthScribeElement = class CoreHealthScribeElement')}
${controllerCode
  .replace(/import { IFrameBridge } from '.\/IFrameBridge.js';/g, '')
  .replace(/import { CoreHealthScribeElement } from '.\/CoreHealthScribeElement.js';/g, '')
  .replace(/export class CoreHealthScribe/g, 'var CoreHealthScribe = class CoreHealthScribe')}

  if (typeof window !== 'undefined' && typeof customElements !== 'undefined') {
    if (!customElements.get('corehealth-scribe-studio')) {
      customElements.define('corehealth-scribe-studio', CoreHealthScribeElement);
    }
  }

  exports.CoreHealthScribe = CoreHealthScribe;
  exports.IFrameBridge = IFrameBridge;
  exports.CoreHealthScribeElement = CoreHealthScribeElement;
  exports.default = CoreHealthScribe;

  Object.defineProperty(exports, '__esModule', { value: true });
}));
`;

fs.writeFileSync(path.join(distDir, 'corehealth-scribe-sdk.umd.js'), umdBundle);
console.log('✓ Successfully built CoreHealth Scribe SDK (ESM & UMD) into dist/');
