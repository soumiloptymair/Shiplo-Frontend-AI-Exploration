import { useMemo, useState } from "react";
import {
  Search as SearchIcon,
  SlidersHorizontal,
  Plus,
  PackageOpen,
  Undo2,
  Users,
  AlertTriangle,
  X,
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
  { id: "s-1",  shipmentId: "#20230101180003", freightType: "Parcel",    orderRefId: "#20230101180003", orderRefKind: "order",    status: "Shipped",       createdOn: "01/15/2025", value: "$35.32", source: "Walmart Marketplace", warehouse: "KS Fulfilment center", shipping: "UPS",             method: "Standard",      customer: "Abrams, Abe",    tags: ["Tag"] },
  { id: "s-2",  shipmentId: "#20230101180003", freightType: "LTL",       orderRefId: "#20230101180003", orderRefKind: "order",    status: "Shipped",       createdOn: "12/02/2024", value: "$35.32", source: "Walmart Marketplace", warehouse: "KS Fulfilment center", shipping: "Express 2 day",   method: "Standard",      customer: "Blount, Bobby",  tags: ["Tag"] },
  { id: "s-3",  shipmentId: "#20230101180003", freightType: "Truckload",  orderRefId: "3 combined",     orderRefKind: "combined", combinedCount: 3, status: "Shipped", createdOn: "12/02/2024", value: "$41.99", source: "Walmart Marketplace", warehouse: "KS Fulfilment center", shipping: "UPS", method: "Standard", customer: "Carter, Mike", tags: ["Tag"] },
  { id: "s-4",  shipmentId: "#20230101180003", freightType: "",           orderRefId: "#20230101180003", orderRefKind: "order",    status: "Pending",       createdOn: "12/02/2024", value: "$41.99", source: "Walmart Marketplace", warehouse: "KS Fulfilment center", shipping: "To be assigned", method: "Standard",      customer: "Carter, Mike",   tags: [] },
  { id: "s-5",  shipmentId: "#20230101180003", freightType: "Partial",    orderRefId: "#20230101180003", orderRefKind: "order",    status: "Label Created", createdOn: "12/02/2024", value: "$41.99", source: "Walmart Marketplace", warehouse: "KS Fulfilment center", shipping: "UPS",             method: "Standard",      customer: "Carter, Mike",   tags: ["Tag"] },
  { id: "s-6",  shipmentId: "#20230101180003", freightType: "Parcel",     orderRefId: "#20230101180003", orderRefKind: "order",    status: "Shipped",       createdOn: "12/02/2024", value: "$41.99", source: "Walmart Marketplace", warehouse: "KS Fulfilment center", shipping: "UPS",             method: "Standard",      customer: "Carter, Mike",   tags: ["Tag"] },
  { id: "s-7",  shipmentId: "#20230101180003", freightType: "LTL",        orderRefId: "#20230101180003", orderRefKind: "order",    status: "Delayed",       createdOn: "12/02/2024", value: "$41.99", source: "Walmart Marketplace", warehouse: "KS Fulfilment center", shipping: "UPS",             method: "Standard",      customer: "Carter, Mike",   tags: ["Tag", "+2"] },
  { id: "s-8",  shipmentId: "#20230101180003", freightType: "LTL",        orderRefId: "#20230101180003", orderRefKind: "order",    status: "Delivered",     createdOn: "12/02/2024", value: "$41.99", source: "Walmart Marketplace", warehouse: "KS Fulfilment center", shipping: "UPS",             method: "Standard",      customer: "Carter, Mike",   tags: ["Tag"] },
  { id: "s-9",  shipmentId: "#20230101180003", freightType: "LTL",        orderRefId: "#20230101180003", orderRefKind: "order",    status: "On Hold",       createdOn: "12/02/2024", value: "$41.99", source: "Walmart Marketplace", warehouse: "KS Fulfilment center", shipping: "UPS",             method: "Standard",      customer: "Carter, Mike",   tags: ["Tag"] },
  { id: "s-10", shipmentId: "#20230101180003", freightType: "Truckload",  orderRefId: "#20230101180003", orderRefKind: "order",    status: "Needs Review",  createdOn: "12/02/2024", value: "$41.99", source: "Walmart Marketplace", warehouse: "KS Fulfilment center", shipping: "UPS",             method: "Standard",      customer: "Carter, Mike",   tags: ["Tag"] },
  { id: "s-11", shipmentId: "#20230101180003", freightType: "Truckload",  orderRefId: "#20230101180003", orderRefKind: "order",    status: "Cancelled",     createdOn: "12/02/2024", value: "$41.99", source: "Walmart Marketplace", warehouse: "KS Fulfilment center", shipping: "UPS",             method: "Standard",      customer: "Carter, Mike",   tags: ["Tag"] },
  { id: "s-12", shipmentId: "#20230101180003", freightType: "",           orderRefId: "#20230101180003", orderRefKind: "order",    status: "Pending", needsAttention: true, createdOn: "12/02/2024", value: "$41.99", source: "Express - 1 day", warehouse: "KS Fulfilment center", shipping: "UPS", method: "Standard", customer: "Carter, Mike", tags: [] },
  { id: "s-13", shipmentId: "#20230101180003", freightType: "Parcel",     orderRefId: "#20230101180003", orderRefKind: "combined", combinedCount: 2, status: "Shipped", createdOn: "12/02/2024", value: "$41.99", source: "Walmart Marketplace", warehouse: "KS Fulfilment center", shipping: "UPS", method: "Standard", customer: "Carter, Mike", tags: ["Tag"] },
  { id: "s-14", shipmentId: "#20230101180003", freightType: "LTL",        orderRefId: "#20230101180003", orderRefKind: "return",   status: "Shipped",       createdOn: "12/02/2024", value: "$41.99", source: "Walmart Marketplace", warehouse: "KS Fulfilment center", shipping: "UPS",             method: "Standard",      customer: "Carter, Mike",   tags: ["Tag"] },
  { id: "s-15", shipmentId: "#20230101180003", freightType: "Parcel",     orderRefId: "#20230101180003", orderRefKind: "order",    status: "Shipped",       createdOn: "12/02/2024", value: "$41.99", source: "Walmart Marketplace", warehouse: "KS Fulfilment center", shipping: "UPS",             method: "Standard",      customer: "Carter, Mike",   tags: ["Tag"] },
  { id: "s-16", shipmentId: "#20230101180003", freightType: "",           orderRefId: "#20230101180003", orderRefKind: "return",   status: "Pending",       createdOn: "12/02/2024", value: "$41.99", source: "Walmart Marketplace", warehouse: "KS Fulfilment center", shipping: "UPS",             method: "Standard",      customer: "Carter, Mike",   tags: [] },
  { id: "s-17", shipmentId: "#20230101180003", freightType: "Parcel",     orderRefId: "#20230101180003", orderRefKind: "order",    status: "Shipped",       createdOn: "12/02/2024", value: "$41.99", source: "Walmart Marketplace", warehouse: "KS Fulfilment center", shipping: "UPS",             method: "Standard",      customer: "Carter, Mike",   tags: ["Tag"] },
  { id: "s-18", shipmentId: "#20230101180003", freightType: "Parcel",     orderRefId: "#20230101180003", orderRefKind: "order",    status: "Shipped",       createdOn: "12/02/2024", value: "$41.99", source: "Walmart Marketplace", warehouse: "KS Fulfilment center", shipping: "UPS",             method: "Standard",      customer: "Carter, Mike",   tags: ["Tag"] },
  { id: "s-19", shipmentId: "#20230101180003", freightType: "Parcel",     orderRefId: "#20230101180003", orderRefKind: "return",   status: "Shipped",       createdOn: "12/02/2024", value: "$41.99", source: "Walmart Marketplace", warehouse: "KS Fulfilment center", shipping: "UPS",             method: "Standard",      customer: "Carter, Mike",   tags: ["Tag"] },
  { id: "s-20", shipmentId: "#20230101180003", freightType: "Parcel",     orderRefId: "#20230101180003", orderRefKind: "order",    status: "Shipped",       createdOn: "12/02/2024", value: "$41.99", source: "Walmart Marketplace", warehouse: "KS Fulfilment center", shipping: "UPS",             method: "Standard",      customer: "Carter, Mike",   tags: ["Tag"] },
  { id: "s-21", shipmentId: "#20230101180003", freightType: "Parcel",     orderRefId: "#20230101180003", orderRefKind: "order",    status: "Shipped",       createdOn: "12/02/2024", value: "$41.99", source: "Walmart Marketplace", warehouse: "KS Fulfilment center", shipping: "UPS",             method: "Standard",      customer: "Carter, Mike",   tags: ["Tag"] },
  { id: "s-22", shipmentId: "#20230101180003", freightType: "Parcel",     orderRefId: "#20230101180003", orderRefKind: "order",    status: "Shipped",       createdOn: "12/02/2024", value: "$41.99", source: "Walmart Marketplace", warehouse: "KS Fulfilment center", shipping: "UPS",             method: "Standard",      customer: "Carter, Mike",   tags: ["Tag"] },
  { id: "s-23", shipmentId: "#20230101180003", freightType: "Parcel",     orderRefId: "#20230101180003", orderRefKind: "order",    status: "Shipped",       createdOn: "12/02/2024", value: "$41.99", source: "Walmart Marketplace", warehouse: "KS Fulfilment center", shipping: "UPS",             method: "Standard",      customer: "Carter, Mike",   tags: ["Tag"] },
  { id: "s-24", shipmentId: "#20230101180003", freightType: "Parcel",     orderRefId: "#20230101180003", orderRefKind: "order",    status: "Shipped",       createdOn: "12/02/2024", value: "$41.99", source: "Walmart Marketplace", warehouse: "KS Fulfilment center", shipping: "UPS",             method: "Standard",      customer: "Carter, Mike",   tags: ["Tag"] },
];

const cellBase = "h-8 px-2 py-0 font-body text-sm text-neutral-900 align-middle";
const headBase = "h-8 px-2 font-body text-sm font-medium text-neutral-900 bg-neutral-100 whitespace-nowrap sticky top-0 z-10";

const TABS: ShipmentTab[] = ["All", "Orders", "Returns"];

const KindIcon = ({ kind }: { kind: Shipment["orderRefKind"] }) => {
  if (kind === "return")   return <Undo2       className="h-4 w-4 shrink-0 text-neutral-500" aria-hidden />;
  if (kind === "combined") return <Users        className="h-4 w-4 shrink-0 text-neutral-500" aria-hidden />;
  return                          <PackageOpen  className="h-4 w-4 shrink-0 text-neutral-500" aria-hidden />;
};

const StatusPill = ({ status, rowId }: { status: ShipmentStatus | ""; rowId: string }) => {
  if (!status) return null;
  return (
    <span
      data-testid={`pill-status-${rowId}`}
      className={`inline-flex h-6 items-center whitespace-nowrap rounded-full border border-[#b8c6cc] px-1.5 font-body text-sm font-normal text-neutral-900 ${STATUS_PILL_BG[status]}`}
    >
      {status}
    </span>
  );
};

const TagChips = ({ tags }: { tags: string[] }) => {
  const overflow = tags.filter(t => t.startsWith("+"));
  const normal = tags.filter(t => !t.startsWith("+"));
  return (
    <span className="inline-flex items-center gap-1">
      {normal.map((tag, i) => (
        <span
          key={i}
          className="inline-flex h-6 items-center gap-1 rounded-full border border-neutral-300 bg-neutral-100 px-2 font-body text-xs text-neutral-700"
        >
          {tag}
          <X className="h-3 w-3 text-neutral-500" aria-hidden />
        </span>
      ))}
      {overflow.map((o, i) => (
        <span
          key={i}
          className="inline-flex h-6 items-center rounded-full border border-neutral-300 bg-neutral-100 px-2 font-body text-xs text-neutral-700"
        >
          {o}
        </span>
      ))}
      <button
        type="button"
        aria-label="Add tag"
        className="flex h-6 w-6 items-center justify-center rounded-full border border-neutral-300 bg-neutral-0 text-neutral-500 hover:bg-neutral-100"
      >
        <Plus className="h-3 w-3" aria-hidden />
      </button>
    </span>
  );
};

const ShipmentsPageInner = (): JSX.Element => {
  const [activeTab,    setActiveTab]    = useState<ShipmentTab>("All");
  const [statusFilter, setStatusFilter] = useState<"All" | ShipmentStatus>("All");
  const [search,       setSearch]       = useState("");
  const [selected,     setSelected]     = useState<Set<string>>(new Set());

  const filtered = useMemo(() => {
    return SAMPLE_SHIPMENTS.filter((s) => {
      if (activeTab === "Orders"  && s.orderRefKind === "return")  return false;
      if (activeTab === "Returns" && s.orderRefKind !== "return")  return false;
      if (statusFilter !== "All"  && s.status       !== statusFilter) return false;
      if (search.trim()) {
        const q = search.toLowerCase();
        const hay = `${s.shipmentId} ${s.orderRefId} ${s.source} ${s.warehouse} ${s.customer}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
  }, [activeTab, statusFilter, search]);

  const allSelected = filtered.length > 0 && filtered.every((s) => selected.has(s.id));

  const toggleAll = () => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (allSelected) filtered.forEach((s) => next.delete(s.id));
      else             filtered.forEach((s) => next.add(s.id));
      return next;
    });
  };

  const toggleOne = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  return (
    <section className="flex h-full flex-col overflow-hidden rounded-lg bg-neutral-0">

      {/* ── Title bar ── */}
      <header className="flex items-center justify-between gap-4 rounded-t-lg border-b border-neutral-150 bg-neutral-0 px-5 py-4">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <PackageOpen className="h-6 w-6 text-neutral-900" aria-hidden />
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
          <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as "All" | ShipmentStatus)}>
            <SelectTrigger
              data-testid="select-status-filter"
              className="h-9 w-[180px] gap-2 rounded border-neutral-300 bg-neutral-0 px-3 font-body text-sm font-medium text-neutral-900"
            >
              <span className="flex flex-1 items-center gap-2">
                <span className="text-neutral-500">Status</span>
                <SelectValue />
              </span>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="All">All</SelectItem>
              {SHIPMENT_STATUSES.map((s) => (
                <SelectItem key={s} value={s}>{s}</SelectItem>
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
            className="h-9 gap-1 rounded bg-brand-secondary px-3 font-body text-sm font-medium text-brand-secondary-contrast hover:bg-brand-secondary/90"
          >
            <Plus className="h-4 w-4" />
            New Shipment
          </Button>
        </div>
      </header>

      {/* ── Data grid ── */}
      <div className="flex-1 overflow-auto">
        <Table className="w-full min-w-[1640px] border-collapse">
          <TableHeader>
            <TableRow className="border-b border-[#e4eaed] bg-neutral-100 hover:bg-neutral-100">
              {/* Checkbox */}
              <TableHead className={`${headBase} w-[60px] pl-5 pr-3`}>
                <Checkbox
                  data-testid="checkbox-select-all"
                  checked={allSelected}
                  onCheckedChange={toggleAll}
                  aria-label="Select all shipments"
                />
              </TableHead>
              {/* Alert icon col — empty header */}
              <TableHead className={`${headBase} w-[24px] p-0`} />
              {/* Shipment ID */}
              <TableHead className={`${headBase} w-[164px]`}>Shipment ID</TableHead>
              {/* Freight Type */}
              <TableHead className={`${headBase} w-[108px]`}>Freight Type</TableHead>
              {/* Order kind icon col — empty header */}
              <TableHead className={`${headBase} w-[24px] p-0`} />
              {/* Order/Return ID */}
              <TableHead className={`${headBase} w-[164px]`}>Order/Return ID</TableHead>
              {/* Status */}
              <TableHead className={`${headBase} w-[136px]`}>Status</TableHead>
              {/* Created on */}
              <TableHead className={`${headBase} w-[108px]`}>Created on</TableHead>
              {/* Value */}
              <TableHead className={`${headBase} w-[88px]`}>Value</TableHead>
              {/* Source */}
              <TableHead className={`${headBase} w-[228px]`}>Source</TableHead>
              {/* Warehouse */}
              <TableHead className={`${headBase} w-[184px]`}>Warehouse</TableHead>
              {/* Shipping */}
              <TableHead className={`${headBase} w-[124px]`}>Shipping</TableHead>
              {/* Method */}
              <TableHead className={`${headBase} w-[124px]`}>Method</TableHead>
              {/* Customer */}
              <TableHead className={`${headBase} w-[140px]`}>Customer</TableHead>
              {/* Tags */}
              <TableHead className={`${headBase} w-[168px]`}>Tags</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {filtered.map((s) => {
              const isSelected = selected.has(s.id);
              const rowBg = isSelected ? "bg-brand-secondary/10" : "bg-white hover:bg-neutral-100";
              return (
                <TableRow
                  key={s.id}
                  data-testid={`row-shipment-${s.id}`}
                  className={`h-8 border-b border-[#e4eaed] transition-colors ${rowBg}`}
                >
                  {/* Checkbox */}
                  <TableCell className="h-8 w-[60px] py-0 pl-5 pr-3">
                    <Checkbox
                      data-testid={`checkbox-${s.id}`}
                      checked={isSelected}
                      onCheckedChange={() => toggleOne(s.id)}
                      aria-label={`Select shipment ${s.shipmentId}`}
                    />
                  </TableCell>

                  {/* Alert icon — separate tiny column */}
                  <TableCell className="h-8 w-[24px] p-0 text-center">
                    {s.needsAttention && (
                      <AlertTriangle
                        className="inline-block h-4 w-4 text-status-error"
                        aria-label="Needs attention"
                      />
                    )}
                  </TableCell>

                  {/* Shipment ID */}
                  <TableCell className={cellBase}>
                    <a
                      href="#"
                      data-testid={`link-shipment-${s.id}`}
                      className="font-medium text-[#328ac9] hover:underline"
                      onClick={(e) => e.preventDefault()}
                    >
                      {s.shipmentId}
                    </a>
                  </TableCell>

                  {/* Freight Type */}
                  <TableCell className={cellBase}>{s.freightType}</TableCell>

                  {/* Order kind icon — separate tiny column */}
                  <TableCell className="h-8 w-[24px] p-0 text-center">
                    <KindIcon kind={s.orderRefKind} />
                  </TableCell>

                  {/* Order/Return ID */}
                  <TableCell className={cellBase}>
                    <a
                      href="#"
                      data-testid={`link-orderref-${s.id}`}
                      className="font-medium text-[#328ac9] hover:underline"
                      onClick={(e) => e.preventDefault()}
                    >
                      {s.orderRefId}
                    </a>
                  </TableCell>

                  {/* Status */}
                  <TableCell className={cellBase}>
                    <StatusPill status={s.status} rowId={s.id} />
                  </TableCell>

                  {/* Created on */}
                  <TableCell className={cellBase}>{s.createdOn}</TableCell>

                  {/* Value */}
                  <TableCell className={cellBase}>{s.value}</TableCell>

                  {/* Source */}
                  <TableCell className={cellBase}>
                    <span className="inline-flex items-center gap-1.5 whitespace-nowrap">
                      <img src={SOURCE_ICON} alt="" className="h-4 w-4 shrink-0" />
                      <span>{s.source}</span>
                    </span>
                  </TableCell>

                  {/* Warehouse */}
                  <TableCell className={cellBase}>{s.warehouse}</TableCell>

                  {/* Shipping */}
                  <TableCell className={cellBase}>
                    <span className="inline-flex items-center gap-1.5 whitespace-nowrap">
                      {s.shipping !== "To be assigned" && (
                        <img src={CARRIER_ICON} alt="" className="h-4 w-4 shrink-0 rounded-sm" />
                      )}
                      <span className={s.shipping === "To be assigned" ? "italic text-neutral-500" : ""}>
                        {s.shipping}
                      </span>
                    </span>
                  </TableCell>

                  {/* Method */}
                  <TableCell className={cellBase}>{s.method}</TableCell>

                  {/* Customer */}
                  <TableCell className={cellBase}>{s.customer}</TableCell>

                  {/* Tags */}
                  <TableCell className={`${cellBase} min-w-0`}>
                    <TagChips tags={s.tags} />
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

export const ShipmentsPage = (): JSX.Element => (
  <AppShell>
    <ShipmentsPageInner />
  </AppShell>
);
