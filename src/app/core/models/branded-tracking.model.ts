export interface BrandedTrackingConfig {
  logoDataUrl: string | null;
  logoUrl: string;
  primaryColor: string;
  backgroundColor: string;
  displayDocuments: boolean;
  reasonCodes: ReasonCodeRow[];
}

export interface ReasonCodeRow {
  id: string;
  code: string;
}

export interface TrackingDocument {
  name: string;
  thumbnailSrc: string;
  /** Full-size image shown in the document preview modal. */
  previewSrc: string;
}

export interface TrackingTimelineStep {
  label: string;
  state: 'complete' | 'current' | 'upcoming';
}

export interface TrackingHistoryEvent {
  time: string;
  status: string;
  location: string;
}

export interface TrackingHistoryDay {
  dateLabel: string;
  events: TrackingHistoryEvent[];
}

export interface TrackingPreviewData {
  estDeliveryLabel: string;
  statusSubtitle: string;
  orderNumber: string;
  timeline: TrackingTimelineStep[];
  shipmentInfo: {
    shipmentId: string;
    carrier: string;
    shippingMethod: string;
    trackingId: string;
    shippingTo: string;
  };
  items: { name: string; qty: number }[];
  documents: TrackingDocument[];
  lastLocation: {
    label: string;
    status: string;
    address: string;
    timestamp: string;
    mapPinLabel: string;
  };
  history: TrackingHistoryDay[];
}

export const DEFAULT_BRANDED_TRACKING_CONFIG: BrandedTrackingConfig = {
  logoDataUrl: null,
  logoUrl: 'shiplo.com',
  primaryColor: '#008572',
  backgroundColor: '#F6F9FB',
  displayDocuments: true,
  reasonCodes: [{ id: 'reason-1', code: '1234' }],
};
