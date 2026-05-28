/**
 * Printer Setup models — Settings → Defaults → Printer.
 *
 * Backed by `PrinterService` with localStorage persistence and a mock
 * ShiploSync desktop bridge for discovery, queue, and print history.
 */

export type BridgeStatus = 'inactive' | 'connecting' | 'active';

export type PrinterConnection = 'Network' | 'USB' | 'Bluetooth';

export type PrinterClassification = 'Label' | 'Document' | 'Thermal' | 'General';

export type DocumentType =
  | 'Labels'
  | 'Packing Slips'
  | 'Manifests'
  | 'Customs Documents'
  | 'Receipts';

export type PrintFormat = 'PDF' | 'ZPL' | 'EPL';

export type PrintJobStatus = 'queued' | 'printing' | 'completed' | 'failed';

export type PrinterTab = 'printers' | 'queue' | 'history';

export const DOCUMENT_TYPES: DocumentType[] = [
  'Labels',
  'Packing Slips',
  'Manifests',
  'Customs Documents',
  'Receipts',
];

/** Connect Printer modal purpose options — Figma workflow `27892:216405`. */
export interface ConnectPrinterPurposeOption {
  label: string;
  documentType: DocumentType;
}

export const CONNECT_PRINTER_PURPOSES: ConnectPrinterPurposeOption[] = [
  { label: 'Packing Slip', documentType: 'Packing Slips' },
  { label: 'Label', documentType: 'Labels' },
  { label: 'Manifest', documentType: 'Manifests' },
  { label: 'Picklist', documentType: 'Receipts' },
];

export const PRINT_FORMATS: PrintFormat[] = ['PDF', 'ZPL', 'EPL'];

export const DEFAULT_FORMAT_BY_DOCUMENT: Record<DocumentType, PrintFormat> = {
  Labels: 'ZPL',
  'Packing Slips': 'PDF',
  Manifests: 'PDF',
  'Customs Documents': 'PDF',
  Receipts: 'PDF',
};

export interface PrinterDocumentMapping {
  documentType: DocumentType;
  enabled: boolean;
  format: PrintFormat;
}

export interface PrinterAdvancedSettings {
  silentPrint: boolean;
  copies: number;
  orientation: 'Portrait' | 'Landscape';
  scaleToFit: boolean;
  dpi: number;
}

export interface ConnectedPrinter {
  id: string;
  name: string;
  connection: PrinterConnection;
  resolution: string;
  paperSizes: string;
  classification: PrinterClassification;
  mappings: PrinterDocumentMapping[];
  advanced: PrinterAdvancedSettings;
}

export interface DiscoveredPrinter {
  id: string;
  name: string;
  connection: PrinterConnection;
  resolution: string;
  paperSizes: string;
  classification: PrinterClassification;
}

export interface PrintJob {
  id: string;
  printerId: string;
  printerName: string;
  documentType: DocumentType;
  format: PrintFormat;
  shipmentRef?: string;
  status: PrintJobStatus;
  createdAt: string;
  completedAt?: string;
  errorMessage?: string;
  /** Mock PDF preview URL for completed jobs. */
  pdfUrl?: string;
}

export type ConnectedPrinterInsert = Omit<ConnectedPrinter, 'id'>;

export function defaultMappings(): PrinterDocumentMapping[] {
  return DOCUMENT_TYPES.map((documentType) => ({
    documentType,
    enabled: documentType === 'Packing Slips',
    format: DEFAULT_FORMAT_BY_DOCUMENT[documentType],
  }));
}

export function defaultAdvancedSettings(): PrinterAdvancedSettings {
  return {
    silentPrint: true,
    copies: 1,
    orientation: 'Portrait',
    scaleToFit: true,
    dpi: 300,
  };
}

export function assignedPurposeLabel(mappings: PrinterDocumentMapping[]): string {
  const enabled = mappings.filter((m) => m.enabled).map((m) => m.documentType);
  return enabled.length ? enabled.join(', ') : 'None';
}
