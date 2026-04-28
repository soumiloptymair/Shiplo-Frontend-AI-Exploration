import { Fragment, useMemo, useState } from "react";
import {
  AlertTriangleIcon,
  ChevronDownIcon,
  ChevronRightIcon,
  FilterIcon,
  MoreVerticalIcon,
  SearchIcon,
  XIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

type PickListRow = {
  id: string;
  pickListId: string;
  createdOn: string;
  warehouse: string;
  totalOrders: string;
  picker: string;
};

type Product = {
  extId: string;
  name: string;
  qty: number;
  lowInventory?: boolean;
};

type ShipmentRow = {
  id: string;
  shipmentId: string;
  pickListId: string;
  store: string;
  storeIcon: string;
  totalValue: string;
  weight: string;
  customer: string;
  carrier: string;
  carrierIcon: string;
  products: Product[];
};

const PICKERS = ["Jane Smith", "John Doe", "Maria Garcia", "Sam Patel"];

const INITIAL_PICK_PACK_ROWS: PickListRow[] = Array.from({ length: 8 }, (_, index) => ({
  id: `pick-pack-${index + 1}`,
  pickListId: `PL-${100000 + index}`,
  createdOn: "01/15/2025",
  warehouse: index % 2 === 0 ? "KS Fulfilment Center" : "PA Fulfilment Facility",
  totalOrders: String(10 + index * 2),
  picker: index % 3 === 0 ? "Jane Smith" : "John Doe",
}));

const SMB = "Small Moving Boxes";
const MMB = "Medium Moving Boxes";
const LMB = "Large Moving Boxes";
const TAPE = "Packing Tape";
const WRAP = "Bubble Wrap Roll";

const INITIAL_SHIPMENT_ROWS: ShipmentRow[] = [
  { id: "shipment-1", shipmentId: "SH-001", pickListId: "PL-100000", store: "Walmart Marketplace", storeIcon: "/figmaAssets/integrations.png", totalValue: "$1,234.50", weight: "210", customer: "Alice Johnson", carrier: "UPS Express", carrierIcon: "/figmaAssets/pngegg--2--1.png", products: [ { extId: "P-10001", name: SMB, qty: 2, lowInventory: true }, { extId: "P-10002", name: TAPE, qty: 4 } ] },
  { id: "shipment-2", shipmentId: "SH-002", pickListId: "PL-100000", store: "Walmart Marketplace", storeIcon: "/figmaAssets/integrations-1.png", totalValue: "$890.00", weight: "145", customer: "Bob Martinez", carrier: "UPS Express", carrierIcon: "/figmaAssets/pngegg--2--1-1.png", products: [ { extId: "P-10003", name: MMB, qty: 1 }, { extId: "P-10001", name: SMB, qty: 2, lowInventory: true } ] },
  { id: "shipment-3", shipmentId: "SH-003", pickListId: "PL-100001", store: "Walmart Marketplace", storeIcon: "/figmaAssets/integrations-2.png", totalValue: "$2,100.75", weight: "380", customer: "Carol White", carrier: "UPS Express", carrierIcon: "/figmaAssets/pngegg--2--1-2.png", products: [ { extId: "P-10004", name: LMB, qty: 3 }, { extId: "P-10005", name: WRAP, qty: 2 } ] },
  { id: "shipment-4", shipmentId: "SH-004", pickListId: "PL-100001", store: "Walmart Marketplace", storeIcon: "/figmaAssets/integrations-3.png", totalValue: "$560.20", weight: "95", customer: "David Lee", carrier: "UPS Express", carrierIcon: "/figmaAssets/pngegg--2--1-3.png", products: [ { extId: "P-10003", name: MMB, qty: 2 } ] },
  { id: "shipment-5", shipmentId: "SH-005", pickListId: "PL-100002", store: "Walmart Marketplace", storeIcon: "/figmaAssets/integrations-4.png", totalValue: "$3,400.00", weight: "510", customer: "Eva Brown", carrier: "UPS Express", carrierIcon: "/figmaAssets/pngegg--2--1-4.png", products: [ { extId: "P-10004", name: LMB, qty: 5 }, { extId: "P-10002", name: TAPE, qty: 6 } ] },
  { id: "shipment-6", shipmentId: "SH-006", pickListId: "PL-100002", store: "Walmart Marketplace", storeIcon: "/figmaAssets/integrations-5.png", totalValue: "$780.50", weight: "120", customer: "Frank Davis", carrier: "UPS Express", carrierIcon: "/figmaAssets/pngegg--2--1-5.png", products: [ { extId: "P-10001", name: SMB, qty: 3, lowInventory: true } ] },
  { id: "shipment-7", shipmentId: "SH-007", pickListId: "PL-100003", store: "Walmart Marketplace", storeIcon: "/figmaAssets/integrations-6.png", totalValue: "$1,900.00", weight: "290", customer: "Grace Kim", carrier: "UPS Express", carrierIcon: "/figmaAssets/pngegg--2--1-6.png", products: [ { extId: "P-10003", name: MMB, qty: 2 }, { extId: "P-10005", name: WRAP, qty: 1 } ] },
  { id: "shipment-8", shipmentId: "SH-008", pickListId: "PL-100003", store: "Walmart Marketplace", storeIcon: "/figmaAssets/integrations-7.png", totalValue: "$640.00", weight: "110", customer: "Henry Wilson", carrier: "UPS Express", carrierIcon: "/figmaAssets/pngegg--2--1-7.png", products: [ { extId: "P-10002", name: TAPE, qty: 3 } ] },
  { id: "shipment-9", shipmentId: "SH-009", pickListId: "PL-100004", store: "Walmart Marketplace", storeIcon: "/figmaAssets/integrations-8.png", totalValue: "$1,050.00", weight: "180", customer: "Ivy Chen", carrier: "UPS Express", carrierIcon: "/figmaAssets/pngegg--2--1-8.png", products: [ { extId: "P-10004", name: LMB, qty: 2 } ] },
  { id: "shipment-10", shipmentId: "SH-010", pickListId: "PL-100004", store: "Walmart Marketplace", storeIcon: "/figmaAssets/integrations-9.png", totalValue: "$2,750.30", weight: "430", customer: "James Park", carrier: "UPS Express", carrierIcon: "/figmaAssets/pngegg--2--1-9.png", products: [ { extId: "P-10004", name: LMB, qty: 4 }, { extId: "P-10005", name: WRAP, qty: 3 } ] },
];

const cellTextBase = "h-8 px-2 py-0 font-body text-sm text-neutral-900";
const headCellBase = "h-8 px-2 font-body text-sm font-medium text-neutral-900";
const rowBase = "h-8 border-b border-neutral-300 transition-colors";
const rowDefault = "bg-neutral-0 hover:bg-neutral-100";
const rowSelected = "bg-brand-secondary/10 hover:bg-brand-secondary/15";

const parseMoney = (s: string) => Number(s.replace(/[^0-9.]/g, "")) || 0;

export const PickPackDashboardSection = (): JSX.Element => {
  const [pickPackRows, setPickPackRows] = useState<PickListRow[]>(INITIAL_PICK_PACK_ROWS);
  const [shipmentRows, setShipmentRows] = useState<ShipmentRow[]>(INITIAL_SHIPMENT_ROWS);
  const [selectedPickListId, setSelectedPickListId] = useState<string | null>(null);
  const [selectedShipmentIds, setSelectedShipmentIds] = useState<Set<string>>(new Set());
  const [expandedShipmentIds, setExpandedShipmentIds] = useState<Set<string>>(new Set());
  const [warehouse, setWarehouse] = useState("PA Fulfilment Facility");
  const [newPicker, setNewPicker] = useState<string>("");
  const [lowInventoryDismissed, setLowInventoryDismissed] = useState(false);

  const toggleExpandShipment = (id: string) => {
    setExpandedShipmentIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  // Shipments already a part of the currently selected pick list — these
  // appear at the top of the table with their checkboxes disabled (and checked).
  const existingPickListShipmentIds = useMemo(
    () =>
      new Set(
        selectedPickListId
          ? shipmentRows
              .filter((s) => s.pickListId === selectedPickListId)
              .map((s) => s.id)
          : [],
      ),
    [selectedPickListId],
  );

  // Display order: when a pick list is selected, hoist its shipments to the top,
  // followed by the rest. Otherwise show the natural order.
  const displayShipments = useMemo(() => {
    if (!selectedPickListId) return shipmentRows;
    const inList = shipmentRows.filter((s) => s.pickListId === selectedPickListId);
    const rest = shipmentRows.filter((s) => s.pickListId !== selectedPickListId);
    return [...inList, ...rest];
  }, [selectedPickListId]);

  // Only shipments NOT already in the selected pick list are togglable.
  const togglableShipments = useMemo(
    () => displayShipments.filter((s) => !existingPickListShipmentIds.has(s.id)),
    [displayShipments, existingPickListShipmentIds],
  );

  const togglePickListSelection = (pickListId: string) => {
    if (selectedPickListId === pickListId) {
      setSelectedPickListId(null);
      setSelectedShipmentIds(new Set());
    } else {
      setSelectedPickListId(pickListId);
      setSelectedShipmentIds(new Set());
    }
    // Re-show alerts when the active pick list context changes
    setLowInventoryDismissed(false);
  };

  const handleShipmentCheck = (shipmentId: string, checked: boolean) => {
    if (existingPickListShipmentIds.has(shipmentId)) return; // disabled, no-op
    setSelectedShipmentIds((prev) => {
      const next = new Set(prev);
      if (checked) next.add(shipmentId);
      else next.delete(shipmentId);
      return next;
    });
    // Re-show alert when selection changes — the low-inventory product may have changed
    setLowInventoryDismissed(false);
  };

  const handleSelectAllShipments = (checked: boolean) => {
    if (checked) setSelectedShipmentIds(new Set(togglableShipments.map((s) => s.id)));
    else setSelectedShipmentIds(new Set());
    // Re-show alert when selection changes — the low-inventory product may have changed
    setLowInventoryDismissed(false);
  };

  const allShipmentsSelected =
    togglableShipments.length > 0 &&
    togglableShipments.every((s) => selectedShipmentIds.has(s.id));
  const someShipmentsSelected =
    togglableShipments.some((s) => selectedShipmentIds.has(s.id)) && !allShipmentsSelected;

  const selectedShipments = shipmentRows.filter((s) => selectedShipmentIds.has(s.id));
  const selectedPickList = pickPackRows.find((p) => p.pickListId === selectedPickListId) ?? null;

  // Panel opens when EITHER a pick list radio is selected OR shipments are being selected.
  // When a pick list is selected AND the user is choosing extra shipments, we enter
  // "addShipments" mode (the panel offers an "Add to Picklist" action).
  const panelMode: "pickList" | "shipments" | "addShipments" | null =
    selectedPickList && selectedShipmentIds.size > 0
      ? "addShipments"
      : selectedShipmentIds.size > 0
        ? "shipments"
        : selectedPickList
          ? "pickList"
          : null;
  const panelOpen = panelMode !== null;

  const formatDateMDY = (d: Date) => {
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const dd = String(d.getDate()).padStart(2, "0");
    return `${mm}/${dd}/${d.getFullYear()}`;
  };

  const generateNextPickListId = (existing: PickListRow[]): string => {
    const PREFIX = "PL-";
    const START = 100000;
    let max = START - 1;
    for (const row of existing) {
      const match = /^PL-(\d+)$/i.exec(row.pickListId);
      if (match) {
        const n = parseInt(match[1], 10);
        if (Number.isFinite(n) && n > max) max = n;
      }
    }
    return `${PREFIX}${max + 1}`;
  };

  const handleCreatePickList = () => {
    if (!newPicker || selectedShipments.length === 0) return;
    const generatedId = generateNextPickListId(pickPackRows);
    const selectedIds = new Set(selectedShipmentIds);
    const newPickList: PickListRow = {
      id: `pick-pack-${Date.now()}`,
      pickListId: generatedId,
      createdOn: formatDateMDY(new Date()),
      warehouse,
      totalOrders: String(selectedShipments.length),
      picker: newPicker,
    };
    setPickPackRows((prev) => [newPickList, ...prev]);
    setShipmentRows((prev) =>
      prev.map((s) => (selectedIds.has(s.id) ? { ...s, pickListId: generatedId } : s)),
    );
    setSelectedShipmentIds(new Set());
    setNewPicker("");
    setSelectedPickListId(generatedId);
  };

  const handleAddToPickList = () => {
    if (!selectedPickListId || selectedShipments.length === 0) return;
    const targetPickListId = selectedPickListId;
    const selectedIds = new Set(selectedShipmentIds);
    setShipmentRows((prev) =>
      prev.map((s) =>
        selectedIds.has(s.id) ? { ...s, pickListId: targetPickListId } : s,
      ),
    );
    setPickPackRows((prev) =>
      prev.map((p) =>
        p.pickListId === targetPickListId
          ? {
              ...p,
              totalOrders: String(
                Number(p.totalOrders || "0") + selectedShipments.length,
              ),
            }
          : p,
      ),
    );
    setSelectedShipmentIds(new Set());
    // Keep the pick list selected so the user sees the updated context.
  };

  const totalValue = selectedShipments.reduce((sum, s) => sum + parseMoney(s.totalValue), 0);
  const totalWeight = selectedShipments.reduce((sum, s) => sum + Number(s.weight), 0);

  // Aggregate products across the currently selected shipments (group by extId, sum qty)
  const aggregatedProducts: Product[] = useMemo(() => {
    const map = new Map<string, Product>();
    for (const s of selectedShipments) {
      for (const p of s.products) {
        const existing = map.get(p.extId);
        if (existing) {
          existing.qty += p.qty;
          existing.lowInventory = existing.lowInventory || p.lowInventory;
        } else {
          map.set(p.extId, { ...p });
        }
      }
    }
    return Array.from(map.values());
  }, [selectedShipments]);

  const totalQuantity = aggregatedProducts.reduce((sum, p) => sum + p.qty, 0);
  const lowInventoryProduct = aggregatedProducts.find((p) => p.lowInventory) ?? null;

  const relatedShipments = selectedPickList
    ? shipmentRows.filter((s) => s.pickListId === selectedPickList.pickListId)
    : [];

  // Prototype-only stats for the picklist detail panel.
  const totalShipmentsCount = relatedShipments.length;
  const shippedCount = Math.max(0, totalShipmentsCount - 2);
  const remainingCount = Math.max(0, totalShipmentsCount - shippedCount);

  const relatedLowInventoryNames = useMemo(() => {
    const names = new Set<string>();
    for (const s of relatedShipments) {
      for (const p of s.products) {
        if (p.lowInventory) names.add(p.name);
      }
    }
    return Array.from(names);
  }, [relatedShipments]);

  // Aggregate items across the shipments that belong to the selected pick list
  const relatedItems: Product[] = useMemo(() => {
    const map = new Map<string, Product>();
    for (const s of relatedShipments) {
      for (const p of s.products) {
        const existing = map.get(p.extId);
        if (existing) {
          existing.qty += p.qty;
          existing.lowInventory = existing.lowInventory || p.lowInventory;
        } else {
          map.set(p.extId, { ...p });
        }
      }
    }
    return Array.from(map.values());
  }, [relatedShipments]);

  return (
    <div className="flex h-full min-h-full w-full flex-1 items-stretch gap-2">
      {/* Main content (squeezes left when panel opens) */}
      <section className="flex min-w-0 flex-1 flex-col items-stretch gap-2">
        {/* Pick Lists Table */}
        <Card className="h-auto w-full overflow-hidden rounded-lg border border-neutral-300 bg-neutral-0 shadow-none">
          <CardContent className="p-0">
            <header className="flex w-full flex-col gap-3 border-b border-neutral-150 bg-neutral-0 px-5 py-3 md:flex-row md:items-center md:justify-between">
              <div className="flex items-center gap-2">
                <img className="h-6 w-6 shrink-0" alt="" src="/figmaAssets/package-plus-1.svg" />
                <h2 className="m-0 font-heading text-2xl font-semibold leading-[33.6px] tracking-[0.15px] text-neutral-900">
                  Pick and Pack
                </h2>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <Select value={warehouse} onValueChange={setWarehouse}>
                  <SelectTrigger
                    data-testid="select-warehouse"
                    className={`h-9 w-auto min-w-[200px] sm:min-w-[262px] gap-2 rounded border border-neutral-300 bg-neutral-0 px-3 py-2 text-left shadow-none [&>svg]:text-neutral-700 ${
                      panelOpen ? "hidden xl:flex" : "hidden md:flex"
                    }`}
                  >
                    <div className="flex min-w-0 items-center gap-2">
                      <span className="font-body text-sm text-neutral-500">Warehouse</span>
                      <SelectValue className="font-body text-sm font-medium text-neutral-900" />
                    </div>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="PA Fulfilment Facility">PA Fulfilment Facility</SelectItem>
                    <SelectItem value="KS Fulfilment Center">KS Fulfilment Center</SelectItem>
                  </SelectContent>
                </Select>
                <Select defaultValue="All Time">
                  <SelectTrigger
                    data-testid="select-time"
                    className={`h-9 w-auto min-w-[140px] sm:min-w-[152px] gap-2 rounded border border-neutral-300 bg-neutral-0 px-3 py-2 text-left shadow-none [&>svg]:text-neutral-700 ${
                      panelOpen ? "hidden 2xl:flex" : "hidden lg:flex"
                    }`}
                  >
                    <div className="flex min-w-0 items-center gap-2">
                      <span className="font-body text-sm text-neutral-500">Time</span>
                      <SelectValue className="font-body text-sm font-medium text-neutral-900" />
                    </div>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="All Time">All Time</SelectItem>
                    <SelectItem value="Today">Today</SelectItem>
                    <SelectItem value="This Week">This Week</SelectItem>
                    <SelectItem value="This Month">This Month</SelectItem>
                  </SelectContent>
                </Select>
                <Button
                  data-testid="button-search"
                  variant="outline"
                  className="h-9 rounded border-neutral-300 bg-neutral-0 px-2 py-1 text-neutral-900 shadow-none hover:bg-neutral-100"
                  aria-label="Search"
                >
                  <SearchIcon className="h-5 w-5" />
                </Button>
                <Button
                  data-testid="button-filters"
                  variant="outline"
                  className="h-9 rounded border-neutral-300 bg-neutral-0 px-3 py-2 text-neutral-900 shadow-none hover:bg-neutral-100"
                >
                  <FilterIcon className="h-5 w-5" />
                  <span className="font-body text-sm font-medium">Filters</span>
                </Button>
              </div>
            </header>
            <div className="w-full overflow-x-auto">
              <Table className="w-full min-w-[760px]">
                <TableHeader>
                  <TableRow className="border-b border-neutral-300 bg-neutral-100 hover:bg-neutral-100">
                    <TableHead className="h-8 w-9 px-2" />
                    <TableHead className={headCellBase}>Pick List ID</TableHead>
                    <TableHead className={headCellBase}>Created on</TableHead>
                    <TableHead className={headCellBase}>Warehouse</TableHead>
                    <TableHead className={headCellBase}>Total Orders</TableHead>
                    <TableHead className={headCellBase}>Picker</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {pickPackRows.map((row) => {
                    const isSelected = selectedPickListId === row.pickListId;
                    return (
                      <TableRow
                        key={row.id}
                        data-testid={`row-picklist-${row.pickListId}`}
                        onClick={() => togglePickListSelection(row.pickListId)}
                        className={`${rowBase} cursor-pointer ${isSelected ? rowSelected : rowDefault}`}
                      >
                        <TableCell className="h-8 px-2 py-0">
                          <button
                            type="button"
                            data-testid={`radio-picklist-${row.pickListId}`}
                            className="flex h-8 w-8 items-center justify-center"
                            aria-label={`Select pick list ${row.pickListId}`}
                            aria-pressed={isSelected}
                            onClick={(e) => {
                              e.stopPropagation();
                              togglePickListSelection(row.pickListId);
                            }}
                          >
                            <span
                              className={`flex h-5 w-5 items-center justify-center rounded-full border-2 transition-colors ${
                                isSelected ? "border-brand-secondary" : "border-neutral-500"
                              }`}
                            >
                              {isSelected && (
                                <span className="h-2.5 w-2.5 rounded-full bg-brand-secondary" />
                              )}
                            </span>
                          </button>
                        </TableCell>
                        <TableCell
                          data-testid={`text-picklist-id-${row.pickListId}`}
                          className={`${cellTextBase} ${isSelected ? "text-brand-secondary font-semibold" : ""}`}
                        >
                          {row.pickListId}
                        </TableCell>
                        <TableCell className={cellTextBase}>{row.createdOn}</TableCell>
                        <TableCell className={cellTextBase}>{row.warehouse}</TableCell>
                        <TableCell className={cellTextBase}>{row.totalOrders}</TableCell>
                        <TableCell className={cellTextBase}>{row.picker}</TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
            <footer className="flex w-full flex-wrap items-center gap-4 border-t border-neutral-300 bg-neutral-0 px-5 py-2">
              <div className="inline-flex items-center gap-1 font-body text-sm text-neutral-900">
                <span>Total Pick Lists:</span>
                <span className="font-medium">{pickPackRows.length}</span>
              </div>
              <div className="inline-flex items-center gap-1 font-body text-sm text-neutral-900">
                <span>Need Attention:</span>
                <span className="font-medium">2</span>
              </div>
            </footer>
          </CardContent>
        </Card>

        {/* Shipments Table */}
        <Card className="flex w-full min-h-0 flex-1 flex-col overflow-hidden rounded-lg border border-neutral-300 bg-neutral-0 shadow-none">
          <CardContent className="flex min-h-0 flex-1 flex-col p-0">
            <header className="flex h-auto min-h-[52px] items-center justify-between gap-3 border-b border-neutral-150 bg-neutral-0 px-5 py-2">
              <h3 className="m-0 font-heading text-lg font-medium text-neutral-900">Orders</h3>
              {selectedPickListId && (
                <div
                  data-testid="pill-picklist-filter"
                  className="inline-flex items-center gap-1.5 rounded-full border border-brand-secondary/30 bg-brand-secondary/10 py-1 pl-3 pr-1.5 font-body text-xs font-medium text-brand-secondary"
                >
                  <span>{selectedPickListId}</span>
                  <button
                    type="button"
                    data-testid="button-clear-picklist-filter"
                    onClick={() => {
                      setSelectedPickListId(null);
                      setSelectedShipmentIds(new Set());
                    }}
                    aria-label={`Clear filter ${selectedPickListId}`}
                    className="flex h-4 w-4 items-center justify-center rounded-full text-brand-secondary hover:bg-brand-secondary/20"
                  >
                    <XIcon className="h-3 w-3" />
                  </button>
                </div>
              )}
            </header>
            <div className="w-full min-h-0 flex-1 overflow-auto">
              <Table className="w-full min-w-[900px]">
                <TableHeader>
                  <TableRow className="border-b border-neutral-300 bg-neutral-100 hover:bg-neutral-100">
                    <TableHead className="h-8 w-[44px] px-2">
                      <div className="flex h-8 items-center justify-center">
                        <Checkbox
                          data-testid="checkbox-select-all-shipments"
                          className="h-5 w-5 rounded-[4px] border-neutral-700 data-[state=checked]:border-brand-secondary data-[state=checked]:bg-brand-secondary data-[state=checked]:text-brand-secondary-contrast data-[state=indeterminate]:border-brand-secondary data-[state=indeterminate]:bg-brand-secondary"
                          checked={allShipmentsSelected || (someShipmentsSelected ? "indeterminate" : false)}
                          onCheckedChange={(checked) => handleSelectAllShipments(checked === true)}
                          aria-label="Select all shipments"
                        />
                      </div>
                    </TableHead>
                    <TableHead className="h-8 w-9 px-2" />
                    <TableHead className={headCellBase}>Shipment ID</TableHead>
                    <TableHead className={headCellBase}>Pick List ID</TableHead>
                    <TableHead className={headCellBase}>Store</TableHead>
                    <TableHead className={headCellBase}>Total Value</TableHead>
                    <TableHead className={headCellBase}>Weight (lb)</TableHead>
                    <TableHead className={headCellBase}>Customer</TableHead>
                    <TableHead className={headCellBase}>Carrier</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {displayShipments.map((row) => {
                    const isInPickList = existingPickListShipmentIds.has(row.id);
                    const isChecked = isInPickList || selectedShipmentIds.has(row.id);
                    const isExpanded = expandedShipmentIds.has(row.id);
                    const rowClass = isInPickList
                      ? "bg-neutral-100 hover:bg-neutral-100 text-neutral-500"
                      : isChecked
                        ? rowSelected
                        : rowDefault;
                    return (
                      <Fragment key={row.id}>
                        <TableRow
                          data-testid={`row-shipment-${row.shipmentId}`}
                          onClick={() => {
                            if (isInPickList) return;
                            handleShipmentCheck(row.id, !isChecked);
                          }}
                          className={`${rowBase} ${isInPickList ? "cursor-default" : "cursor-pointer"} ${rowClass}`}
                        >
                          <TableCell
                            className="h-8 px-2 py-0"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <div className="flex h-8 items-center justify-center">
                              <Checkbox
                                data-testid={`checkbox-shipment-${row.shipmentId}`}
                                className={
                                  isInPickList
                                    ? "h-5 w-5 rounded-[4px] border-neutral-500 bg-neutral-300 data-[state=checked]:border-neutral-500 data-[state=checked]:bg-neutral-300 data-[state=checked]:text-neutral-700 disabled:cursor-not-allowed disabled:opacity-100"
                                    : "h-5 w-5 rounded-[4px] border-neutral-700 data-[state=checked]:border-brand-secondary data-[state=checked]:bg-brand-secondary data-[state=checked]:text-brand-secondary-contrast"
                                }
                                checked={isChecked}
                                disabled={isInPickList}
                                onCheckedChange={(checked) => handleShipmentCheck(row.id, checked === true)}
                                aria-label={
                                  isInPickList
                                    ? `${row.shipmentId} is already in ${selectedPickListId}`
                                    : `Select shipment ${row.shipmentId}`
                                }
                              />
                            </div>
                          </TableCell>
                          <TableCell className="h-8 px-2 py-0">
                            <button
                              type="button"
                              data-testid={`button-expand-shipment-${row.shipmentId}`}
                              aria-label={isExpanded ? "Collapse products" : "Expand products"}
                              aria-expanded={isExpanded}
                              onClick={(e) => {
                                e.stopPropagation();
                                toggleExpandShipment(row.id);
                              }}
                              className="flex h-6 w-6 items-center justify-center rounded border border-neutral-300 bg-neutral-0 hover:bg-neutral-100"
                            >
                              <ChevronRightIcon
                                className={`h-3 w-3 text-neutral-700 transition-transform ${isExpanded ? "rotate-90" : ""}`}
                              />
                            </button>
                          </TableCell>
                          <TableCell
                            data-testid={`text-shipment-id-${row.shipmentId}`}
                            className={cellTextBase}
                          >
                            {row.shipmentId}
                          </TableCell>
                          <TableCell className={cellTextBase}>{row.pickListId}</TableCell>
                          <TableCell className="h-8 px-2 py-0">
                            <div className="flex items-center gap-2.5">
                              <span
                                className="h-4 w-4 rounded-full bg-cover bg-center"
                                style={{ backgroundImage: `url(${row.storeIcon})` }}
                                aria-hidden="true"
                              />
                              <span className="font-body text-sm text-neutral-700">{row.store}</span>
                            </div>
                          </TableCell>
                          <TableCell className={cellTextBase}>{row.totalValue}</TableCell>
                          <TableCell className={cellTextBase}>{row.weight}</TableCell>
                          <TableCell className={cellTextBase}>{row.customer}</TableCell>
                          <TableCell className="h-8 px-2 py-0">
                            <div className="flex items-center gap-2.5">
                              <img className="h-4 w-4 shrink-0" alt="" src={row.carrierIcon} />
                              <span className="font-body text-sm text-neutral-700">{row.carrier}</span>
                            </div>
                          </TableCell>
                        </TableRow>
                        {isExpanded && (
                          <TableRow
                            data-testid={`row-shipment-expanded-${row.shipmentId}`}
                            className="border-b border-neutral-300 bg-neutral-100 hover:bg-neutral-100"
                          >
                            <TableCell colSpan={9} className="p-0">
                              <div className="px-12 py-3">
                                <Table className="w-full bg-neutral-0">
                                  <TableHeader>
                                    <TableRow className="border-b border-neutral-300 hover:bg-transparent">
                                      <TableHead className="h-8 w-[120px] px-3 font-body text-xs font-medium text-neutral-900">
                                        Ext. ID
                                      </TableHead>
                                      <TableHead className="h-8 px-3 font-body text-xs font-medium text-neutral-900">
                                        Name
                                      </TableHead>
                                      <TableHead className="h-8 w-[80px] px-3 text-right font-body text-xs font-medium text-neutral-900">
                                        Qty
                                      </TableHead>
                                    </TableRow>
                                  </TableHeader>
                                  <TableBody>
                                    {row.products.map((p, idx) => (
                                      <TableRow
                                        key={`${row.id}-${p.extId}-${idx}`}
                                        className="border-b border-neutral-150 hover:bg-neutral-50"
                                      >
                                        <TableCell className="h-8 px-3 py-1 font-body text-sm text-neutral-900">
                                          {p.extId}
                                        </TableCell>
                                        <TableCell className="h-8 px-3 py-1">
                                          <a
                                            href="#"
                                            onClick={(e) => e.preventDefault()}
                                            className="font-body text-sm font-medium text-brand-primary underline underline-offset-2 hover:opacity-80"
                                          >
                                            {p.name}
                                          </a>
                                        </TableCell>
                                        <TableCell className="h-8 px-3 py-1 text-right font-body text-sm text-neutral-900">
                                          <span className="inline-flex items-center justify-end gap-1">
                                            {p.qty}
                                            {p.lowInventory && (
                                              <AlertTriangleIcon
                                                className="h-3.5 w-3.5 text-warning-strong"
                                                aria-label="Low inventory"
                                              />
                                            )}
                                          </span>
                                        </TableCell>
                                      </TableRow>
                                    ))}
                                  </TableBody>
                                </Table>
                              </div>
                            </TableCell>
                          </TableRow>
                        )}
                      </Fragment>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
            <footer className="flex w-full flex-wrap items-center gap-4 border-t border-neutral-300 bg-neutral-0 px-5 py-2">
              <div className="inline-flex items-center gap-1 font-body text-sm text-neutral-900">
                <span>Total Shipments:</span>
                <span className="font-medium">{displayShipments.length}</span>
              </div>
              <div className="inline-flex items-center gap-1 font-body text-sm text-neutral-900">
                <span>Needs Attention:</span>
                <span className="font-medium">2</span>
              </div>
            </footer>
          </CardContent>
        </Card>
      </section>
      {/* Inline detail panel — squeezes the page contents to the left when open */}
      <aside
        data-testid="panel-detail"
        aria-hidden={!panelOpen}
        className={`shrink-0 overflow-hidden transition-[width] duration-300 ease-out ${
          panelOpen ? "w-[380px]" : "w-0"
        }`}
      >
        <div className="h-full w-[380px]">
          {panelOpen && (
            <Card className="flex h-full flex-col overflow-hidden rounded-lg border border-neutral-300 bg-neutral-0 shadow-none">
              <header className="flex items-center justify-between gap-2 border-b border-neutral-150 px-4 py-3">
                <div className="flex min-w-0 items-center gap-2">
                  <img className="h-5 w-5 shrink-0" alt="" src="/figmaAssets/package-plus-1.svg" />
                  <h3
                    data-testid="text-panel-title"
                    className="m-0 truncate font-heading text-sm font-semibold uppercase tracking-wider text-neutral-900"
                  >
                    {panelMode === "pickList" && selectedPickList
                      ? selectedPickList.pickListId
                      : panelMode === "addShipments" && selectedPickList
                        ? `${selectedPickList.pickListId} · ADD`
                        : "PICKLIST"}
                  </h3>
                </div>
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    aria-label="More options"
                    className="flex h-7 w-7 items-center justify-center rounded text-neutral-700 hover:bg-neutral-100"
                  >
                    <MoreVerticalIcon className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    data-testid="button-close-panel"
                    onClick={() => {
                      setSelectedPickListId(null);
                      setSelectedShipmentIds(new Set());
                    }}
                    aria-label="Close panel"
                    className="flex h-7 w-7 items-center justify-center rounded text-neutral-700 hover:bg-neutral-100"
                  >
                    <XIcon className="h-4 w-4" />
                  </button>
                </div>
              </header>

              <div className="flex-1 overflow-y-auto">
                {panelMode === "pickList" && selectedPickList && (
                  <div>
                    {/* Low Inventory alert */}
                    {relatedLowInventoryNames.length > 0 && !lowInventoryDismissed && (
                      <div
                        data-testid="alert-picklist-low-inventory"
                        className="mx-0 flex items-start gap-3 bg-warning-soft px-4 py-3"
                      >
                        <AlertTriangleIcon className="mt-0.5 h-5 w-5 shrink-0 text-warning-strong" />
                        <div className="min-w-0 flex-1">
                          <p className="font-body text-sm font-semibold text-neutral-900">
                            Low Inventory
                          </p>
                          <p className="font-body text-xs text-neutral-700">
                            Product Name: {relatedLowInventoryNames.join(", ")}
                          </p>
                        </div>
                        <button
                          type="button"
                          data-testid="button-dismiss-picklist-low-inventory"
                          onClick={() => setLowInventoryDismissed(true)}
                          aria-label="Dismiss alert"
                          className="text-neutral-700 hover:text-neutral-900"
                        >
                          <XIcon className="h-4 w-4" />
                        </button>
                      </div>
                    )}

                    {/* ID + status pill + metadata */}
                    <div className="px-4 pt-4 pb-3">
                      <div className="flex items-start justify-between gap-2">
                        <h2
                          data-testid="text-picklist-id"
                          className="m-0 font-heading text-lg font-semibold leading-7 text-neutral-900"
                        >
                          ID: {selectedPickList.pickListId}
                        </h2>
                        <div
                          data-testid="pill-picklist-status"
                          className="inline-flex h-6 items-center rounded-full bg-status-picking pl-3 pr-0 font-body text-sm font-medium text-neutral-900"
                        >
                          <span>Picking</span>
                          <span className="mx-2 h-4 w-px bg-neutral-900/20" aria-hidden="true" />
                          <button
                            type="button"
                            data-testid="button-change-picklist-status"
                            aria-label="Change status"
                            className="flex h-6 w-6 items-center justify-center rounded-r-full hover:bg-black/5"
                          >
                            <ChevronDownIcon className="h-4 w-4 text-neutral-900" />
                          </button>
                        </div>
                      </div>
                      <div className="mt-2 space-y-1">
                        <p className="font-body text-sm text-neutral-900">
                          <span className="text-neutral-700">Picker: </span>
                          <span data-testid="text-picklist-picker">{selectedPickList.picker}</span>
                        </p>
                        <p className="font-body text-sm text-neutral-900">
                          <span className="text-neutral-700">Created On: </span>
                          <span data-testid="text-picklist-created">{selectedPickList.createdOn}</span>
                        </p>
                        <p className="font-body text-sm text-neutral-900">
                          <span className="text-neutral-700">Warehouse: </span>
                          <span data-testid="text-picklist-warehouse">{selectedPickList.warehouse}</span>
                        </p>
                      </div>
                    </div>

                    {/* Stats row */}
                    <div className="grid grid-cols-4 gap-2 border-y border-neutral-150 bg-neutral-0 px-4 py-3">
                      <div>
                        <p
                          data-testid="stat-total-orders"
                          className="font-heading text-lg font-semibold leading-6 text-neutral-900"
                        >
                          {selectedPickList.totalOrders}
                        </p>
                        <p className="mt-0.5 font-body text-xs text-neutral-700">Total Orders</p>
                      </div>
                      <div>
                        <p
                          data-testid="stat-total-shipments"
                          className="font-heading text-lg font-semibold leading-6 text-neutral-900"
                        >
                          {totalShipmentsCount}
                        </p>
                        <p className="mt-0.5 font-body text-xs text-neutral-700">Total Shipments</p>
                      </div>
                      <div>
                        <p
                          data-testid="stat-shipped"
                          className="font-heading text-lg font-semibold leading-6 text-neutral-900"
                        >
                          {shippedCount}
                        </p>
                        <p className="mt-0.5 font-body text-xs text-neutral-700">Shipped</p>
                      </div>
                      <div>
                        <p
                          data-testid="stat-remaining"
                          className="font-heading text-lg font-semibold leading-6 text-neutral-900"
                        >
                          {remainingCount}
                        </p>
                        <p className="mt-0.5 font-body text-xs text-neutral-700">Remaining</p>
                      </div>
                    </div>

                    {/* Tabs */}
                    <Tabs defaultValue="products" className="w-full">
                      <TabsList className="h-auto w-full justify-start gap-4 rounded-none border-b border-neutral-150 bg-neutral-0 px-4 py-0">
                        <TabsTrigger
                          value="products"
                          data-testid="tab-picklist-products"
                          className="rounded-none border-b-2 border-transparent bg-transparent px-0 py-2 font-body text-sm text-neutral-700 shadow-none data-[state=active]:border-brand-secondary data-[state=active]:bg-transparent data-[state=active]:font-semibold data-[state=active]:text-brand-secondary data-[state=active]:shadow-none"
                        >
                          Products
                        </TabsTrigger>
                      </TabsList>
                    </Tabs>

                    {/* Products table */}
                    <div className="px-4 pt-3 pb-4">
                      {relatedItems.length === 0 ? (
                        <p className="font-body text-sm text-neutral-500">
                          No products associated with this pick list.
                        </p>
                      ) : (
                        <Table className="w-full">
                          <TableHeader>
                            <TableRow className="border-b border-neutral-300 bg-neutral-100 hover:bg-neutral-100">
                              <TableHead className="h-8 w-[80px] px-3 font-body text-xs font-medium text-neutral-900">
                                Ext. ID
                              </TableHead>
                              <TableHead className="h-8 px-3 font-body text-xs font-medium text-neutral-900">
                                Name
                              </TableHead>
                              <TableHead className="h-8 w-[70px] px-3 text-right font-body text-xs font-medium text-neutral-900">
                                Qty
                              </TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {relatedItems.map((item) => (
                              <TableRow
                                key={item.extId}
                                data-testid={`row-item-${item.extId}`}
                                className="h-8 border-b border-neutral-150 hover:bg-neutral-50"
                              >
                                <TableCell className="h-8 px-3 py-1 font-body text-sm text-neutral-900">
                                  {item.extId}
                                </TableCell>
                                <TableCell className="h-8 px-3 py-1">
                                  <a
                                    href="#"
                                    onClick={(e) => e.preventDefault()}
                                    className="font-body text-sm font-medium text-brand-primary underline underline-offset-2 hover:opacity-80"
                                  >
                                    {item.name}
                                  </a>
                                </TableCell>
                                <TableCell
                                  data-testid={`text-item-qty-${item.extId}`}
                                  className="h-8 px-3 py-1 text-right font-body text-sm text-neutral-900"
                                >
                                  <span className="inline-flex items-center justify-end gap-1">
                                    {item.qty}
                                    {item.lowInventory && (
                                      <AlertTriangleIcon
                                        className="h-3.5 w-3.5 text-warning-strong"
                                        aria-label="Low inventory"
                                      />
                                    )}
                                  </span>
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      )}
                    </div>
                  </div>
                )}

                {(panelMode === "shipments" || panelMode === "addShipments") && (
                  <div>
                    {/* Low Inventory alert */}
                    {lowInventoryProduct && !lowInventoryDismissed && (
                      <div
                        data-testid="alert-low-inventory"
                        className="m-4 flex items-start gap-3 rounded-md bg-warning-soft p-3"
                      >
                        <AlertTriangleIcon className="mt-0.5 h-5 w-5 shrink-0 text-warning-strong" />
                        <div className="min-w-0 flex-1">
                          <p className="font-body text-sm font-semibold text-neutral-900">
                            Low Inventory
                          </p>
                          <p className="truncate font-body text-xs text-neutral-700">
                            Product Name: {lowInventoryProduct.name}
                          </p>
                        </div>
                        <button
                          type="button"
                          data-testid="button-dismiss-low-inventory"
                          onClick={() => setLowInventoryDismissed(true)}
                          aria-label="Dismiss alert"
                          className="text-neutral-700 hover:text-neutral-900"
                        >
                          <XIcon className="h-4 w-4" />
                        </button>
                      </div>
                    )}

                    {/* Form: Picklist ID + Picker + counts */}
                    <div className="space-y-3 px-4 pb-4">
                      {panelMode === "addShipments" && selectedPickList ? (
                        <div
                          data-testid="banner-add-to-picklist"
                          className="rounded-md border border-brand-secondary/30 bg-brand-secondary/10 px-3 py-2"
                        >
                          <p className="font-body text-xs font-medium text-neutral-700">
                            Adding shipments to
                          </p>
                          <p
                            data-testid="text-target-picklist"
                            className="font-body text-sm font-semibold text-brand-secondary"
                          >
                            {selectedPickList.pickListId}
                            <span className="ml-2 font-normal text-neutral-700">
                              · Picker: {selectedPickList.picker}
                            </span>
                          </p>
                        </div>
                      ) : (
                        <div>
                          <label
                            htmlFor="select-new-picker"
                            className="mb-1 block font-body text-xs font-medium text-neutral-900"
                          >
                            Picker
                          </label>
                          <Select value={newPicker} onValueChange={setNewPicker}>
                            <SelectTrigger
                              id="select-new-picker"
                              data-testid="select-new-picker"
                              className="h-9 border-neutral-300 bg-neutral-0 font-body text-sm text-neutral-900 [&>span]:text-neutral-900 data-[placeholder]:[&>span]:text-neutral-500"
                            >
                              <SelectValue placeholder="Select" />
                            </SelectTrigger>
                            <SelectContent>
                              {PICKERS.map((p) => (
                                <SelectItem key={p} value={p}>
                                  {p}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <p className="mt-1 font-body text-xs text-neutral-500">
                            Pick list ID will be generated automatically.
                          </p>
                        </div>
                      )}
                      <div className="grid grid-cols-2 gap-3 pt-1">
                        <div>
                          <p className="font-body text-xs font-medium text-neutral-900">
                            {panelMode === "addShipments"
                              ? "Shipments to add"
                              : "Total Shipments"}
                          </p>
                          <p
                            data-testid="text-total-shipments"
                            className="font-body text-base font-semibold text-neutral-900"
                          >
                            {selectedShipments.length}
                          </p>
                        </div>
                        <div>
                          <p className="font-body text-xs font-medium text-neutral-900">
                            Total Quantity
                          </p>
                          <p
                            data-testid="text-total-quantity"
                            className="font-body text-base font-semibold text-neutral-900"
                          >
                            {totalQuantity}
                          </p>
                        </div>
                      </div>
                      <div className="flex gap-2 pt-2">
                        <Button
                          data-testid="button-cancel-picklist"
                          variant="outline"
                          className="flex-1 border-neutral-300 text-neutral-900 hover:bg-neutral-100"
                          onClick={() => {
                            setSelectedShipmentIds(new Set());
                            if (panelMode !== "addShipments") {
                              setNewPicker("");
                            }
                            setLowInventoryDismissed(false);
                          }}
                        >
                          Cancel
                        </Button>
                        {panelMode === "addShipments" ? (
                          <Button
                            data-testid="button-add-to-picklist"
                            className="flex-1 bg-brand-secondary text-brand-secondary-contrast hover:bg-brand-secondary/90"
                            onClick={handleAddToPickList}
                            disabled={selectedShipments.length === 0}
                          >
                            Add to Picklist
                          </Button>
                        ) : (
                          <Button
                            data-testid="button-create-picklist"
                            className="flex-1 bg-brand-secondary text-brand-secondary-contrast hover:bg-brand-secondary/90"
                            onClick={handleCreatePickList}
                            disabled={!newPicker || selectedShipments.length === 0}
                          >
                            Create Pick List
                          </Button>
                        )}
                      </div>
                    </div>

                    {/* Tabs + Products table */}
                    <Tabs defaultValue="products" className="w-full">
                      <TabsList className="h-auto w-full justify-start gap-4 rounded-none border-b border-neutral-300 bg-neutral-0 px-4 py-0">
                        <TabsTrigger
                          value="products"
                          data-testid="tab-products"
                          className="rounded-none border-b-2 border-transparent bg-transparent px-0 py-2 font-body text-sm text-neutral-700 shadow-none data-[state=active]:border-brand-secondary data-[state=active]:bg-transparent data-[state=active]:font-semibold data-[state=active]:text-brand-secondary data-[state=active]:shadow-none"
                        >
                          Products
                        </TabsTrigger>
                      </TabsList>
                    </Tabs>

                    <div className="px-4 pt-3">
                      <Table className="w-full">
                        <TableHeader>
                          <TableRow className="border-b border-neutral-300 bg-neutral-0 hover:bg-neutral-0">
                            <TableHead className="h-8 px-2 font-body text-xs font-medium text-neutral-900">
                              Ext. ID
                            </TableHead>
                            <TableHead className="h-8 px-2 font-body text-xs font-medium text-neutral-900">
                              Name
                            </TableHead>
                            <TableHead className="h-8 px-2 text-right font-body text-xs font-medium text-neutral-900">
                              Qty
                            </TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {aggregatedProducts.map((p) => (
                            <TableRow
                              key={p.extId}
                              data-testid={`row-product-${p.extId}`}
                              className="h-8 border-b border-neutral-150 hover:bg-neutral-50"
                            >
                              <TableCell className="h-8 px-2 py-1 font-body text-sm text-neutral-900">
                                {p.extId}
                              </TableCell>
                              <TableCell className="h-8 px-2 py-1">
                                <a
                                  href="#"
                                  onClick={(e) => e.preventDefault()}
                                  className="font-body text-sm font-medium text-brand-primary underline underline-offset-2 hover:opacity-80"
                                >
                                  {p.name}
                                </a>
                              </TableCell>
                              <TableCell className="h-8 px-2 py-1 text-right font-body text-sm text-neutral-900">
                                <span className="inline-flex items-center justify-end gap-1">
                                  {p.qty}
                                  {p.lowInventory && (
                                    <AlertTriangleIcon
                                      className="h-3.5 w-3.5 text-warning-strong"
                                      aria-label="Low inventory"
                                    />
                                  )}
                                </span>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  </div>
                )}
              </div>

              {panelMode === "pickList" && (
                <footer className="flex items-center gap-6 border-t border-neutral-150 px-4 py-2">
                  <div className="font-body text-xs text-neutral-700">
                    <span className="text-neutral-700">Selected Shipments: </span>
                    <span
                      data-testid="text-picklist-selected-shipments"
                      className="font-semibold text-neutral-900"
                    >
                      {totalShipmentsCount}
                    </span>
                  </div>
                  <div className="font-body text-xs text-neutral-700">
                    <span className="text-neutral-700">Quantity </span>
                    <span
                      data-testid="text-picklist-quantity"
                      className="font-semibold text-neutral-900"
                    >
                      {relatedItems.reduce((sum, p) => sum + p.qty, 0)}
                    </span>
                  </div>
                </footer>
              )}
              {(panelMode === "shipments" || panelMode === "addShipments") && (
                <footer className="flex items-center justify-between border-t border-neutral-150 px-4 py-2">
                  <div className="font-body text-xs text-neutral-700">
                    <span className="font-semibold text-neutral-900">
                      {panelMode === "addShipments"
                        ? "Shipments to add:"
                        : "Selected Shipments:"}
                    </span>{" "}
                    {selectedShipments.length}
                  </div>
                  <div className="font-body text-xs text-neutral-700">
                    <span className="font-semibold text-neutral-900">Quantity:</span>{" "}
                    {totalQuantity}
                  </div>
                </footer>
              )}
            </Card>
          )}
        </div>
      </aside>
    </div>
  );
};
