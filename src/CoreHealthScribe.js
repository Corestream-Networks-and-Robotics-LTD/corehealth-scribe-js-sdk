/**
 * CoreHealth AI Scribe — Master Controller Class
 * Unified API supporting both Track A (Web Component) and Track B (iFrame Bridge).
 */

import { IFrameBridge } from './IFrameBridge.js';
import { CoreHealthScribeElement } from './CoreHealthScribeElement.js';

export class CoreHealthScribe {
  constructor(options) {
    if (!options || !options.baseUrl) {
      throw new Error('[CoreHealthScribe] "baseUrl" option is required.');
    }
    if (!options.sdkToken) {
      throw new Error('[CoreHealthScribe] "sdkToken" option is required.');
    }
    if (!options.mountTarget) {
      throw new Error('[CoreHealthScribe] "mountTarget" option is required.');
    }

    this.options = Object.assign({
      track: 'web-component',
      locale: 'en-NG',
      theme: 'light',
    }, options);

    this.bridge = null;
    this.element = null;
    this.mounted = false;
  }

  async mount() {
    if (this.mounted) return;

    if (this.options.track === 'iframe') {
      this.bridge = new IFrameBridge(this.options);
      await this.bridge.mount();
    } else {
      // Ensure custom element is registered
      if (typeof customElements !== 'undefined' && !customElements.get('corehealth-scribe-studio')) {
        customElements.define('corehealth-scribe-studio', CoreHealthScribeElement);
      }

      const target = typeof this.options.mountTarget === 'string'
        ? document.querySelector(this.options.mountTarget)
        : this.options.mountTarget;

      if (!target) {
        throw new Error(`[CoreHealthScribe] Mount target "${this.options.mountTarget}" not found in DOM.`);
      }

      const el = document.createElement('corehealth-scribe-studio');
      el.setAttribute('base-url', this.options.baseUrl);
      el.setAttribute('sdk-token', this.options.sdkToken);
      if (this.options.patientId) el.setAttribute('patient-id', String(this.options.patientId));
      if (this.options.encounterId) el.setAttribute('encounter-id', String(this.options.encounterId));
      if (this.options.patientSummary) el.setAttribute('patient-summary', String(this.options.patientSummary));
      if (this.options.role) el.setAttribute('role', String(this.options.role));
      if (this.options.taxonomy) el.setAttribute('taxonomy', String(this.options.taxonomy));
      if (this.options.customCatalog) {
        el.setAttribute('custom-catalog', typeof this.options.customCatalog === 'string'
          ? this.options.customCatalog
          : JSON.stringify(this.options.customCatalog));
      }
      el.setAttribute('locale', this.options.locale || 'en-NG');
      el.setAttribute('theme', this.options.theme || 'light');

      // Bind custom element event listeners
      if (typeof this.options.onSignedOff === 'function') {
        el.addEventListener('corehealth:signed-off', (e) => this.options.onSignedOff(e.detail));
      }
      if (typeof this.options.onStateChange === 'function') {
        el.addEventListener('corehealth:state-change', (e) => this.options.onStateChange(e.detail));
      }
      if (typeof this.options.onOrdersUpdated === 'function') {
        el.addEventListener('corehealth:orders-updated', (e) => this.options.onOrdersUpdated(e.detail));
      }

      target.innerHTML = '';
      target.appendChild(el);
      this.element = el;

      if (typeof this.options.onReady === 'function') {
        this.options.onReady({
          patientId: this.options.patientId,
          encounterId: this.options.encounterId
        });
      }
    }

    this.mounted = true;
  }

  unmount() {
    if (this.bridge) {
      this.bridge.unmount();
      this.bridge = null;
    }
    if (this.element && this.element.parentNode) {
      this.element.parentNode.removeChild(this.element);
      this.element = null;
    }
    this.mounted = false;
  }

  destroy() {
    this.unmount();
  }

  setToken(sdkToken) {
    this.options.sdkToken = sdkToken;
    if (this.element) {
      this.element.setAttribute('sdk-token', sdkToken);
    }
  }

  /**
   * Super-Compress partner EMR categories and items into CSCP compact format.
   * Compresses 500+ hospital items into ~1,500 LLM tokens (10x-15x smaller than raw JSON).
   */
  static compressCatalog(categories = []) {
    const lines = [];
    for (const cat of categories) {
      const catId = cat.id || 'cat';
      const catType = (cat.type || 'SERVICE').toUpperCase();
      const catName = cat.name || catId;
      lines.push(`#CAT:${catId}|${catType}|${catName}`);

      const itemTokens = [];
      const items = cat.items || [];
      for (const it of items) {
        if (typeof it === 'string') {
          itemTokens.push(it);
        } else {
          const id = it.id || it.catalog_id || '';
          const name = it.name || it.item_name || '';
          const code = it.code || '';
          const price = it.price ?? it.unit_price ?? '';
          if (price !== '' && code !== '') {
            itemTokens.push(`${id}:${code}:${name}:${price}`);
          } else if (code !== '') {
            itemTokens.push(`${id}:${code}:${name}`);
          } else {
            itemTokens.push(`${id}:${name}`);
          }
        }
      }
      if (itemTokens.length > 0) {
        lines.push(itemTokens.join('|'));
      }
    }
    return lines.join('\n');
  }
}

