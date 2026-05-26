import { TrackingPreviewData } from '../models/branded-tracking.model';

/** Sample shipment data shown in the branded tracking preview (Figma node 23011:279866). */
export const SAMPLE_TRACKING_PREVIEW: TrackingPreviewData = {
  estDeliveryLabel: 'Friday, February 24',
  statusSubtitle: 'Departed from Fedex Location',
  orderNumber: '30112657244',
  timeline: [
    { label: 'Ordered', state: 'complete' },
    { label: 'Processing', state: 'complete' },
    { label: 'In Transit', state: 'complete' },
    { label: 'Out for Delivery', state: 'current' },
    { label: 'Delivered', state: 'upcoming' },
  ],
  shipmentInfo: {
    shipmentId: '#20230101180003',
    carrier: 'Fedex',
    shippingMethod: 'Fedex Home Delivery',
    trackingId: '090827096412356',
    shippingTo: 'John Doe, 3672 Chesterfield Blvd., Nashville, TN 73928, US',
  },
  items: Array.from({ length: 4 }, () => ({
    name: 'Product Name',
    qty: 2,
  })),
  documents: [
    {
      name: 'Bill of Lading',
      thumbnailSrc: 'figmaAssets/tracking-doc-bill-of-lading.png',
      previewSrc: 'figmaAssets/tracking-doc-bill-of-lading.png',
    },
    {
      name: 'Label 01',
      thumbnailSrc: 'figmaAssets/tracking-doc-label-01.png',
      previewSrc: 'figmaAssets/tracking-doc-label-01.png',
    },
    {
      name: 'Manifest',
      thumbnailSrc: 'figmaAssets/tracking-doc-manifest.png',
      previewSrc: 'figmaAssets/tracking-doc-manifest.png',
    },
    {
      name: 'Packaging slip 1234',
      thumbnailSrc: 'figmaAssets/tracking-doc-packaging-slip.png',
      previewSrc: 'figmaAssets/tracking-doc-packaging-slip.png',
    },
  ],
  lastLocation: {
    label: 'Last Location',
    status: 'In-Transit',
    address: 'Houston, TX, US, Harris 77052',
    timestamp: 'November 12, 2023, 12:56 PM',
    mapPinLabel: 'Houston, TX',
  },
  history: [
    {
      dateLabel: 'Thursday, Jan 16',
      events: [
        { time: '12:56 PM', status: 'Out for Delivery', location: 'Kansas, KS US' },
        { time: '12:56 PM', status: 'Available for Pick-up', location: 'Kansas, KS US' },
        { time: '12:56 PM', status: 'Courier Assigned', location: 'Kansas, KS US' },
        { time: '12:56 PM', status: 'Customs Cleared', location: 'Kansas, KS US' },
      ],
    },
    {
      dateLabel: 'Friday, Jan 17',
      events: [
        { time: '12:56 PM', status: 'Departed from Fedex Location', location: 'Kansas, KS US' },
        { time: '12:56 PM', status: 'Processing', location: 'Kansas, KS US' },
        { time: '12:56 PM', status: 'Ordered', location: 'Kansas, KS US' },
        { time: '12:56 PM', status: 'Label Created', location: 'Kansas, KS US' },
      ],
    },
  ],
};
