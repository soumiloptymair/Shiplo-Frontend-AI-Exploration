import { useState } from "react";
import {
  ChevronRightIcon,
  FilterIcon,
  PackagePlusIcon,
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

type PickListRow = {
  id: string;
  pickListId: string;
  createdOn: string;
  warehouse: string;
  totalOrders: string;
  picker: string;
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
};

const pickPackRows: PickListRow[] = Array.from({ length: 8 }, (_, index) => ({
  id: `pick-pack-${index + 1}`,
  pickListId: `PL-${100000 + index}`,
  createdOn: "01/15/2025",
  warehouse: index % 2 === 0 ? "KS Fulfilment Center" : "PA Fulfilment Facility",
  totalOrders: String(10 + index * 2),
  picker: index % 3 === 0 ? "Jane Smith" : "John Doe",
}));

const shipmentRows: ShipmentRow[] = [
  { id: "shipment-1", shipmentId: "SH-001", pickListId: "PL-100000", store: "Walmart Marketplace", storeIcon: "/figmaAssets/integrations.png", totalValue: "$1,234.50", weight: "210", customer: "Alice Johnson", carrier: "UPS Express", carrierIcon: "/figmaAssets/pngegg--2--1.png" },
  { id: "shipment-2", shipmentId: "SH-002", pickListId: "PL-100000", store: "Walmart Marketplace", storeIcon: "/figmaAssets/integrations-1.png", totalValue: "$890.00", weight: "145", customer: "Bob Martinez", carrier: "UPS Express", carrierIcon: "/figmaAssets/pngegg--2--1-1.png" },
  { id: "shipment-3", shipmentId: "SH-003", pickListId: "PL-100001", store: "Walmart Marketplace", storeIcon: "/figmaAssets/integrations-2.png", totalValue: "$2,100.75", weight: "380", customer: "Carol White", carrier: "UPS Express", carrierIcon: "/figmaAssets/pngegg--2--1-2.png" },
  { id: "shipment-4", shipmentId: "SH-004", pickListId: "PL-100001", store: "Walmart Marketplace", storeIcon: "/figmaAssets/integrations-3.png", totalValue: "$560.20", weight: "95", customer: "David Lee", carrier: "UPS Express", carrierIcon: "/figmaAssets/pngegg--2--1-3.png" },
  { id: "shipment-5", shipmentId: "SH-005", pickListId: "PL-100002", store: "Walmart Marketplace", storeIcon: "/figmaAssets/integrations-4.png", totalValue: "$3,400.00", weight: "510", customer: "Eva Brown", carrier: "UPS Express", carrierIcon: "/figmaAssets/pngegg--2--1-4.png" },
  { id: "shipment-6", shipmentId: "SH-006", pickListId: "PL-100002", store: "Walmart Marketplace", storeIcon: "/figmaAssets/integrations-5.png", totalValue: "$780.50", weight: "120", customer: "Frank Davis", carrier: "UPS Express", carrierIcon: "/figmaAssets/pngegg--2--1-5.png" },
  { id: "shipment-7", shipmentId: "SH-007", pickListId: "PL-100003", store: "Walmart Marketplace", storeIcon: "/figmaAssets/integrations-6.png", totalValue: "$1,900.00", weight: "290", customer: "Grace Kim", carrier: "UPS Express", carrierIcon: "/figmaAssets/pngegg--2--1-6.png" },
  { id: "shipment-8", shipmentId: "SH-008", pickListId: "PL-100003", store: "Walmart Marketplace", storeIcon: "/figmaAssets/integrations-7.png", totalValue: "$640.00", weight: "110", customer: "Henry Wilson", carrier: "UPS Express", carrierIcon: "/figmaAssets/pngegg--2--1-7.png" },
  { id: "shipment-9", shipmentId: "SH-009", pickListId: "PL-100004", store: "Walmart Marketplace", storeIcon: "/figmaAssets/integrations-8.png", totalValue: "$1,050.00", weight: "180", customer: "Ivy Chen", carrier: "UPS Express", carrierIcon: "/figmaAssets/pngegg--2--1-8.png" },
  { id: "shipment-10", shipmentId: "SH-010", pickListId: "PL-100004", store: "Walmart Marketplace", storeIcon: "/figmaAssets/integrations-9.png", totalValue: "$2,750.30", weight: "430", customer: "James Park", carrier: "UPS Express", carrierIcon: "/figmaAssets/pngegg--2--1-9.png" },
];

const cellTextBase = "h-8 px-2 py-0 font-body text-sm text-neutral-900";
const headCellBase = "h-8 px-2 font-body text-sm font-medium text-neutral-900";
const rowBase = "h-8 border-b border-neutral-300 transition-colors";
const rowDefault = "bg-neutral-0 hover:bg-neutral-100";
const rowSelected = "bg-brand-secondary/10 hover:bg-brand-secondary/15";

const parseMoney = (s: string) => Number(s.replace(/[^0-9.]/g, "")) || 0;

export const PickPackDashboardSection = (): JSX.Element => {
  const [selectedPickListId, setSelectedPickListId] = useState<string | null>(null);
  const [selectedShipmentIds, setSelectedShipmentIds] = useState<Set<string>>(new Set());
  const [warehouse, setWarehouse] = useState("PA Fulfilment Facility");

  const filteredShipments = selectedPickListId
    ? shipmentRows.filter((s) => s.pickListId === selectedPickListId)
    : shipmentRows;

  const togglePickListSelection = (pickListId: string) => {
    if (selectedPickListId === pickListId) {
      setSelectedPickListId(null);
      setSelectedShipmentIds(new Set());
    } else {
      setSelectedPickListId(pickListId);
      setSelectedShipmentIds(new Set());
    }
  };

  const handleShipmentCheck = (shipmentId: string, checked: boolean) => {
    setSelectedShipmentIds((prev) => {
      const next = new Set(prev);
      if (checked) next.add(shipmentId);
      else next.delete(shipmentId);
      return next;
    });
  };

  const handleSelectAllShipments = (checked: boolean) => {
    if (checked) setSelectedShipmentIds(new Set(filteredShipments.map((s) => s.id)));
    else setSelectedShipmentIds(new Set());
  };

  const allShipmentsSelected =
    filteredShipments.length > 0 &&
    filteredShipments.every((s) => selectedShipmentIds.has(s.id));
  const someShipmentsSelected =
    filteredShipments.some((s) => selectedShipmentIds.has(s.id)) && !allShipmentsSelected;

  const selectedShipments = shipmentRows.filter((s) => selectedShipmentIds.has(s.id));
  const selectedPickList = pickPackRows.find((p) => p.pickListId === selectedPickListId) ?? null;

  // Panel opens when EITHER a pick list radio is selected OR shipments are being selected.
  // Shipment selection takes precedence in the panel content (more recent action).
  const panelMode: "pickList" | "shipments" | null =
    selectedShipmentIds.size > 0 ? "shipments" : selectedPickList ? "pickList" : null;
  const panelOpen = panelMode !== null;

  const closePanel = () => {
    setSelectedPickListId(null);
    setSelectedShipmentIds(new Set());
  };

  const handleCreatePickList = () => {
    alert(
      `Pick List created with ${selectedShipments.length} shipment(s):\n${selectedShipments.map((s) => s.shipmentId).join(", ")}`
    );
    setSelectedShipmentIds(new Set());
    setSelectedPickListId(null);
  };

  const totalValue = selectedShipments.reduce((sum, s) => sum + parseMoney(s.totalValue), 0);
  const totalWeight = selectedShipments.reduce((sum, s) => sum + Number(s.weight), 0);

  const relatedShipments = selectedPickList
    ? shipmentRows.filter((s) => s.pickListId === selectedPickList.pickListId)
    : [];

  return (
    <div className="flex w-full flex-1 items-stretch gap-2">
      {/* Main content (squeezes left when panel opens) */}
      <section className="flex min-w-0 flex-1 flex-col items-start justify-center gap-2">
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
                    className="h-9 w-auto min-w-[200px] sm:min-w-[262px] gap-2 rounded border border-neutral-300 bg-neutral-0 px-3 py-2 text-left shadow-none [&>svg]:text-neutral-700"
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
                    className="h-9 w-auto min-w-[140px] sm:min-w-[152px] gap-2 rounded border border-neutral-300 bg-neutral-0 px-3 py-2 text-left shadow-none [&>svg]:text-neutral-700"
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
                    <TableHead className="h-8 w-10 px-2" />
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {pickPackRows.map((row) => {
                    const isSelected = selectedPickListId === row.pickListId;
                    return (
                      <TableRow
                        key={row.id}
                        data-testid={`row-picklist-${row.pickListId}`}
                        className={`${rowBase} ${isSelected ? rowSelected : rowDefault}`}
                      >
                        <TableCell className="h-8 px-2 py-0">
                          <button
                            type="button"
                            data-testid={`radio-picklist-${row.pickListId}`}
                            className="flex h-8 w-8 items-center justify-center"
                            aria-label={`Select pick list ${row.pickListId}`}
                            aria-pressed={isSelected}
                            onClick={() => togglePickListSelection(row.pickListId)}
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
                        <TableCell className="h-8 px-2 py-0">
                          <span
                            aria-hidden="true"
                            className="flex h-6 w-6 items-center justify-center rounded border border-neutral-300 bg-neutral-0"
                          >
                            <ChevronRightIcon className="h-3 w-3 text-neutral-700" />
                          </span>
                        </TableCell>
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
              {selectedPickListId && (
                <div className="ml-auto">
                  <span className="font-body text-sm font-medium text-brand-secondary">
                    Viewing shipments for: {selectedPickListId}
                  </span>
                </div>
              )}
            </footer>
          </CardContent>
        </Card>

        {/* Shipments Table */}
        <Card className="w-full overflow-hidden rounded-lg border border-neutral-300 bg-neutral-0 shadow-none">
          <CardContent className="p-0">
            <header className="flex h-auto min-h-[52px] items-center justify-between gap-3 border-b border-neutral-150 bg-neutral-0 px-5 py-2">
              <h3 className="m-0 font-heading text-lg font-medium text-neutral-900">
                Shipments
                {selectedPickListId && (
                  <span className="ml-2 font-body text-sm font-normal text-neutral-500">
                    — {filteredShipments.length} for {selectedPickListId}
                  </span>
                )}
              </h3>
            </header>
            <div className="w-full overflow-x-auto">
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
                  {filteredShipments.map((row) => {
                    const isChecked = selectedShipmentIds.has(row.id);
                    return (
                      <TableRow
                        key={row.id}
                        data-testid={`row-shipment-${row.shipmentId}`}
                        className={`${rowBase} ${isChecked ? rowSelected : rowDefault}`}
                      >
                        <TableCell className="h-8 px-2 py-0">
                          <div className="flex h-8 items-center justify-center">
                            <Checkbox
                              data-testid={`checkbox-shipment-${row.shipmentId}`}
                              className="h-5 w-5 rounded-[4px] border-neutral-700 data-[state=checked]:border-brand-secondary data-[state=checked]:bg-brand-secondary data-[state=checked]:text-brand-secondary-contrast"
                              checked={isChecked}
                              onCheckedChange={(checked) => handleShipmentCheck(row.id, checked === true)}
                              aria-label={`Select shipment ${row.shipmentId}`}
                            />
                          </div>
                        </TableCell>
                        <TableCell className="h-8 px-2 py-0">
                          <span
                            aria-hidden="true"
                            className="flex h-6 w-6 items-center justify-center rounded border border-neutral-300 bg-neutral-0"
                          >
                            <ChevronRightIcon className="h-3 w-3 text-neutral-700" />
                          </span>
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
                    );
                  })}
                </TableBody>
              </Table>
            </div>
            <footer className="flex w-full flex-wrap items-center gap-4 border-t border-neutral-300 bg-neutral-0 px-5 py-2">
              <div className="inline-flex items-center gap-1 font-body text-sm text-neutral-900">
                <span>Total Shipments:</span>
                <span className="font-medium">{filteredShipments.length}</span>
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
              <header className="flex items-center justify-between border-b border-neutral-150 px-4 py-3">
                <div className="flex min-w-0 items-center gap-2">
                  {panelMode === "pickList" && selectedPickList && (
                    <>
                      <img className="h-5 w-5 shrink-0" alt="" src="/figmaAssets/package-plus-1.svg" />
                      <h3
                        data-testid="text-panel-title"
                        className="m-0 truncate font-heading text-base font-semibold text-neutral-900"
                      >
                        {selectedPickList.pickListId}
                      </h3>
                    </>
                  )}
                  {panelMode === "shipments" && (
                    <h3
                      data-testid="text-panel-title"
                      className="m-0 truncate font-heading text-base font-semibold text-neutral-900"
                    >
                      {selectedShipments.length} shipment{selectedShipments.length > 1 ? "s" : ""} selected
                    </h3>
                  )}
                </div>
                <button
                  type="button"
                  data-testid="button-close-panel"
                  onClick={closePanel}
                  className="flex h-7 w-7 items-center justify-center rounded text-neutral-700 hover:bg-neutral-100"
                  aria-label="Close panel"
                >
                  <XIcon className="h-4 w-4" />
                </button>
              </header>

              <div className="flex-1 overflow-y-auto p-4">
                {panelMode === "pickList" && selectedPickList && (
                  <div className="space-y-5">
                    <p className="font-body text-sm text-neutral-500">
                      Pick list details and associated shipments.
                    </p>
                    <div className="grid grid-cols-2 gap-3 rounded-lg border border-neutral-300 bg-neutral-100 p-4">
                      <DetailField label="Created on" value={selectedPickList.createdOn} />
                      <DetailField label="Picker" value={selectedPickList.picker} />
                      <DetailField label="Warehouse" value={selectedPickList.warehouse} />
                      <DetailField label="Total Orders" value={selectedPickList.totalOrders} />
                    </div>
                    <div>
                      <h4 className="mb-2 font-heading text-sm font-medium text-neutral-900">
                        Shipments ({relatedShipments.length})
                      </h4>
                      <div className="space-y-2">
                        {relatedShipments.length === 0 && (
                          <p className="font-body text-sm text-neutral-500">
                            No shipments associated with this pick list.
                          </p>
                        )}
                        {relatedShipments.map((s) => (
                          <div
                            key={s.id}
                            className="flex items-center justify-between rounded-lg border border-neutral-300 bg-neutral-0 p-3"
                          >
                            <div className="min-w-0">
                              <p className="font-body text-sm font-medium text-neutral-900">
                                {s.shipmentId}
                              </p>
                              <p className="truncate font-body text-xs text-neutral-500">{s.customer}</p>
                            </div>
                            <div className="text-right">
                              <p className="font-body text-sm font-medium text-neutral-900">{s.totalValue}</p>
                              <p className="font-body text-xs text-neutral-500">{s.weight} lb</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {panelMode === "shipments" && (
                  <div className="space-y-5">
                    <div className="grid grid-cols-2 gap-3 rounded-lg border border-neutral-300 bg-neutral-100 p-4">
                      <DetailField label="Total value" value={`$${totalValue.toFixed(2)}`} />
                      <DetailField label="Total weight" value={`${totalWeight} lb`} />
                    </div>
                    <div>
                      <h4 className="mb-2 font-heading text-sm font-medium text-neutral-900">
                        Selected shipments
                      </h4>
                      <div className="space-y-2">
                        {selectedShipments.map((s) => (
                          <div
                            key={s.id}
                            className="flex items-center justify-between rounded-lg border border-neutral-300 bg-neutral-0 p-3"
                          >
                            <div className="flex min-w-0 items-center gap-2">
                              <button
                                type="button"
                                data-testid={`button-remove-${s.shipmentId}`}
                                onClick={() => handleShipmentCheck(s.id, false)}
                                className="flex h-5 w-5 items-center justify-center rounded text-neutral-500 hover:bg-neutral-100 hover:text-neutral-900"
                                aria-label={`Remove ${s.shipmentId}`}
                              >
                                <XIcon className="h-3.5 w-3.5" />
                              </button>
                              <div className="min-w-0">
                                <p className="font-body text-sm font-medium text-neutral-900">
                                  {s.shipmentId}
                                </p>
                                <p className="truncate font-body text-xs text-neutral-500">
                                  {s.customer} · {s.carrier}
                                </p>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="font-body text-sm font-medium text-neutral-900">{s.totalValue}</p>
                              <p className="font-body text-xs text-neutral-500">{s.weight} lb</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <footer className="flex gap-2 border-t border-neutral-150 px-4 py-3">
                {panelMode === "pickList" && (
                  <>
                    <Button className="flex-1 bg-brand-secondary text-brand-secondary-contrast hover:bg-brand-secondary/90">
                      Print Pick List
                    </Button>
                    <Button
                      variant="outline"
                      className="flex-1 border-neutral-300 text-neutral-900 hover:bg-neutral-100"
                    >
                      Edit
                    </Button>
                  </>
                )}
                {panelMode === "shipments" && (
                  <>
                    <Button
                      data-testid="button-create-picklist"
                      className="flex-1 gap-2 bg-brand-secondary text-brand-secondary-contrast hover:bg-brand-secondary/90"
                      onClick={handleCreatePickList}
                    >
                      <PackagePlusIcon className="h-4 w-4" />
                      Create Pick List
                    </Button>
                    <Button
                      data-testid="button-clear-shipments"
                      variant="outline"
                      className="border-neutral-300 text-neutral-900 hover:bg-neutral-100"
                      onClick={() => setSelectedShipmentIds(new Set())}
                    >
                      Clear
                    </Button>
                  </>
                )}
              </footer>
            </Card>
          )}
        </div>
      </aside>
    </div>
  );
};

const DetailField = ({ label, value }: { label: string; value: string }) => (
  <div className="min-w-0">
    <p className="font-body text-xs text-neutral-500">{label}</p>
    <p className="truncate font-body text-sm font-medium text-neutral-900">{value}</p>
  </div>
);
