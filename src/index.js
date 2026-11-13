/**
 * CoreHealth AI Scribe SDK — Main Entry Point
 */

import { CoreHealthScribe } from './CoreHealthScribe.js';
import { IFrameBridge } from './IFrameBridge.js';
import { CoreHealthScribeElement } from './CoreHealthScribeElement.js';

// Auto-register custom element if running in browser
if (typeof window !== 'undefined' && typeof customElements !== 'undefined') {
  if (!customElements.get('corehealth-scribe-studio')) {
    customElements.define('corehealth-scribe-studio', CoreHealthScribeElement);
  }
}

export { CoreHealthScribe, IFrameBridge, CoreHealthScribeElement };
export default CoreHealthScribe;

