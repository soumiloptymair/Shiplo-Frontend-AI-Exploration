import { useState } from "react";
import {
  ChevronRightIcon,
  FilterIcon,
  PackagePlusIcon,
  SearchIcon,
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
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
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

type DetailEntity =
  | { kind: "pickList"; data: PickListRow }
  | { kind: "shipment"; data: ShipmentRow }
  | null;

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

export const PickPackDashboardSection = (): JSX.Element => {
  const [selectedPickListId, setSelectedPickListId] = useState<string | null>(null);
  const [selectedShipmentIds, setSelectedShipmentIds] = useState<Set<string>>(new Set());
  const [warehouse, setWarehouse] = useState("PA Fulfilment Facility");
  const [detail, setDetail] = useState<DetailEntity>(null);

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

  const handleCreatePickList = () => {
    const selected = filteredShipments.filter((s) => selectedShipmentIds.has(s.id));
    alert(
      `Pick List created with ${selected.length} shipment(s):\n${selected.map((s) => s.shipmentId).join(", ")}`
    );
    setSelectedShipmentIds(new Set());
    setSelectedPickListId(null);
  };

  const relatedShipments =
    detail?.kind === "pickList"
      ? shipmentRows.filter((s) => s.pickListId === detail.data.pickListId)
      : [];

  return (
    <section className="flex flex-1 flex-col items-start justify-center gap-2 self-stretch">
      {/* Pick Lists Table */}
      <Card className="h-auto w-full overflow-hidden rounded-lg border border-[#e4eaed] bg-white shadow-none">
        <CardContent className="p-0">
          <header className="flex w-full flex-col gap-3 border-b border-[#eff6f9] bg-white px-5 py-3 md:flex-row md:items-center md:justify-between">
            <div className="flex items-center gap-2">
              <img className="h-6 w-6 shrink-0" alt="Package plus" src="/figmaAssets/package-plus-1.svg" />
              <h2 className="m-0 [font-family:'Montserrat',Helvetica] text-2xl font-semibold leading-[33.6px] tracking-[0.15px] text-grey-11">
                Pick and Pack
              </h2>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <Select value={warehouse} onValueChange={setWarehouse}>
                <SelectTrigger
                  data-testid="select-warehouse"
                  className="h-9 w-auto min-w-[200px] sm:min-w-[262px] gap-2 rounded border border-[#e4eaed] bg-white px-3 py-2 text-left shadow-none [&>svg]:text-[#45565b]"
                >
                  <div className="flex min-w-0 items-center gap-2">
                    <span className="text-sm text-[#7f9199]">Warehouse</span>
                    <SelectValue className="text-sm font-medium text-[#0b1516]" />
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
                  className="h-9 w-auto min-w-[140px] sm:min-w-[152px] gap-2 rounded border border-[#e4eaed] bg-white px-3 py-2 text-left shadow-none [&>svg]:text-[#45565b]"
                >
                  <div className="flex min-w-0 items-center gap-2">
                    <span className="text-sm text-[#7f9199]">Time</span>
                    <SelectValue className="text-sm font-medium text-[#0b1516]" />
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
                className="h-9 rounded border-[#e4eaed] bg-white px-2 py-1 text-[#0b1516] shadow-none hover:bg-white"
                aria-label="Search"
              >
                <SearchIcon className="h-5 w-5" />
              </Button>
              <Button
                data-testid="button-filters"
                variant="outline"
                className="h-9 rounded border-[#e4eaed] bg-white px-3 py-2 text-[#0b1516] shadow-none hover:bg-white"
              >
                <FilterIcon className="h-5 w-5" />
                <span className="text-sm font-medium">Filters</span>
              </Button>
            </div>
          </header>
          <div className="w-full overflow-x-auto">
            <Table className="w-full min-w-[760px]">
              <TableHeader>
                <TableRow className="border-b border-[#e4eaed] bg-[#f6f9fb] hover:bg-[#f6f9fb]">
                  <TableHead className="h-8 w-9 px-2" />
                  <TableHead className="h-8 px-2 text-sm font-medium text-[#0b1516]">Pick List ID</TableHead>
                  <TableHead className="h-8 px-2 text-sm font-medium text-[#0b1516]">Created on</TableHead>
                  <TableHead className="h-8 px-2 text-sm font-medium text-[#0b1516]">Warehouse</TableHead>
                  <TableHead className="h-8 px-2 text-sm font-medium text-[#0b1516]">Total Orders</TableHead>
                  <TableHead className="h-8 px-2 text-sm font-medium text-[#0b1516]">Picker</TableHead>
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
                      className={`h-8 border-b border-[#e4eaed] cursor-pointer transition-colors ${
                        isSelected ? "bg-[#e6f5f3] hover:bg-[#d9f0ed]" : "bg-white hover:bg-[#f6f9fb]"
                      }`}
                      onClick={() => setDetail({ kind: "pickList", data: row })}
                    >
                      <TableCell className="h-8 px-2 py-0">
                        <button
                          type="button"
                          data-testid={`radio-picklist-${row.pickListId}`}
                          className="flex h-8 w-8 items-center justify-center"
                          aria-label={`Select pick list ${row.pickListId}`}
                          onClick={(e) => {
                            e.stopPropagation();
                            togglePickListSelection(row.pickListId);
                          }}
                        >
                          <span
                            className={`flex h-5 w-5 items-center justify-center rounded-full border-2 ${
                              isSelected ? "border-[#008572]" : "border-[#7f9199]"
                            }`}
                          >
                            {isSelected && <span className="h-2.5 w-2.5 rounded-full bg-[#008572]" />}
                          </span>
                        </button>
                      </TableCell>
                      <TableCell
                        data-testid={`text-picklist-id-${row.pickListId}`}
                        className={`h-8 px-2 py-0 text-sm ${isSelected ? "text-[#008572] font-semibold" : "text-grey-11"}`}
                      >
                        {row.pickListId}
                      </TableCell>
                      <TableCell className="h-8 px-2 py-0 text-sm text-grey-11">{row.createdOn}</TableCell>
                      <TableCell className="h-8 px-2 py-0 text-sm text-grey-11">{row.warehouse}</TableCell>
                      <TableCell className="h-8 px-2 py-0 text-sm text-grey-11">{row.totalOrders}</TableCell>
                      <TableCell className="h-8 px-2 py-0 text-sm text-grey-11">{row.picker}</TableCell>
                      <TableCell className="h-8 px-2 py-0">
                        <button
                          type="button"
                          data-testid={`button-open-picklist-${row.pickListId}`}
                          className="flex h-6 w-6 items-center justify-center rounded border border-[#e4eaed] bg-white"
                          aria-label={`Open pick list ${row.pickListId}`}
                          onClick={(e) => {
                            e.stopPropagation();
                            setDetail({ kind: "pickList", data: row });
                          }}
                        >
                          <ChevronRightIcon className="h-3 w-3 text-[#45565b]" />
                        </button>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
          <footer className="flex w-full flex-wrap items-center gap-4 border-t border-[#e4eaed] bg-white px-5 py-2">
            <div className="inline-flex items-center gap-1 text-sm text-[#0b1516]">
              <span>Total Pick Lists:</span>
              <span className="font-medium">{pickPackRows.length}</span>
            </div>
            <div className="inline-flex items-center gap-1 text-sm text-[#0b1516]">
              <span>Need Attention:</span>
              <span className="font-medium">2</span>
            </div>
            {selectedPickListId && (
              <div className="ml-auto">
                <span className="text-sm text-[#008572] font-medium">
                  Viewing shipments for: {selectedPickListId}
                </span>
              </div>
            )}
          </footer>
        </CardContent>
      </Card>

      {/* Shipments Table */}
      <Card className="w-full overflow-hidden rounded-lg border border-[#e4eaed] bg-white shadow-none">
        <CardContent className="p-0">
          <header className="flex h-auto min-h-[52px] items-center justify-between border-b border-[#eff6f9] bg-white px-5 py-2 gap-3">
            <h3 className="m-0 text-lg font-medium text-[#0b1516]">
              Shipments
              {selectedPickListId && (
                <span className="ml-2 text-sm font-normal text-[#7f9199]">
                  — {filteredShipments.length} for {selectedPickListId}
                </span>
              )}
            </h3>
            {selectedShipmentIds.size > 0 && (
              <Button
                data-testid="button-create-picklist"
                className="h-9 gap-2 rounded bg-[#008572] px-4 py-2 text-white hover:bg-[#007563] shadow-none"
                onClick={handleCreatePickList}
              >
                <PackagePlusIcon className="h-4 w-4" />
                <span className="text-sm font-medium">
                  Create Pick List ({selectedShipmentIds.size})
                </span>
              </Button>
            )}
          </header>
          <div className="w-full overflow-x-auto">
            <Table className="w-full min-w-[900px]">
              <TableHeader>
                <TableRow className="border-b border-[#e4eaed] bg-[#f6f9fb] hover:bg-[#f6f9fb]">
                  <TableHead className="h-8 w-[44px] px-2">
                    <div className="flex h-8 items-center justify-center">
                      <Checkbox
                        data-testid="checkbox-select-all-shipments"
                        className="h-5 w-5 rounded-[4px] border-[#45565b] data-[state=checked]:border-[#008572] data-[state=checked]:bg-[#008572] data-[state=checked]:text-white data-[state=indeterminate]:border-[#008572] data-[state=indeterminate]:bg-[#008572]"
                        checked={allShipmentsSelected || (someShipmentsSelected ? "indeterminate" : false)}
                        onCheckedChange={(checked) => handleSelectAllShipments(checked === true)}
                        aria-label="Select all shipments"
                      />
                    </div>
                  </TableHead>
                  <TableHead className="h-8 w-9 px-2" />
                  <TableHead className="h-8 px-2 text-sm font-medium text-[#0b1516]">Shipment ID</TableHead>
                  <TableHead className="h-8 px-2 text-sm font-medium text-[#0b1516]">Pick List ID</TableHead>
                  <TableHead className="h-8 px-2 text-sm font-medium text-[#0b1516]">Store</TableHead>
                  <TableHead className="h-8 px-2 text-sm font-medium text-[#0b1516]">Total Value</TableHead>
                  <TableHead className="h-8 px-2 text-sm font-medium text-[#0b1516]">Weight (lb)</TableHead>
                  <TableHead className="h-8 px-2 text-sm font-medium text-[#0b1516]">Customer</TableHead>
                  <TableHead className="h-8 px-2 text-sm font-medium text-[#0b1516]">Carrier</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredShipments.map((row) => {
                  const isChecked = selectedShipmentIds.has(row.id);
                  return (
                    <TableRow
                      key={row.id}
                      data-testid={`row-shipment-${row.shipmentId}`}
                      className={`h-8 border-b border-[#e4eaed] cursor-pointer transition-colors ${
                        isChecked ? "bg-[#e6f5f3] hover:bg-[#d9f0ed]" : "bg-white hover:bg-[#f6f9fb]"
                      }`}
                      onClick={() => setDetail({ kind: "shipment", data: row })}
                    >
                      <TableCell className="h-8 px-2 py-0" onClick={(e) => e.stopPropagation()}>
                        <div className="flex h-8 items-center justify-center">
                          <Checkbox
                            data-testid={`checkbox-shipment-${row.shipmentId}`}
                            className="h-5 w-5 rounded-[4px] border-[#45565b] data-[state=checked]:border-[#008572] data-[state=checked]:bg-[#008572] data-[state=checked]:text-white"
                            checked={isChecked}
                            onCheckedChange={(checked) => handleShipmentCheck(row.id, checked === true)}
                            aria-label={`Select shipment ${row.shipmentId}`}
                          />
                        </div>
                      </TableCell>
                      <TableCell className="h-8 px-2 py-0">
                        <button
                          type="button"
                          data-testid={`button-open-shipment-${row.shipmentId}`}
                          className="flex h-6 w-6 items-center justify-center rounded border border-[#e4eaed] bg-white"
                          aria-label={`Open shipment ${row.shipmentId}`}
                          onClick={(e) => {
                            e.stopPropagation();
                            setDetail({ kind: "shipment", data: row });
                          }}
                        >
                          <ChevronRightIcon className="h-3 w-3 text-[#45565b]" />
                        </button>
                      </TableCell>
                      <TableCell
                        data-testid={`text-shipment-id-${row.shipmentId}`}
                        className="h-8 px-2 py-0 text-sm text-grey-11"
                      >
                        {row.shipmentId}
                      </TableCell>
                      <TableCell className="h-8 px-2 py-0 text-sm text-grey-11">{row.pickListId}</TableCell>
                      <TableCell className="h-8 px-2 py-0">
                        <div className="flex items-center gap-2.5">
                          <span
                            className="h-4 w-4 rounded-[50px] bg-cover bg-[50%_50%]"
                            style={{ backgroundImage: `url(${row.storeIcon})` }}
                            aria-hidden="true"
                          />
                          <span className="text-sm text-[#45565b]">{row.store}</span>
                        </div>
                      </TableCell>
                      <TableCell className="h-8 px-2 py-0 text-sm text-grey-11">{row.totalValue}</TableCell>
                      <TableCell className="h-8 px-2 py-0 text-sm text-grey-11">{row.weight}</TableCell>
                      <TableCell className="h-8 px-2 py-0 text-sm text-grey-11">{row.customer}</TableCell>
                      <TableCell className="h-8 px-2 py-0">
                        <div className="flex items-center gap-2.5">
                          <img className="h-4 w-4 shrink-0" alt="Carrier" src={row.carrierIcon} />
                          <span className="text-sm text-[#45565b]">{row.carrier}</span>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
          <footer className="flex w-full flex-wrap items-center gap-4 border-t border-[#e4eaed] bg-white px-5 py-2">
            <div className="inline-flex items-center gap-1 text-sm text-[#0b1516]">
              <span>Total Shipments:</span>
              <span className="font-medium">{filteredShipments.length}</span>
            </div>
            <div className="inline-flex items-center gap-1 text-sm text-[#0b1516]">
              <span>Needs Attention:</span>
              <span className="font-medium">2</span>
            </div>
            {selectedShipmentIds.size > 0 && (
              <div className="ml-auto inline-flex items-center gap-2">
                <span className="text-sm text-[#7f9199]">
                  {selectedShipmentIds.size} shipment{selectedShipmentIds.size > 1 ? "s" : ""} selected
                </span>
                <Button
                  data-testid="button-clear-shipments"
                  variant="outline"
                  size="sm"
                  className="h-7 text-xs border-[#e4eaed] text-[#45565b]"
                  onClick={() => setSelectedShipmentIds(new Set())}
                >
                  Clear
                </Button>
              </div>
            )}
          </footer>
        </CardContent>
      </Card>

      {/* Detail Side Panel */}
      <Sheet open={!!detail} onOpenChange={(open) => !open && setDetail(null)}>
        <SheetContent
          data-testid="sheet-detail"
          side="right"
          className="w-full sm:max-w-md md:max-w-lg overflow-y-auto"
        >
          {detail?.kind === "pickList" && (
            <>
              <SheetHeader className="text-left">
                <div className="flex items-center gap-2">
                  <img className="h-6 w-6" alt="" src="/figmaAssets/package-plus-1.svg" />
                  <SheetTitle data-testid="text-detail-title" className="text-xl">
                    {detail.data.pickListId}
                  </SheetTitle>
                </div>
                <SheetDescription>Pick List details and associated shipments</SheetDescription>
              </SheetHeader>
              <div className="mt-6 space-y-6">
                <div className="grid grid-cols-2 gap-4 rounded-lg border border-[#e4eaed] bg-[#f6f9fb] p-4">
                  <DetailField label="Created on" value={detail.data.createdOn} />
                  <DetailField label="Picker" value={detail.data.picker} />
                  <DetailField label="Warehouse" value={detail.data.warehouse} />
                  <DetailField label="Total Orders" value={detail.data.totalOrders} />
                </div>
                <div>
                  <h4 className="mb-2 text-sm font-medium text-[#0b1516]">
                    Shipments ({relatedShipments.length})
                  </h4>
                  <div className="space-y-2">
                    {relatedShipments.length === 0 && (
                      <p className="text-sm text-[#7f9199]">No shipments associated with this pick list.</p>
                    )}
                    {relatedShipments.map((s) => (
                      <button
                        key={s.id}
                        type="button"
                        data-testid={`button-detail-shipment-${s.shipmentId}`}
                        className="flex w-full items-center justify-between rounded-lg border border-[#e4eaed] bg-white p-3 text-left transition-colors hover:bg-[#f6f9fb]"
                        onClick={() => setDetail({ kind: "shipment", data: s })}
                      >
                        <div>
                          <p className="text-sm font-medium text-[#0b1516]">{s.shipmentId}</p>
                          <p className="text-xs text-[#7f9199]">{s.customer}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-medium text-[#0b1516]">{s.totalValue}</p>
                          <p className="text-xs text-[#7f9199]">{s.weight} lb</p>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button className="flex-1 bg-[#008572] hover:bg-[#007563] text-white">Print Pick List</Button>
                  <Button variant="outline" className="flex-1">Edit</Button>
                </div>
              </div>
            </>
          )}

          {detail?.kind === "shipment" && (
            <>
              <SheetHeader className="text-left">
                <div className="flex items-center gap-2">
                  <img className="h-6 w-6" alt="" src={detail.data.storeIcon} />
                  <SheetTitle data-testid="text-detail-title" className="text-xl">
                    {detail.data.shipmentId}
                  </SheetTitle>
                </div>
                <SheetDescription>Shipment details</SheetDescription>
              </SheetHeader>
              <div className="mt-6 space-y-6">
                <div className="grid grid-cols-2 gap-4 rounded-lg border border-[#e4eaed] bg-[#f6f9fb] p-4">
                  <DetailField label="Pick List" value={detail.data.pickListId} />
                  <DetailField label="Customer" value={detail.data.customer} />
                  <DetailField label="Store" value={detail.data.store} />
                  <DetailField label="Carrier" value={detail.data.carrier} />
                  <DetailField label="Total Value" value={detail.data.totalValue} />
                  <DetailField label="Weight" value={`${detail.data.weight} lb`} />
                </div>
                <div>
                  <h4 className="mb-2 text-sm font-medium text-[#0b1516]">Tracking</h4>
                  <div className="rounded-lg border border-[#e4eaed] bg-white p-4">
                    <div className="flex items-center gap-3">
                      <img className="h-8 w-8" alt="Carrier" src={detail.data.carrierIcon} />
                      <div>
                        <p className="text-sm font-medium text-[#0b1516]">{detail.data.carrier}</p>
                        <p className="text-xs text-[#7f9199]">Tracking #: 1Z999AA1{detail.data.shipmentId.replace(/\D/g, "")}</p>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button className="flex-1 bg-[#008572] hover:bg-[#007563] text-white">Print Label</Button>
                  <Button variant="outline" className="flex-1">View Order</Button>
                </div>
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>
    </section>
  );
};

const DetailField = ({ label, value }: { label: string; value: string }) => (
  <div>
    <p className="text-xs text-[#7f9199]">{label}</p>
    <p className="text-sm font-medium text-[#0b1516]">{value}</p>
  </div>
);
