import { useMemo, useState } from "react";
import {
  Search as SearchIcon,
  SlidersHorizontal,
  Plus,
  PackageOpen,
  Undo2,
  Users,
  AlertTriangle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { AppShell } from "@/components/AppShell";
import {
  SHIPMENT_STATUSES,
  type Shipment,
  type ShipmentStatus,
} from "@shared/schema";

type ShipmentTab = "All" | "Orders" | "Returns";

const STATUS_PILL_BG: Record<ShipmentStatus, string> = {
  Shipped: "bg-status-shipped",
  Pending: "bg-status-picking",
  "Label Created": "bg-status-label-created",
  Delayed: "bg-status-delayed",
  Delivered: "bg-status-delivered",
  "On Hold": "bg-status-on-hold",
  "Needs Review": "bg-status-needs-review",
  Cancelled: "bg-status-cancelled",
};

const SOURCE_ICON = "/figmaAssets/integrations-1.png";
const CARRIER_ICON = "/figmaAssets/pngegg--2--1-1.png";

const SAMPLE_SHIPMENTS: Shipment[] = [
  { id: "s-1", shipmentId: "#20230101180003", freightType: "Parcel", orderRefId: "#20230101180003", orderRefKind: "order", status: "Shipped", createdOn: "01/15/2025", value: "$35.32", source: "Walmart Marketplace", warehouse: "KS Fulfilment center", shipping: "UPS" },
  { id: "s-2", shipmentId: "#20230101180003", freightType: "LTL", orderRefId: "#20230101180003", orderRefKind: "order", status: "Shipped", createdOn: "12/02/2024", value: "$35.32", source: "Walmart Marketplace", warehouse: "KS Fulfilment center", shipping: "UPS" },
  { id: "s-3", shipmentId: "#20230101180003", freightType: "Truckload", orderRefId: "3 combined", orderRefKind: "combined", combinedCount: 3, status: "Shipped", createdOn: "12/02/2024", value: "$41.99", source: "Walmart Marketplace", warehouse: "KS Fulfilment center", shipping: "UPS" },
  { id: "s-4", shipmentId: "#20230101180003", freightType: "", orderRefId: "#20230101180003", orderRefKind: "order", status: "Pending", createdOn: "12/02/2024", value: "$41.99", source: "Walmart Marketplace", warehouse: "KS Fulfilment center", shipping: "To be assigned" },
  { id: "s-5", shipmentId: "#20230101180003", freightType: "Partial", orderRefId: "#20230101180003", orderRefKind: "order", status: "Label Created", createdOn: "12/02/2024", value: "$41.99", source: "Walmart Marketplace", warehouse: "KS Fulfilment center", shipping: "UPS" },
  { id: "s-6", shipmentId: "#20230101180003", freightType: "Parcel", orderRefId: "#20230101180003", orderRefKind: "order", status: "Shipped", createdOn: "12/02/2024", value: "$41.99", source: "Walmart Marketplace", warehouse: "KS Fulfilment center", shipping: "UPS" },
  { id: "s-7", shipmentId: "#20230101180003", freightType: "LTL", orderRefId: "#20230101180003", orderRefKind: "order", status: "Delayed", createdOn: "12/02/2024", value: "$41.99", source: "Walmart Marketplace", warehouse: "KS Fulfilment center", shipping: "UPS" },
  { id: "s-8", shipmentId: "#20230101180003", freightType: "LTL", orderRefId: "#20230101180003", orderRefKind: "order", status: "Delivered", createdOn: "12/02/2024", value: "$41.99", source: "Walmart Marketplace", warehouse: "KS Fulfilment center", shipping: "UPS" },
  { id: "s-9", shipmentId: "#20230101180003", freightType: "LTL", orderRefId: "#20230101180003", orderRefKind: "order", status: "On Hold", createdOn: "12/02/2024", value: "$41.99", source: "Walmart Marketplace", warehouse: "KS Fulfilment center", shipping: "UPS" },
  { id: "s-10", shipmentId: "#20230101180003", freightType: "Truckload", orderRefId: "#20230101180003", orderRefKind: "order", status: "Needs Review", createdOn: "12/02/2024", value: "$41.99", source: "Walmart Marketplace", warehouse: "KS Fulfilment center", shipping: "UPS" },
  { id: "s-11", shipmentId: "#20230101180003", freightType: "Truckload", orderRefId: "#20230101180003", orderRefKind: "order", status: "Cancelled", createdOn: "12/02/2024", value: "$41.99", source: "Walmart Marketplace", warehouse: "KS Fulfilment center", shipping: "UPS" },
  { id: "s-12", shipmentId: "#20230101180003", freightType: "", orderRefId: "#20230101180003", orderRefKind: "order", status: "Pending", needsAttention: true, createdOn: "12/02/2024", value: "$41.99", source: "Express - 1 day", warehouse: "KS Fulfilment center", shipping: "UPS" },
  { id: "s-13", shipmentId: "#20230101180003", freightType: "Parcel", orderRefId: "#20230101180003", orderRefKind: "combined", combinedCount: 2, status: "Shipped", createdOn: "12/02/2024", value: "$41.99", source: "Walmart Marketplace", warehouse: "KS Fulfilment center", shipping: "UPS" },
  { id: "s-14", shipmentId: "#20230101180003", freightType: "LTL", orderRefId: "#20230101180003", orderRefKind: "return", status: "Shipped", createdOn: "12/02/2024", value: "$41.99", source: "Walmart Marketplace", warehouse: "KS Fulfilment center", shipping: "UPS" },
  { id: "s-15", shipmentId: "#20230101180003", freightType: "Parcel", orderRefId: "#20230101180003", orderRefKind: "order", status: "Shipped", createdOn: "12/02/2024", value: "$41.99", source: "Walmart Marketplace", warehouse: "KS Fulfilment center", shipping: "UPS" },
  { id: "s-16", shipmentId: "#20230101180003", freightType: "", orderRefId: "#20230101180003", orderRefKind: "return", status: "Pending", createdOn: "12/02/2024", value: "$41.99", source: "Walmart Marketplace", warehouse: "KS Fulfilment center", shipping: "UPS" },
  { id: "s-17", shipmentId: "#20230101180003", freightType: "Parcel", orderRefId: "#20230101180003", orderRefKind: "order", status: "Shipped", createdOn: "12/02/2024", value: "$41.99", source: "Walmart Marketplace", warehouse: "KS Fulfilment center", shipping: "UPS" },
  { id: "s-18", shipmentId: "#20230101180003", freightType: "Parcel", orderRefId: "#20230101180003", orderRefKind: "order", status: "Shipped", createdOn: "12/02/2024", value: "$41.99", source: "Walmart Marketplace", warehouse: "KS Fulfilment center", shipping: "UPS" },
  { id: "s-19", shipmentId: "#20230101180003", freightType: "Parcel", orderRefId: "#20230101180003", orderRefKind: "return", status: "Shipped", createdOn: "12/02/2024", value: "$41.99", source: "Walmart Marketplace", warehouse: "KS Fulfilment center", shipping: "UPS" },
  { id: "s-20", shipmentId: "#20230101180003", freightType: "Parcel", orderRefId: "#20230101180003", orderRefKind: "order", status: "Shipped", createdOn: "12/02/2024", value: "$41.99", source: "Walmart Marketplace", warehouse: "KS Fulfilment center", shipping: "UPS" },
  { id: "s-21", shipmentId: "#20230101180003", freightType: "Parcel", orderRefId: "#20230101180003", orderRefKind: "order", status: "Shipped", createdOn: "12/02/2024", value: "$41.99", source: "Walmart Marketplace", warehouse: "KS Fulfilment center", shipping: "UPS" },
  { id: "s-22", shipmentId: "#20230101180003", freightType: "Parcel", orderRefId: "#20230101180003", orderRefKind: "order", status: "Shipped", createdOn: "12/02/2024", value: "$41.99", source: "Walmart Marketplace", warehouse: "KS Fulfilment center", shipping: "UPS" },
  { id: "s-23", shipmentId: "#20230101180003", freightType: "Parcel", orderRefId: "#20230101180003", orderRefKind: "order", status: "Shipped", createdOn: "12/02/2024", value: "$41.99", source: "Walmart Marketplace", warehouse: "KS Fulfilment center", shipping: "UPS" },
  { id: "s-24", shipmentId: "#20230101180003", freightType: "Parcel", orderRefId: "#20230101180003", orderRefKind: "order", status: "Shipped", createdOn: "12/02/2024", value: "$41.99", source: "Walmart Marketplace", warehouse: "KS Fulfilment center", shipping: "UPS" },
];

const cellTextBase = "h-8 px-2 py-0 font-body text-sm text-neutral-900";
const headCellBase = "h-8 px-2 font-body text-sm font-medium text-neutral-900";

const TABS: ShipmentTab[] = ["All", "Orders", "Returns"];

const ShipmentKindIcon = ({ kind }: { kind: Shipment["orderRefKind"] }) => {
  if (kind === "return") return <Undo2 className="h-4 w-4 text-neutral-500" aria-hidden="true" />;
  if (kind === "combined") return <Users className="h-4 w-4 text-neutral-500" aria-hidden="true" />;
  return <PackageOpen className="h-4 w-4 text-neutral-500" aria-hidden="true" />;
};

const StatusPill = ({
  status,
  rowId,
}: {
  status: ShipmentStatus | "";
  rowId: string;
}) => {
  if (!status) return null;
  return (
    <span
      data-testid={`pill-status-${rowId}`}
      className={`inline-flex h-6 items-center whitespace-nowrap rounded-full px-3 font-body text-sm font-medium text-neutral-900 ${STATUS_PILL_BG[status]}`}
    >
      {status}
    </span>
  );
};

const ShipmentsPageInner = (): JSX.Element => {
  const [activeTab, setActiveTab] = useState<ShipmentTab>("All");
  const [statusFilter, setStatusFilter] = useState<"All" | ShipmentStatus>("All");
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<Set<string>>(new Set());

  const filtered = useMemo(() => {
    return SAMPLE_SHIPMENTS.filter((s) => {
      if (activeTab === "Orders" && s.orderRefKind === "return") return false;
      if (activeTab === "Returns" && s.orderRefKind !== "return") return false;
      if (statusFilter !== "All" && s.status !== statusFilter) return false;
      if (search.trim()) {
        const q = search.toLowerCase();
        const haystack = `${s.shipmentId} ${s.orderRefId} ${s.source} ${s.warehouse}`.toLowerCase();
        if (!haystack.includes(q)) return false;
      }
      return true;
    });
  }, [activeTab, statusFilter, search]);

  const allSelected = filtered.length > 0 && filtered.every((s) => selected.has(s.id));

  const toggleAll = () => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (allSelected) {
        filtered.forEach((s) => next.delete(s.id));
      } else {
        filtered.forEach((s) => next.add(s.id));
      }
      return next;
    });
  };

  const toggleOne = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  return (
    <section className="flex h-full min-h-[calc(100vh-1rem)] flex-col rounded-lg bg-neutral-0">
      {/* Title bar */}
      <header className="flex items-center justify-between gap-4 rounded-t-lg border-b border-neutral-150 bg-neutral-0 px-5 py-4">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <PackageOpen className="h-6 w-6 text-neutral-900" aria-hidden="true" />
            <h1 className="font-heading text-2xl font-semibold leading-tight tracking-[0.15px] text-neutral-900">
              Shipments
            </h1>
          </div>

          <div
            role="tablist"
            aria-label="Shipment type"
            className="flex h-8 items-center gap-0 rounded-full border border-neutral-300 px-0.5"
          >
            {TABS.map((t) => {
              const isActive = activeTab === t;
              return (
                <button
                  key={t}
                  role="tab"
                  aria-selected={isActive}
                  data-testid={`tab-${t.toLowerCase()}`}
                  onClick={() => setActiveTab(t)}
                  className={`flex h-7 items-center justify-center rounded-full px-4 font-body text-sm transition-colors ${
                    isActive
                      ? "bg-brand-secondary font-medium text-brand-secondary-contrast"
                      : "bg-transparent text-neutral-900 hover:bg-neutral-100"
                  }`}
                >
                  {t}
                </button>
              );
            })}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Select
            value={statusFilter}
            onValueChange={(v) => setStatusFilter(v as "All" | ShipmentStatus)}
          >
            <SelectTrigger
              data-testid="select-status-filter"
              className="h-9 w-[180px] gap-2 rounded border-neutral-300 bg-neutral-0 font-body text-sm font-medium text-neutral-900"
            >
              <span className="flex flex-1 items-center gap-2">
                <span className="text-neutral-500">Status</span>
                <SelectValue />
              </span>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="All">All</SelectItem>
              {SHIPMENT_STATUSES.map((s) => (
                <SelectItem key={s} value={s}>
                  {s}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <div className="relative h-9 w-[220px]">
            <SearchIcon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-500" />
            <Input
              data-testid="input-search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search..."
              className="h-9 rounded border-neutral-300 bg-neutral-0 pl-9 font-body text-sm placeholder:text-neutral-500"
            />
          </div>

          <Button
            type="button"
            variant="outline"
            data-testid="button-filters"
            className="h-9 gap-1 rounded border border-neutral-300 bg-neutral-0 px-3 font-body text-sm font-medium text-neutral-900 hover:bg-neutral-100"
          >
            <SlidersHorizontal className="h-4 w-4" />
            Filters
          </Button>

          <Button
            type="button"
            data-testid="button-new-shipment"
            className="h-9 gap-1 rounded bg-brand-secondary px-3 font-body text-base font-medium text-brand-secondary-contrast hover:bg-brand-secondary/90"
          >
            <Plus className="h-4 w-4" />
            New Shipment
          </Button>
        </div>
      </header>

      {/* Data grid */}
      <div className="flex-1 overflow-x-auto">
        <Table className="w-full min-w-[1200px]">
          <TableHeader>
            <TableRow className="border-b border-neutral-300 bg-neutral-100 hover:bg-neutral-100">
              <TableHead className="h-8 w-10 px-2">
                <Checkbox
                  data-testid="checkbox-select-all"
                  checked={allSelected}
                  onCheckedChange={toggleAll}
                  aria-label="Select all shipments"
                />
              </TableHead>
              <TableHead className={`${headCellBase} w-[180px]`}>Shipment ID</TableHead>
              <TableHead className={`${headCellBase} w-[110px]`}>Freight Type</TableHead>
              <TableHead className={`${headCellBase} w-[200px]`}>Order/Return ID</TableHead>
              <TableHead className={`${headCellBase} w-[140px]`}>Status</TableHead>
              <TableHead className={`${headCellBase} w-[110px]`}>Created on</TableHead>
              <TableHead className={`${headCellBase} w-[90px]`}>Value</TableHead>
              <TableHead className={`${headCellBase} w-[200px]`}>Source</TableHead>
              <TableHead className={`${headCellBase} w-[180px]`}>Warehouse</TableHead>
              <TableHead className={`${headCellBase} w-[120px]`}>Shipping</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map((s) => {
              const isSelected = selected.has(s.id);
              return (
                <TableRow
                  key={s.id}
                  data-testid={`row-shipment-${s.id}`}
                  className={`h-8 border-b border-neutral-300 transition-colors ${
                    isSelected ? "bg-brand-secondary/10" : "bg-neutral-0 hover:bg-neutral-100"
                  }`}
                >
                  <TableCell className="h-8 w-10 px-2 py-0">
                    <Checkbox
                      data-testid={`checkbox-${s.id}`}
                      checked={isSelected}
                      onCheckedChange={() => toggleOne(s.id)}
                      aria-label={`Select shipment ${s.shipmentId}`}
                    />
                  </TableCell>
                  <TableCell className={cellTextBase}>
                    <a
                      href="#"
                      data-testid={`link-shipment-${s.id}`}
                      className="font-medium text-brand-secondary hover:underline"
                      onClick={(e) => e.preventDefault()}
                    >
                      {s.shipmentId}
                    </a>
                  </TableCell>
                  <TableCell className={cellTextBase}>{s.freightType}</TableCell>
                  <TableCell className={cellTextBase}>
                    <span className="inline-flex items-center gap-1.5">
                      <ShipmentKindIcon kind={s.orderRefKind} />
                      <a
                        href="#"
                        data-testid={`link-orderref-${s.id}`}
                        className="text-brand-secondary hover:underline"
                        onClick={(e) => e.preventDefault()}
                      >
                        {s.orderRefId}
                      </a>
                    </span>
                  </TableCell>
                  <TableCell className="h-8 px-2 py-0">
                    <span className="inline-flex items-center gap-1.5">
                      <StatusPill status={s.status} rowId={s.id} />
                      {s.needsAttention && (
                        <AlertTriangle
                          className="h-4 w-4 text-status-error"
                          aria-label="Needs attention"
                        />
                      )}
                    </span>
                  </TableCell>
                  <TableCell className={cellTextBase}>{s.createdOn}</TableCell>
                  <TableCell className={cellTextBase}>{s.value}</TableCell>
                  <TableCell className={cellTextBase}>
                    <span className="inline-flex items-center gap-1.5">
                      <img src={SOURCE_ICON} alt="" className="h-4 w-4" />
                      <span className="text-warning">{s.source}</span>
                    </span>
                  </TableCell>
                  <TableCell className={cellTextBase}>{s.warehouse}</TableCell>
                  <TableCell className={cellTextBase}>
                    <span className="inline-flex items-center gap-1.5">
                      {s.shipping !== "To be assigned" && (
                        <img src={CARRIER_ICON} alt="" className="h-4 w-4 rounded-sm" />
                      )}
                      <span
                        className={
                          s.shipping === "To be assigned"
                            ? "italic text-neutral-500"
                            : "text-neutral-900"
                        }
                      >
                        {s.shipping}
                      </span>
                    </span>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
    </section>
  );
};

export const ShipmentsPage = (): JSX.Element => {
  return (
    <AppShell>
      <ShipmentsPageInner />
    </AppShell>
  );
};
