/**
 * CoreHealth AI Scribe SDK — TypeScript Definitions
 */

export type SdkIntegrationTrack = 'web-component' | 'iframe';

export interface CoreHealthScribeOptions {
  /** Base URL of the CoreHealth edge node or cloud server (e.g. http://127.0.0.1:8000) */
  baseUrl: string;
  /** Ephemeral session token (SKT_...) issued by your backend proxy */
  sdkToken: string;
  /** Integration track: 'web-component' (Shadow DOM) or 'iframe' (Sandboxed PostMessage) */
  track?: SdkIntegrationTrack;
  /** Target DOM selector or HTMLElement where the scribe UI should be mounted */
  mountTarget: string | HTMLElement;
  /** Patient ID (optional if embedded in token claims) */
  patientId?: number | string;
  /** Encounter ID (optional if embedded in token claims) */
  encounterId?: number | string;
  /** Optional PII-stripped longitudinal patient brief / summary to enhance speech structuring accuracy */
  patientSummary?: string;
  /** Locale for speech recognition (default: 'en-NG') */
  locale?: string;
  /** Theme: 'light' | 'dark' | 'hospital' */
  theme?: string;
  /** Callback fired when the clinician signs off on the structured note */
  onSignedOff?: (payload: CoreHealthSignOffPayload) => void | Promise<void>;
  /** Callback fired when any error occurs */
  onError?: (error: CoreHealthErrorPayload) => void;
  /** Callback fired when the scribe widget is fully initialized and ready */
  onReady?: (context: { patientId?: number | string; encounterId?: number | string }) => void;
  /** Callback fired when state changes: 'idle' | 'recording' | 'processing' | 'reviewing' | 'signed-off' */
  onStateChange?: (state: string) => void;
}

export interface CoreHealthSignOffPayload {
  audit_id?: number;
  patient_id?: number | string;
  encounter_id?: number | string;
  signed_at: string;
  final_signed_note: string;
  original_transcript?: string;
  openehr_composition?: Record<string, any>;
  fhir_bundle?: {
    resourceType: 'Bundle';
    type: string;
    entry: Array<{ fullUrl?: string; resource: Record<string, any> }>;
  };
  [key: string]: any;
}

export interface CoreHealthErrorPayload {
  code: string;
  message: string;
}

export declare class CoreHealthScribe {
  constructor(options: CoreHealthScribeOptions);
  mount(): Promise<void>;
  unmount(): void;
  destroy(): void;
  setToken(sdkToken: string): void;
}

export declare class IFrameBridge {
  constructor(options: CoreHealthScribeOptions);
  mount(): Promise<void>;
  unmount(): void;
}

