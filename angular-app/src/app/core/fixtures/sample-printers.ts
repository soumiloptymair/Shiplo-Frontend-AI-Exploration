import {
  ConnectedPrinter,
  DiscoveredPrinter,
  defaultAdvancedSettings,
  defaultMappings,
} from '../models/printer.model';

/** ShiploSync discovery list — Figma connect workflow `26410:107876`. */
export const SAMPLE_DISCOVERED_PRINTERS: DiscoveredPrinter[] = [
  {
    id: 'disc-hp400',
    name: 'HP LaserJet 400',
    connection: 'Network',
    resolution: '1200 DPI',
    paperSizes: '8.5 x 11", A4',
    classification: 'Document',
  },
  {
    id: 'disc-canon-pixma',
    name: 'Canon PIXMA',
    connection: 'USB',
    resolution: '4800 DPI',
    paperSizes: '8.5 x 11", A4',
    classification: 'Document',
  },
  {
    id: 'disc-epson-ecotank',
    name: 'Epson EcoTank',
    connection: 'Network',
    resolution: '5760 DPI',
    paperSizes: '8.5 x 11", A4',
    classification: 'Document',
  },
];

export const SAMPLE_CONNECTED_PRINTERS: ConnectedPrinter[] = [
  {
    id: 'printer-hp-1',
    name: 'HP LaserJet 400',
    connection: 'Network',
    resolution: '1200 DPI',
    paperSizes: '8.5 x 11", A4',
    classification: 'Document',
    mappings: defaultMappings().map((m) =>
      m.documentType === 'Packing Slips' || m.documentType === 'Manifests'
        ? { ...m, enabled: true }
        : m,
    ),
    advanced: defaultAdvancedSettings(),
  },
  {
    id: 'printer-hp-2',
    name: 'HP LaserJet 400',
    connection: 'Network',
    resolution: '1200 DPI',
    paperSizes: '8.5 x 11", A4',
    classification: 'Document',
    mappings: defaultMappings().map((m) =>
      m.documentType === 'Packing Slips' ? { ...m, enabled: true } : m,
    ),
    advanced: defaultAdvancedSettings(),
  },
  {
    id: 'printer-hp-3',
    name: 'HP LaserJet 400',
    connection: 'Network',
    resolution: '1200 DPI',
    paperSizes: '8.5 x 11", A4',
    classification: 'Document',
    mappings: defaultMappings().map((m) =>
      m.documentType === 'Packing Slips' ? { ...m, enabled: true } : m,
    ),
    advanced: defaultAdvancedSettings(),
  },
];
