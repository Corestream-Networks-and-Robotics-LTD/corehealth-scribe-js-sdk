/**
 * CoreHealth AI Scribe — iFrame Bridge
 * Manages sandboxed iframe creation and postMessage communication.
 */

export class IFrameBridge {
  constructor(options) {
    this.options = options;
    this.iframe = null;
    this.messageHandler = this.handleMessage.bind(this);
    this.mounted = false;
  }

  async mount() {
    if (this.mounted) return;

    const target = typeof this.options.mountTarget === 'string'
      ? document.querySelector(this.options.mountTarget)
      : this.options.mountTarget;

    if (!target) {
      throw new Error(`[CoreHealthScribe] Mount target "${this.options.mountTarget}" not found in DOM.`);
    }

    const baseUrl = (this.options.baseUrl || '').replace(/\/+$/, '');
    const params = new URLSearchParams({
      token: this.options.sdkToken || '',
      locale: this.options.locale || 'en-NG',
      theme: this.options.theme || 'light',
    });

    if (this.options.patientId) params.set('patient_id', String(this.options.patientId));
    if (this.options.encounterId) params.set('encounter_id', String(this.options.encounterId));
    if (this.options.patientSummary) params.set('patient_summary', String(this.options.patientSummary));
    if (this.options.role) params.set('role', String(this.options.role));
    if (this.options.taxonomy) params.set('taxonomy', String(this.options.taxonomy));
    if (this.options.customCatalog) {
      params.set('custom_catalog', typeof this.options.customCatalog === 'string'
        ? this.options.customCatalog
        : JSON.stringify(this.options.customCatalog));
    }

    const iframe = document.createElement('iframe');
    iframe.src = `${baseUrl}/scribe?${params.toString()}`;
    iframe.setAttribute('allow', 'microphone');
    iframe.setAttribute('title', 'CoreHealth AI Scribe Studio');
    iframe.setAttribute('sandbox', 'allow-scripts allow-same-origin allow-forms allow-microphone');
    iframe.style.width = '100%';
    iframe.style.height = '620px';
    iframe.style.border = 'none';
    iframe.style.borderRadius = '8px';
    iframe.style.boxShadow = '0 2px 12px rgba(0,0,0,0.08)';

    this.iframe = iframe;
    target.innerHTML = '';
    target.appendChild(iframe);

    window.addEventListener('message', this.messageHandler);
    this.mounted = true;
  }

  handleMessage(event) {
    // Validate origin if possible
    if (this.options.baseUrl) {
      try {
        const expectedOrigin = new URL(this.options.baseUrl).origin;
        if (event.origin !== expectedOrigin && event.origin !== window.location.origin) {
          return;
        }
      } catch (e) {
        // Fall through
      }
    }

    const data = event.data;
    if (!data || typeof data !== 'object' || !data.type) return;

    switch (data.type) {
      case 'corehealth:ready':
        if (typeof this.options.onReady === 'function') {
          this.options.onReady(data.payload || {});
        }
        if (typeof this.options.onStateChange === 'function') {
          this.options.onStateChange('idle');
        }
        break;

      case 'corehealth:recording-started':
        if (typeof this.options.onStateChange === 'function') {
          this.options.onStateChange('recording');
        }
        break;

      case 'corehealth:processing':
        if (typeof this.options.onStateChange === 'function') {
          this.options.onStateChange('processing');
        }
        break;

      case 'corehealth:note-ready':
        if (typeof this.options.onStateChange === 'function') {
          this.options.onStateChange('reviewing');
        }
        break;

      case 'corehealth:orders-updated':
        if (typeof this.options.onOrdersUpdated === 'function') {
          this.options.onOrdersUpdated(data.payload || []);
        }
        break;

      case 'corehealth:signed-off':
        if (typeof this.options.onStateChange === 'function') {
          this.options.onStateChange('signed-off');
        }
        if (typeof this.options.onSignedOff === 'function') {
          this.options.onSignedOff(data.payload || {});
        }
        break;

      case 'corehealth:error':
        if (typeof this.options.onError === 'function') {
          this.options.onError(data.payload || { code: 'UNKNOWN_ERROR', message: 'An unknown error occurred.' });
        }
        break;
    }
  }

  unmount() {
    window.removeEventListener('message', this.messageHandler);
    if (this.iframe && this.iframe.parentNode) {
      this.iframe.parentNode.removeChild(this.iframe);
    }
    this.iframe = null;
    this.mounted = false;
  }
}

