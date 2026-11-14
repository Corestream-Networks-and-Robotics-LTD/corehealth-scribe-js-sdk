/**
 * CoreHealth by CorestreamNG — AI Scribe Embeddable SDK
 * TypeScript Definitions
 *
 * (c) Corehealth by CorestreamNG <hello@corestream.ng>
 */

export type SdkIntegrationTrack = 'web-component' | 'iframe';
export type ClinicianRole = 'doctor' | 'nurse' | 'maternity';
export type ClinicalTaxonomy =
  | 'soap'
  | 'clerking'
  | 'pomr'
  | 'dar'
  | 'sbar'
  | 'soapie'
  | 'anc'
  | 'labor'
  | 'pnc'
  | 'neonatal';

export interface CoreHealthCatalogItem {
  id: string | number;
  name: string;
  code?: string;
  price?: number;
  unit_price?: number;
}

export interface CoreHealthCatalogCategory {
  id: string | number;
  name: string;
  type: 'LAB' | 'RAD' | 'PROC' | 'NURS' | 'RX' | 'CONSULT' | 'SERVICE' | 'PRODUCT';
  items?: Array<CoreHealthCatalogItem | string>;
}

export interface ClinicalOrderItem {
  id: string;
  order_type: 'PRODUCT' | 'SERVICE' | 'REFERRAL' | 'FOLLOW_UP';
  service_type?: 'lab' | 'imaging' | 'procedure' | 'nursing' | 'consultation' | 'product';
  category_id?: string | number | null;
  category_name?: string;
  catalog_id?: string | number | null;
  item_name: string;
  dosage?: string;
  frequency?: string;
  duration?: string;
  route?: string;
  quantity?: number;
  indication?: string;
  instructions?: string;
  unit_price?: number;
  target_queue?: string;
  is_selected: boolean;
  is_matched: boolean;
  is_free_form: boolean;
  safety_warning?: string | null;
}

export interface CoreHealthScribeOptions {
  /** Base URL of the CoreHealth API (e.g. https://corehealth.hospital.org or http://127.0.0.1:8000) */
  baseUrl: string;
  /** Ephemeral session token (SKT_...) minted by your backend proxy */
  sdkToken: string;
  /** Integration track: 'web-component' (Shadow DOM) or 'iframe' (Sandboxed PostMessage) */
  track?: SdkIntegrationTrack;
  /** Target DOM selector or HTMLElement where the Scribe UI will mount */
  mountTarget: string | HTMLElement;
  /** Patient ID */
  patientId?: number | string;
  /** Encounter ID */
  encounterId?: number | string;
  /** Clinician perspective: 'doctor' (default), 'nurse', or 'maternity' */
  role?: ClinicianRole;
  /** Initial clinical taxonomy format: 'soap' (default for doctor), 'clerking', 'pomr', 'dar', 'sbar', 'anc', etc. */
  taxonomy?: ClinicalTaxonomy;
  /** Optional PII-stripped longitudinal patient brief / summary to enhance ambient structuring */
  patientSummary?: string;
  /**
   * Super-compressed partner EMR catalog in CSCP format or array of categories.
   * Grounding engine matches spoken drugs, labs, scans, and procedures to your catalog IDs.
   */
  customCatalog?: string | CoreHealthCatalogCategory[] | Record<string, any>;
  /** Speech recognition locale (default: 'en-NG') */
  locale?: string;
  /** Visual theme: 'light' | 'dark' | 'hospital' */
  theme?: string;
  /** Callback fired when the clinician signs off on the structured note and approved orders */
  onSignedOff?: (payload: CoreHealthSignOffPayload) => void | Promise<void>;
  /** Callback fired when staged orders change or new orders are extracted */
  onOrdersUpdated?: (orders: ClinicalOrderItem[]) => void;
  /** Callback fired when any client or network error occurs */
  onError?: (error: CoreHealthErrorPayload) => void;
  /** Callback fired when the Scribe Studio is initialized and ready for dictation */
  onReady?: (context: { patientId?: number | string; encounterId?: number | string }) => void;
  /** Callback fired on state changes: 'idle' | 'recording' | 'processing' | 'reviewing' | 'signed-off' */
  onStateChange?: (state: string) => void;
}

export interface CoreHealthSignOffPayload {
  audit_id?: number;
  patient_id?: number | string;
  encounter_id?: number | string;
  role?: string;
  taxonomy?: string;
  signed_at: string;
  final_signed_note: string;
  original_transcript?: string;
  approved_orders?: ClinicalOrderItem[];
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
  /**
   * Super-Compress partner EMR categories and items into CSCP compact format.
   * Compresses 500+ hospital items into ~1,500 LLM tokens (10x-15x smaller than raw JSON).
   */
  static compressCatalog(categories: CoreHealthCatalogCategory[]): string;
}

export declare class IFrameBridge {
  constructor(options: CoreHealthScribeOptions);
  mount(): Promise<void>;
  unmount(): void;
}
