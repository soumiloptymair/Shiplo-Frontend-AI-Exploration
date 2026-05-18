import { useState } from "react";
import {
  X,
  Printer,
  MoreVertical,
  Package,
  ExternalLink,
  ChevronDown,
  Clock,
  CircleDollarSign,
  Truck,
  Store,
  Warehouse,
  Undo2,
  Plus,
} from "lucide-react";
import type { Shipment, ShipmentStatus } from "@shared/schema";

const CARRIER_ICON = "/figmaAssets/pngegg--2--1-1.png";
const SOURCE_ICON = "/figmaAssets/integrations-1.png";

const STATUS_PILL_BG: Record<ShipmentStatus, string> = {
  Shipped:         "bg-status-shipped",
  Pending:         "bg-status-picking",
  "Label Created": "bg-status-label-created",
  Delayed:         "bg-status-delayed",
  Delivered:       "bg-status-delivered",
  "On Hold":       "bg-status-on-hold",
  "Needs Review":  "bg-status-needs-review",
  Cancelled:       "bg-status-cancelled",
};

type PanelTab = "Label" | "Details" | "Products" | "Notes";
const TABS: PanelTab[] = ["Label", "Details", "Products", "Notes"];

/* ── Shared label/value block ── */
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

/* ── Details-tab icon row item ── */
const IconField = ({
  icon,
  label,
  value,
  link = false,
}: {
  icon: React.ReactNode;
  label: string;
  value: React.ReactNode;
  link?: boolean;
}) => (
  <div className="flex w-[180px] shrink-0 items-center gap-4">
    <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-neutral-100 text-neutral-500">
      {icon}
    </div>
    <div className="flex flex-col gap-1">
      <p className="font-body text-xs text-[#45565b] whitespace-nowrap">{label}</p>
      <div
        className={`font-body text-sm whitespace-nowrap ${
          link ? "font-medium text-[#2da1cb]" : "font-normal text-[#0b1516]"
        }`}
      >
        {value}
      </div>
    </div>
  </div>
);

/* ── Section subheader ── */
const SectionHeader = ({
  title,
  action,
}: {
  title: string;
  action?: React.ReactNode;
}) => (
  <div className="flex items-center gap-2">
    <p className="font-body text-xs font-medium uppercase tracking-wide text-[#0b1516] whitespace-nowrap">
      {title}
    </p>
    <div className="h-px flex-1 bg-[#e4eaed]" />
    {action}
  </div>
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

        {/* ── LABEL TAB ── */}
        {activeTab === "Label" && (
          <div className="flex flex-col gap-4 p-5">
            <div className="flex flex-col gap-4 rounded-lg bg-[#f6f9fb] p-3">
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

              <div className="flex flex-col gap-4">
                <DataRow>
                  <LabelField
                    label="Est Delivery"
                    value={<span>Wednesday, 01/17/2025,<br />10:00 AM EST</span>}
                    className="w-[168px] shrink-0"
                  />
                  <LabelField
                    label="Insurance"
                    value={
                      <span className="flex flex-col gap-0.5">
                        <span>Covers up to $50</span>
                        <a href="#" onClick={(e) => e.preventDefault()} className="font-body text-sm text-[#008572] hover:underline">
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

        {/* ── DETAILS TAB ── */}
        {activeTab === "Details" && (
          <div className="flex flex-col gap-5 p-5">

            {/* Info rows */}
            <div className="flex flex-col gap-4">
              {/* Row 1 */}
              <div className="flex items-center">
                <IconField
                  icon={<Clock className="h-3.5 w-3.5" />}
                  label="Shipping Method"
                  value={shipment.method || "Standard"}
                />
                <IconField
                  icon={<CircleDollarSign className="h-3.5 w-3.5" />}
                  label="Shipment Value"
                  value={shipment.value}
                />
              </div>
              {/* Row 2 */}
              <div className="flex items-center">
                <IconField
                  icon={<Truck className="h-3.5 w-3.5" />}
                  label="Freight Type"
                  value={shipment.freightType || "—"}
                />
                <IconField
                  icon={<Store className="h-3.5 w-3.5" />}
                  label="Source"
                  value={
                    <span className="inline-flex items-center gap-1">
                      <img src={SOURCE_ICON} alt="" className="h-4 w-4 shrink-0" />
                      <span className="overflow-hidden text-ellipsis text-[#2da1cb]">{shipment.source}</span>
                    </span>
                  }
                  link={false}
                />
              </div>
              {/* Row 3 */}
              <div className="flex items-center">
                <IconField
                  icon={<Warehouse className="h-3.5 w-3.5" />}
                  label="Fulfillment"
                  value={shipment.warehouse}
                  link
                />
                <IconField
                  icon={<Undo2 className="h-3.5 w-3.5" />}
                  label="Return"
                  value={shipment.warehouse}
                  link
                />
              </div>
            </div>

            {/* CARRIER section */}
            <div className="flex flex-col gap-4">
              <SectionHeader title="Carrier" />
              {/* Carrier name */}
              <div className="flex items-center gap-2">
                <img src={CARRIER_ICON} alt="UPS" className="h-5 w-5 shrink-0 rounded-sm" />
                <span className="font-body text-sm font-medium text-[#0b1516]">UPS Kansas</span>
              </div>
              {/* Carrier fields */}
              <div className="flex flex-col gap-4">
                <DataRow>
                  <LabelField label="Delivered On" value="01/17/2025" className="w-[168px] shrink-0" />
                  <LabelField label="Shipped On" value="01/17/2025" />
                </DataRow>
                <DataRow>
                  <LabelField label="Account Number" value="681350810" className="w-[168px] shrink-0" />
                  <LabelField label="Freight Cost" value="$10.50" />
                </DataRow>
              </div>
            </div>

            {/* SHIPMENT section */}
            <div className="flex flex-col gap-4">
              <SectionHeader title="Shipment" />
              <div className="flex gap-4">
                <LabelField label="Length" value="20 in" className="flex-1" />
                <LabelField label="Width"  value="32 in" className="flex-1" />
                <LabelField label="Height" value="12 in" className="flex-1" />
                <LabelField label="Weight" value="32 lbs" className="flex-1" />
              </div>
            </div>

            {/* CUSTOMER section */}
            <div className="flex flex-col gap-4">
              <SectionHeader title="Customer" />
              <div className="flex flex-col gap-4">
                <div className="flex gap-4">
                  <LabelField label="Name"  value={shipment.customer} className="flex-1" />
                  <LabelField label="Email" value="sam.pr@hp.com"     className="flex-1" />
                  <LabelField label="Phone" value="123-456-7890"      className="flex-1" />
                </div>
                <LabelField
                  label="Shipping Address"
                  value="3672 Chesterfield Blvd., Nashville, TN 73928, US"
                />
              </div>
            </div>

            {/* DOCUMENTS section */}
            <div className="flex flex-col gap-4">
              <SectionHeader
                title="Documents"
                action={
                  <button
                    type="button"
                    data-testid="button-add-document"
                    className="flex items-center gap-1 rounded border border-neutral-300 bg-white px-2 py-0.5 font-body text-xs font-medium text-neutral-700 hover:bg-neutral-50"
                  >
                    <Plus className="h-3 w-3" />
                    Add File
                  </button>
                }
              />
              <p className="font-body text-sm text-[#45565b]">No Documents Attached</p>
            </div>

            {/* PROOF OF DELIVERY section */}
            <div className="flex flex-col gap-4">
              <SectionHeader title="Proof of Delivery" />
              <p className="font-body text-sm text-[#45565b]">No proof of delivery attached.</p>
            </div>

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
