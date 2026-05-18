import { useState } from "react";
import {
  X,
  Printer,
  MoreVertical,
  Package,
  ExternalLink,
  ChevronDown,
} from "lucide-react";
import type { Shipment, ShipmentStatus } from "@shared/schema";

const CARRIER_ICON = "/figmaAssets/pngegg--2--1-1.png";

const STATUS_PILL_BG: Record<ShipmentStatus, string> = {
  Shipped:        "bg-status-shipped",
  Pending:        "bg-status-picking",
  "Label Created":"bg-status-label-created",
  Delayed:        "bg-status-delayed",
  Delivered:      "bg-status-delivered",
  "On Hold":      "bg-status-on-hold",
  "Needs Review": "bg-status-needs-review",
  Cancelled:      "bg-status-cancelled",
};

type PanelTab = "Label" | "Details" | "Products" | "Notes";
const TABS: PanelTab[] = ["Label", "Details", "Products", "Notes"];

const LabelField = ({
  label,
  value,
  className = "",
}: {
  label: string;
  value: React.ReactNode;
  className?: string;
}) => (
  <div className={`flex flex-col gap-1 ${className}`}>
    <p className="font-body text-xs font-normal text-[#45565b]">{label}</p>
    <div className="font-body text-sm font-normal text-[#0b1516]">{value}</div>
  </div>
);

const DataRow = ({ children }: { children: React.ReactNode }) => (
  <div className="flex gap-8">{children}</div>
);

interface Props {
  shipment: Shipment;
  onClose: () => void;
}

export const ShipmentDetailPanel = ({ shipment, onClose }: Props) => {
  const [activeTab, setActiveTab] = useState<PanelTab>("Label");

  return (
    <div
      className="flex w-[404px] shrink-0 flex-col overflow-hidden rounded-lg bg-white"
      data-testid="panel-shipment-detail"
    >
      {/* ── Label Bar ── */}
      <div className="flex shrink-0 items-center justify-between rounded-tl-lg rounded-tr-lg border-b border-[#b8c6cc] px-2 py-2">
        <div className="flex items-center gap-1">
          <Package className="h-5 w-5 text-[#45565b]" aria-hidden />
          <span className="font-body text-xs font-medium uppercase tracking-wide text-[#45565b]">
            Order
          </span>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            aria-label="More options"
            data-testid="button-panel-menu"
            className="flex h-6 w-6 items-center justify-center rounded text-neutral-600 hover:bg-neutral-100"
          >
            <MoreVertical className="h-5 w-5" />
          </button>
          <button
            type="button"
            aria-label="Close panel"
            data-testid="button-close-panel"
            onClick={onClose}
            className="flex h-6 w-6 items-center justify-center rounded text-neutral-600 hover:bg-neutral-100"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* ── Shipment Header ── */}
      <div className="shrink-0 bg-white px-4 py-4">
        <div className="flex items-start justify-between gap-2">
          <span
            className="font-body text-lg font-bold leading-snug text-[#0b1516]"
            data-testid="text-panel-shipment-id"
          >
            ID: {shipment.shipmentId}
          </span>
          <div
            className={`flex shrink-0 items-center gap-1 rounded-full border border-[#b8c6cc] px-2 py-0.5 ${
              STATUS_PILL_BG[shipment.status as ShipmentStatus] ?? "bg-neutral-100"
            }`}
          >
            <span className="font-body text-sm font-normal text-[#0b1516]">
              {shipment.status}
            </span>
            <ChevronDown className="h-4 w-4 text-[#0b1516]" />
          </div>
        </div>
        <div className="mt-1 flex flex-col gap-0.5">
          <p className="font-body text-xs text-[#45565b]">
            Order Number:{" "}
            <span className="text-[#0b1516]">234779001</span>
          </p>
          <p className="font-body text-xs text-[#45565b]">
            Created on:{" "}
            <span className="text-[#0b1516]">January 8, 2023, 2:32pm EST</span>
          </p>
        </div>
      </div>

      {/* ── Tabs ── */}
      <div className="flex shrink-0 border-b border-[#e4eaed]">
        {TABS.map((tab) => {
          const isActive = activeTab === tab;
          return (
            <button
              key={tab}
              type="button"
              data-testid={`tab-panel-${tab.toLowerCase()}`}
              onClick={() => setActiveTab(tab)}
              className={`px-3 py-2.5 font-body text-sm whitespace-nowrap transition-colors ${
                isActive
                  ? "border-b-2 border-[#008572] font-medium text-[#008572]"
                  : "font-normal text-[#0b1516] hover:bg-neutral-50"
              }`}
            >
              {tab}
            </button>
          );
        })}
      </div>

      {/* ── Tab Content ── */}
      <div className="flex-1 overflow-y-auto">
        {activeTab === "Label" && (
          <div className="flex flex-col gap-4 p-5">
            {/* Shipping Label card */}
            <div className="flex flex-col gap-4 rounded-lg bg-[#f6f9fb] p-3">
              {/* Card header */}
              <div className="flex items-center justify-between">
                <span className="font-body text-base font-medium text-[#0b1516]">
                  Shipping Label
                </span>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    aria-label="Print label"
                    data-testid="button-print-label"
                    className="flex h-6 w-6 items-center justify-center rounded text-neutral-600 hover:bg-neutral-200"
                  >
                    <Printer className="h-5 w-5" />
                  </button>
                  <button
                    type="button"
                    aria-label="More label options"
                    data-testid="button-label-menu"
                    className="flex h-6 w-6 items-center justify-center rounded text-neutral-600 hover:bg-neutral-200"
                  >
                    <MoreVertical className="h-5 w-5" />
                  </button>
                </div>
              </div>

              {/* Section 1 */}
              <div className="flex flex-col gap-4">
                <DataRow>
                  <LabelField label="Warehouse" value={shipment.warehouse} className="w-[168px] shrink-0" />
                  <LabelField label="Shipping to" value="75039-0045" />
                </DataRow>
                <DataRow>
                  <LabelField label="Freight Type" value={shipment.freightType || "—"} className="w-[168px] shrink-0" />
                  <LabelField label="Shipping Method" value={shipment.method || "All"} />
                </DataRow>
                <LabelField
                  label="Shipment Type"
                  value={
                    <span className="inline-flex items-center gap-1.5">
                      {shipment.shipping !== "To be assigned" && (
                        <img src={CARRIER_ICON} alt="" className="h-4 w-4 shrink-0 rounded-sm" />
                      )}
                      <span>{shipment.shipping}</span>
                    </span>
                  }
                />
              </div>

              <hr className="border-[#e4eaed]" />

              {/* Section 2 */}
              <div className="flex flex-col gap-4">
                <DataRow>
                  <LabelField label="Purchase Order #" value="312463USA26" className="w-[168px] shrink-0" />
                  <LabelField label="Department #" value="USA2620212" />
                </DataRow>
                <LabelField
                  label="Notes"
                  value="Deliver at front door between 2-6pm weekdays and 10-8pm weekends."
                />
                <DataRow>
                  <LabelField label="Label Size" value={`4" × 6"`} className="w-[168px] shrink-0" />
                  <LabelField label="Brand Logo Included" value="No" />
                </DataRow>
              </div>

              <hr className="border-[#e4eaed]" />

              {/* Section 3 */}
              <div className="flex flex-col gap-4">
                <DataRow>
                  <LabelField
                    label="Est Delivery"
                    value={
                      <span>
                        Wednesday, 01/17/2025,<br />10:00 AM EST
                      </span>
                    }
                    className="w-[168px] shrink-0"
                  />
                  <LabelField
                    label="Insurance"
                    value={
                      <span className="flex flex-col gap-0.5">
                        <span>Covers up to $50</span>
                        <a
                          href="#"
                          onClick={(e) => e.preventDefault()}
                          className="font-body text-sm text-[#008572] hover:underline"
                        >
                          Increase Coverage
                        </a>
                      </span>
                    }
                  />
                </DataRow>
                <DataRow>
                  <LabelField label="Account Number" value="681350810" className="w-[168px] shrink-0" />
                  <LabelField label="Est. Freight Cost" value="$10.50" />
                </DataRow>
              </div>
            </div>

            {/* Schedule Pickup CTA */}
            <button
              type="button"
              data-testid="button-schedule-pickup"
              className="flex w-full items-center justify-center gap-2 rounded-lg border border-[#008572] px-4 py-2.5 font-body text-sm font-medium text-[#008572] transition-colors hover:bg-[#f6f9fb]"
            >
              <ExternalLink className="h-4 w-4" />
              Schedule Pickup
            </button>
          </div>
        )}

        {activeTab === "Details" && (
          <div className="p-5">
            <p className="font-body text-sm text-[#45565b]">
              Detailed shipment information will appear here.
            </p>
          </div>
        )}

        {activeTab === "Products" && (
          <div className="p-5">
            <p className="font-body text-sm text-[#45565b]">
              Products for this shipment will appear here.
            </p>
          </div>
        )}

        {activeTab === "Notes" && (
          <div className="p-5">
            <p className="font-body text-sm text-[#45565b]">
              Notes for this shipment will appear here.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
