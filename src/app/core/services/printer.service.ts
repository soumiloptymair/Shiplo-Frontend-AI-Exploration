import { Injectable, computed, signal } from '@angular/core';
import {
  SAMPLE_CONNECTED_PRINTERS,
  SAMPLE_DISCOVERED_PRINTERS,
} from '../fixtures/sample-printers';
import {
  SAMPLE_PRINT_HISTORY,
  SAMPLE_PRINT_QUEUE,
} from '../fixtures/sample-print-jobs';
import {
  BridgeStatus,
  ConnectedPrinter,
  ConnectedPrinterInsert,
  DiscoveredPrinter,
  DocumentType,
  PrintFormat,
  PrintJob,
  PrinterAdvancedSettings,
  PrinterDocumentMapping,
  assignedPurposeLabel,
  defaultAdvancedSettings,
  defaultMappings,
} from '../models/printer.model';

const STORAGE_KEY = 'shiplo.printer-setup';

interface PersistedState {
  bridgeActive: boolean;
  connectedPrinters: ConnectedPrinter[];
  printQueue: PrintJob[];
  printHistory: PrintJob[];
}

export interface SilentPrintRequest {
  documentType: DocumentType;
  shipmentRef: string;
  format?: PrintFormat;
}

export interface SilentPrintResult {
  ok: boolean;
  jobId?: string;
  printerName?: string;
  error?: string;
}

@Injectable({ providedIn: 'root' })
export class PrinterService {
  private readonly bridgeActive = signal<boolean>(this.load().bridgeActive);
  readonly connectedPrinters = signal<ConnectedPrinter[]>(this.load().connectedPrinters);
  readonly printQueue = signal<PrintJob[]>(this.load().printQueue);
  readonly printHistory = signal<PrintJob[]>(this.load().printHistory);
  readonly activeTab = signal<'printers' | 'queue' | 'history'>('printers');

  readonly bridgeStatus = computed<BridgeStatus>(() =>
    this.bridgeActive() ? 'active' : 'inactive',
  );

  readonly discoveredPrinters = computed<DiscoveredPrinter[]>(() => {
    if (!this.bridgeActive()) return [];
    return SAMPLE_DISCOVERED_PRINTERS;
  });

  readonly activeQueueJobs = computed(() =>
    this.printQueue().filter((j) => j.status === 'queued' || j.status === 'printing'),
  );

  connectBridge(): void {
    this.bridgeActive.set(true);
    this.persist();
  }

  disconnectBridge(): void {
    this.bridgeActive.set(false);
    this.persist();
  }

  simulateBridgeDownload(): void {
    this.bridgeActive.set(true);
    this.persist();
  }

  connectPrinter(
    discovered: DiscoveredPrinter,
    mappings?: PrinterDocumentMapping[],
    advanced?: PrinterAdvancedSettings,
  ): ConnectedPrinter {
    const created: ConnectedPrinter = {
      id: `printer-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      name: discovered.name,
      connection: discovered.connection,
      resolution: discovered.resolution,
      paperSizes: discovered.paperSizes,
      classification: discovered.classification,
      mappings: mappings ?? defaultMappings(),
      advanced: advanced ?? defaultAdvancedSettings(),
    };
    this.connectedPrinters.update((rows) => [...rows, created]);
    this.persist();
    return created;
  }

  updatePrinter(updated: ConnectedPrinter): void {
    this.connectedPrinters.update((rows) =>
      rows.map((r) => (r.id === updated.id ? updated : r)),
    );
    this.persist();
  }

  disconnectPrinter(id: string): void {
    this.connectedPrinters.update((rows) => rows.filter((r) => r.id !== id));
    this.printQueue.update((jobs) => jobs.filter((j) => j.printerId !== id));
    this.persist();
  }

  testPrint(printerId: string): PrintJob | null {
    const printer = this.connectedPrinters().find((p) => p.id === printerId);
    if (!printer || !this.bridgeActive()) return null;

    const mapping =
      printer.mappings.find((m) => m.enabled) ?? printer.mappings[0];
    const job = this.enqueueJob({
      printerId: printer.id,
      printerName: printer.name,
      documentType: mapping.documentType,
      format: mapping.format,
      shipmentRef: 'TEST-PRINT',
      silent: printer.advanced.silentPrint,
    });
    return job;
  }

  reprint(jobId: string): PrintJob | null {
    const original = this.printHistory().find((j) => j.id === jobId);
    if (!original || !this.bridgeActive()) return null;

    return this.enqueueJob({
      printerId: original.printerId,
      printerName: original.printerName,
      documentType: original.documentType,
      format: original.format,
      shipmentRef: original.shipmentRef,
      pdfUrl: original.pdfUrl,
      silent: true,
    });
  }

  /** Integration hook for Ship flow — routes to mapped printer when bridge is active. */
  silentPrint(request: SilentPrintRequest): SilentPrintResult {
    if (!this.bridgeActive()) {
      return { ok: false, error: 'ShiploSync bridge is not active.' };
    }

    const printer = this.connectedPrinters().find((p) =>
      p.mappings.some((m) => m.enabled && m.documentType === request.documentType),
    );

    if (!printer) {
      return {
        ok: false,
        error: `No printer mapped for ${request.documentType}.`,
      };
    }

    const mapping = printer.mappings.find(
      (m) => m.enabled && m.documentType === request.documentType,
    )!;

    const job = this.enqueueJob({
      printerId: printer.id,
      printerName: printer.name,
      documentType: request.documentType,
      format: request.format ?? mapping.format,
      shipmentRef: request.shipmentRef,
      silent: printer.advanced.silentPrint,
    });

    return {
      ok: true,
      jobId: job.id,
      printerName: printer.name,
    };
  }

  cancelQueuedJob(jobId: string): void {
    this.printQueue.update((jobs) => jobs.filter((j) => j.id !== jobId));
    this.persist();
  }

  setActiveTab(tab: 'printers' | 'queue' | 'history'): void {
    this.activeTab.set(tab);
  }

  purposeLabel(printer: ConnectedPrinter): string {
    return assignedPurposeLabel(printer.mappings);
  }

  private enqueueJob(input: {
    printerId: string;
    printerName: string;
    documentType: DocumentType;
    format: PrintFormat;
    shipmentRef?: string;
    pdfUrl?: string;
    silent: boolean;
  }): PrintJob {
    const job: PrintJob = {
      id: `job-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      printerId: input.printerId,
      printerName: input.printerName,
      documentType: input.documentType,
      format: input.format,
      shipmentRef: input.shipmentRef,
      status: 'queued',
      createdAt: new Date().toISOString(),
      pdfUrl: input.pdfUrl,
    };

    this.printQueue.update((jobs) => [...jobs, job]);
    this.persist();
    this.processQueue(job.id);
    return job;
  }

  private processQueue(jobId: string): void {
    window.setTimeout(() => {
      this.printQueue.update((jobs) =>
        jobs.map((j) => (j.id === jobId ? { ...j, status: 'printing' } : j)),
      );
      this.persist();
    }, 400);

    window.setTimeout(() => {
      const current = this.printQueue().find((j) => j.id === jobId);
      if (!current) return;

      const failed = !this.bridgeActive();
      const completed: PrintJob = {
        ...current,
        status: failed ? 'failed' : 'completed',
        completedAt: new Date().toISOString(),
        errorMessage: failed ? 'Printer offline — check ShiploSync connection.' : undefined,
        pdfUrl:
          current.pdfUrl ??
          (current.format === 'PDF'
            ? '/figmaAssets/tracking-doc-packaging-slip.png'
            : undefined),
      };

      this.printQueue.update((jobs) => jobs.filter((j) => j.id !== jobId));
      this.printHistory.update((jobs) => [completed, ...jobs].slice(0, 50));
      this.persist();
    }, 1800);
  }

  private load(): PersistedState {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return seed();
      const parsed = JSON.parse(raw) as Partial<PersistedState>;
      return {
        bridgeActive: parsed.bridgeActive ?? true,
        connectedPrinters: parsed.connectedPrinters?.length
          ? parsed.connectedPrinters
          : SAMPLE_CONNECTED_PRINTERS,
        printQueue: parsed.printQueue ?? SAMPLE_PRINT_QUEUE,
        printHistory: parsed.printHistory ?? SAMPLE_PRINT_HISTORY,
      };
    } catch {
      return seed();
    }
  }

  private persist(): void {
    const state: PersistedState = {
      bridgeActive: this.bridgeActive(),
      connectedPrinters: this.connectedPrinters(),
      printQueue: this.printQueue(),
      printHistory: this.printHistory(),
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }
}

function seed(): PersistedState {
  return {
    bridgeActive: true,
    connectedPrinters: SAMPLE_CONNECTED_PRINTERS,
    printQueue: SAMPLE_PRINT_QUEUE,
    printHistory: SAMPLE_PRINT_HISTORY,
  };
}

export type { ConnectedPrinterInsert };
