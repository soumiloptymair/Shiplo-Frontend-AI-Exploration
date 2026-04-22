import { useState } from "react";
import { ChevronRightIcon, FilterIcon, PackagePlusIcon, SearchIcon } from "lucide-react";
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

const pickPackRows = Array.from({ length: 8 }, (_, index) => ({
  id: `pick-pack-${index + 1}`,
  pickListId: `PL-${100000 + index}`,
  createdOn: "01/15/2025",
  warehouse: index % 2 === 0 ? "KS Fulfilment Center" : "PA Fulfilment Facility",
  totalOrders: String(10 + index * 2),
  picker: index % 3 === 0 ? "Jane Smith" : "John Doe",
}));

const shipmentRows = [
  {
    id: "shipment-1",
    shipmentId: "SH-001",
    pickListId: "PL-100000",
    store: "Walmart Marketplace",
    storeIcon: "/figmaAssets/integrations.png",
    totalValue: "$1,234.50",
    weight: "210",
    customer: "Alice Johnson",
    carrier: "UPS Express",
    carrierIcon: "/figmaAssets/pngegg--2--1.png",
  },
  {
    id: "shipment-2",
    shipmentId: "SH-002",
    pickListId: "PL-100000",
    store: "Walmart Marketplace",
    storeIcon: "/figmaAssets/integrations-1.png",
    totalValue: "$890.00",
    weight: "145",
    customer: "Bob Martinez",
    carrier: "UPS Express",
    carrierIcon: "/figmaAssets/pngegg--2--1-1.png",
  },
  {
    id: "shipment-3",
    shipmentId: "SH-003",
    pickListId: "PL-100001",
    store: "Walmart Marketplace",
    storeIcon: "/figmaAssets/integrations-2.png",
    totalValue: "$2,100.75",
    weight: "380",
    customer: "Carol White",
    carrier: "UPS Express",
    carrierIcon: "/figmaAssets/pngegg--2--1-2.png",
  },
  {
    id: "shipment-4",
    shipmentId: "SH-004",
    pickListId: "PL-100001",
    store: "Walmart Marketplace",
    storeIcon: "/figmaAssets/integrations-3.png",
    totalValue: "$560.20",
    weight: "95",
    customer: "David Lee",
    carrier: "UPS Express",
    carrierIcon: "/figmaAssets/pngegg--2--1-3.png",
  },
  {
    id: "shipment-5",
    shipmentId: "SH-005",
    pickListId: "PL-100002",
    store: "Walmart Marketplace",
    storeIcon: "/figmaAssets/integrations-4.png",
    totalValue: "$3,400.00",
    weight: "510",
    customer: "Eva Brown",
    carrier: "UPS Express",
    carrierIcon: "/figmaAssets/pngegg--2--1-4.png",
  },
  {
    id: "shipment-6",
    shipmentId: "SH-006",
    pickListId: "PL-100002",
    store: "Walmart Marketplace",
    storeIcon: "/figmaAssets/integrations-5.png",
    totalValue: "$780.50",
    weight: "120",
    customer: "Frank Davis",
    carrier: "UPS Express",
    carrierIcon: "/figmaAssets/pngegg--2--1-5.png",
  },
  {
    id: "shipment-7",
    shipmentId: "SH-007",
    pickListId: "PL-100003",
    store: "Walmart Marketplace",
    storeIcon: "/figmaAssets/integrations-6.png",
    totalValue: "$1,900.00",
    weight: "290",
    customer: "Grace Kim",
    carrier: "UPS Express",
    carrierIcon: "/figmaAssets/pngegg--2--1-6.png",
  },
  {
    id: "shipment-8",
    shipmentId: "SH-008",
    pickListId: "PL-100003",
    store: "Walmart Marketplace",
    storeIcon: "/figmaAssets/integrations-7.png",
    totalValue: "$640.00",
    weight: "110",
    customer: "Henry Wilson",
    carrier: "UPS Express",
    carrierIcon: "/figmaAssets/pngegg--2--1-7.png",
  },
  {
    id: "shipment-9",
    shipmentId: "SH-009",
    pickListId: "PL-100004",
    store: "Walmart Marketplace",
    storeIcon: "/figmaAssets/integrations-8.png",
    totalValue: "$1,050.00",
    weight: "180",
    customer: "Ivy Chen",
    carrier: "UPS Express",
    carrierIcon: "/figmaAssets/pngegg--2--1-8.png",
  },
  {
    id: "shipment-10",
    shipmentId: "SH-010",
    pickListId: "PL-100004",
    store: "Walmart Marketplace",
    storeIcon: "/figmaAssets/integrations-9.png",
    totalValue: "$2,750.30",
    weight: "430",
    customer: "James Park",
    carrier: "UPS Express",
    carrierIcon: "/figmaAssets/pngegg--2--1-9.png",
  },
];

export const PickPackDashboardSection = (): JSX.Element => {
  const [selectedPickListId, setSelectedPickListId] = useState<string | null>(null);
  const [selectedShipmentIds, setSelectedShipmentIds] = useState<Set<string>>(new Set());
  const [warehouse, setWarehouse] = useState("PA Fulfilment Facility");

  const filteredShipments = selectedPickListId
    ? shipmentRows.filter((s) => s.pickListId === selectedPickListId)
    : shipmentRows;

  const handlePickListSelect = (rowId: string, pickListId: string) => {
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
      if (checked) {
        next.add(shipmentId);
      } else {
        next.delete(shipmentId);
      }
      return next;
    });
  };

  const handleSelectAllShipments = (checked: boolean) => {
    if (checked) {
      setSelectedShipmentIds(new Set(filteredShipments.map((s) => s.id)));
    } else {
      setSelectedShipmentIds(new Set());
    }
  };

  const allShipmentsSelected =
    filteredShipments.length > 0 &&
    filteredShipments.every((s) => selectedShipmentIds.has(s.id));
  const someShipmentsSelected =
    filteredShipments.some((s) => selectedShipmentIds.has(s.id)) &&
    !allShipmentsSelected;

  const handleCreatePickList = () => {
    const selected = filteredShipments.filter((s) => selectedShipmentIds.has(s.id));
    alert(
      `Pick List created with ${selected.length} shipment(s):\n${selected.map((s) => s.shipmentId).join(", ")}`
    );
    setSelectedShipmentIds(new Set());
    setSelectedPickListId(null);
  };

  return (
    <section className="flex flex-1 flex-col items-start justify-center gap-2 self-stretch">
      {/* Pick Lists Table */}
      <Card className="h-auto w-full overflow-hidden rounded-lg border border-[#e4eaed] bg-white shadow-none">
        <CardContent className="p-0">
          <header className="flex w-full flex-col gap-3 border-b border-[#eff6f9] bg-white px-5 py-3 md:flex-row md:items-center md:justify-between">
            <div className="flex items-center gap-2">
              <img
                className="h-6 w-6 shrink-0"
                alt="Package plus"
                src="/figmaAssets/package-plus-1.svg"
              />
              <h2 className="m-0 [font-family:'Montserrat',Helvetica] text-2xl font-semibold leading-[33.6px] tracking-[0.15px] text-grey-11">
                Pick and Pack
              </h2>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <Select value={warehouse} onValueChange={setWarehouse}>
                <SelectTrigger className="h-9 w-auto min-w-[262px] gap-2 rounded border border-[#e4eaed] bg-white px-3 py-2 text-left shadow-none [&>svg]:text-[#45565b]">
                  <div className="flex min-w-0 items-center gap-2">
                    <span className="font-subtitle-2 text-[length:var(--subtitle-2-font-size)] font-[number:var(--subtitle-2-font-weight)] leading-[var(--subtitle-2-line-height)] tracking-[var(--subtitle-2-letter-spacing)] text-[#7f9199] [font-style:var(--subtitle-2-font-style)]">
                      Warehouse
                    </span>
                    <SelectValue className="font-subtitle-2-medium text-[length:var(--subtitle-2-medium-font-size)] font-[number:var(--subtitle-2-medium-font-weight)] leading-[var(--subtitle-2-medium-line-height)] tracking-[var(--subtitle-2-medium-letter-spacing)] text-[#0b1516] [font-style:var(--subtitle-2-medium-font-style)]" />
                  </div>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="PA Fulfilment Facility">
                    PA Fulfilment Facility
                  </SelectItem>
                  <SelectItem value="KS Fulfilment Center">
                    KS Fulfilment Center
                  </SelectItem>
                </SelectContent>
              </Select>
              <Select defaultValue="All Time">
                <SelectTrigger className="h-9 w-auto min-w-[152px] gap-2 rounded border border-[#e4eaed] bg-white px-3 py-2 text-left shadow-none [&>svg]:text-[#45565b]">
                  <div className="flex min-w-0 items-center gap-2">
                    <span className="font-subtitle-2 text-[length:var(--subtitle-2-font-size)] font-[number:var(--subtitle-2-font-weight)] leading-[var(--subtitle-2-line-height)] tracking-[var(--subtitle-2-letter-spacing)] text-[#7f9199] [font-style:var(--subtitle-2-font-style)]">
                      Time
                    </span>
                    <SelectValue className="font-subtitle-2-medium text-[length:var(--subtitle-2-medium-font-size)] font-[number:var(--subtitle-2-medium-font-weight)] leading-[var(--subtitle-2-medium-line-height)] tracking-[var(--subtitle-2-medium-letter-spacing)] text-[#0b1516] [font-style:var(--subtitle-2-medium-font-style)]" />
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
                variant="outline"
                className="h-9 rounded border-[#e4eaed] bg-white px-2 py-1 text-[#0b1516] shadow-none hover:bg-white"
                aria-label="Search"
              >
                <SearchIcon className="h-5 w-5" />
              </Button>
              <Button
                variant="outline"
                className="h-9 rounded border-[#e4eaed] bg-white px-3 py-2 text-[#0b1516] shadow-none hover:bg-white"
              >
                <FilterIcon className="h-5 w-5" />
                <span className="font-subtitle-2-medium text-[length:var(--subtitle-2-medium-font-size)] font-[number:var(--subtitle-2-medium-font-weight)] leading-[var(--subtitle-2-medium-line-height)] tracking-[var(--subtitle-2-medium-letter-spacing)] [font-style:var(--subtitle-2-medium-font-style)]">
                  Filters
                </span>
              </Button>
            </div>
          </header>
          <div className="w-full overflow-x-auto">
            <Table className="w-full min-w-[900px]">
              <TableHeader>
                <TableRow className="border-b border-[#e4eaed] bg-[#f6f9fb] hover:bg-[#f6f9fb]">
                  <TableHead className="h-8 w-9 px-2 font-subtitle-2-medium text-[length:var(--subtitle-2-medium-font-size)] font-[number:var(--subtitle-2-medium-font-weight)] leading-[var(--subtitle-2-medium-line-height)] tracking-[var(--subtitle-2-medium-letter-spacing)] text-[#0b1516] [font-style:var(--subtitle-2-medium-font-style)]" />
                  <TableHead className="h-8 w-[164px] px-2 font-subtitle-2-medium text-[length:var(--subtitle-2-medium-font-size)] font-[number:var(--subtitle-2-medium-font-weight)] leading-[var(--subtitle-2-medium-line-height)] tracking-[var(--subtitle-2-medium-letter-spacing)] text-[#0b1516] [font-style:var(--subtitle-2-medium-font-style)]">
                    Pick List ID
                  </TableHead>
                  <TableHead className="h-8 w-[108px] px-2 font-subtitle-2-medium text-[length:var(--subtitle-2-medium-font-size)] font-[number:var(--subtitle-2-medium-font-weight)] leading-[var(--subtitle-2-medium-line-height)] tracking-[var(--subtitle-2-medium-letter-spacing)] text-[#0b1516] [font-style:var(--subtitle-2-medium-font-style)]">
                    Created on
                  </TableHead>
                  <TableHead className="h-8 w-[155px] px-2 font-subtitle-2-medium text-[length:var(--subtitle-2-medium-font-size)] font-[number:var(--subtitle-2-medium-font-weight)] leading-[var(--subtitle-2-medium-line-height)] tracking-[var(--subtitle-2-medium-letter-spacing)] text-[#0b1516] [font-style:var(--subtitle-2-medium-font-style)]">
                    Warehouse
                  </TableHead>
                  <TableHead className="h-8 w-[108px] px-2 font-subtitle-2-medium text-[length:var(--subtitle-2-medium-font-size)] font-[number:var(--subtitle-2-medium-font-weight)] leading-[var(--subtitle-2-medium-line-height)] tracking-[var(--subtitle-2-medium-letter-spacing)] text-[#0b1516] [font-style:var(--subtitle-2-medium-font-style)]">
                    Total Orders
                  </TableHead>
                  <TableHead className="h-8 w-[88px] px-2 font-subtitle-2-medium text-[length:var(--subtitle-2-medium-font-size)] font-[number:var(--subtitle-2-medium-font-weight)] leading-[var(--subtitle-2-medium-line-height)] tracking-[var(--subtitle-2-medium-letter-spacing)] text-[#0b1516] [font-style:var(--subtitle-2-medium-font-style)]">
                    Picker
                  </TableHead>
                  <TableHead className="h-8 px-2" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {pickPackRows.map((row) => {
                  const isSelected = selectedPickListId === row.pickListId;
                  return (
                    <TableRow
                      key={row.id}
                      className={`h-8 border-b border-[#e4eaed] cursor-pointer transition-colors ${
                        isSelected
                          ? "bg-[#e6f5f3] hover:bg-[#d9f0ed]"
                          : "bg-white hover:bg-[#f6f9fb]"
                      }`}
                      onClick={() => handlePickListSelect(row.id, row.pickListId)}
                    >
                      <TableCell className="h-8 px-2 py-0">
                        <button
                          type="button"
                          className="flex h-8 items-center justify-center"
                          aria-label={`Select pick list ${row.pickListId}`}
                          onClick={(e) => {
                            e.stopPropagation();
                            handlePickListSelect(row.id, row.pickListId);
                          }}
                        >
                          <img
                            className="h-6 w-6"
                            alt="Radio button"
                            src={
                              isSelected
                                ? "/figmaAssets/radiobuttonuncheckedoutlined.svg"
                                : "/figmaAssets/radiobuttonuncheckedoutlined.svg"
                            }
                            style={
                              isSelected
                                ? { filter: "invert(35%) sepia(100%) saturate(400%) hue-rotate(130deg)" }
                                : {}
                            }
                          />
                        </button>
                      </TableCell>
                      <TableCell className={`h-8 px-2 py-0 font-data-grid-entries text-[length:var(--data-grid-entries-font-size)] font-[number:var(--data-grid-entries-font-weight)] leading-[var(--data-grid-entries-line-height)] tracking-[var(--data-grid-entries-letter-spacing)] [font-style:var(--data-grid-entries-font-style)] ${isSelected ? "text-[#008572] font-semibold" : "text-grey-11"}`}>
                        {row.pickListId}
                      </TableCell>
                      <TableCell className="h-8 px-2 py-0 font-data-grid-entries text-[length:var(--data-grid-entries-font-size)] font-[number:var(--data-grid-entries-font-weight)] leading-[var(--data-grid-entries-line-height)] tracking-[var(--data-grid-entries-letter-spacing)] text-grey-11 [font-style:var(--data-grid-entries-font-style)]">
                        {row.createdOn}
                      </TableCell>
                      <TableCell className="h-8 px-2 py-0 font-data-grid-entries text-[length:var(--data-grid-entries-font-size)] font-[number:var(--data-grid-entries-font-weight)] leading-[var(--data-grid-entries-line-height)] tracking-[var(--data-grid-entries-letter-spacing)] text-grey-11 [font-style:var(--data-grid-entries-font-style)]">
                        {row.warehouse}
                      </TableCell>
                      <TableCell className="h-8 px-2 py-0 font-data-grid-entries text-[length:var(--data-grid-entries-font-size)] font-[number:var(--data-grid-entries-font-weight)] leading-[var(--data-grid-entries-line-height)] tracking-[var(--data-grid-entries-letter-spacing)] text-grey-11 [font-style:var(--data-grid-entries-font-style)]">
                        {row.totalOrders}
                      </TableCell>
                      <TableCell className="h-8 px-2 py-0 font-data-grid-entries text-[length:var(--data-grid-entries-font-size)] font-[number:var(--data-grid-entries-font-weight)] leading-[var(--data-grid-entries-line-height)] tracking-[var(--data-grid-entries-letter-spacing)] text-grey-11 [font-style:var(--data-grid-entries-font-style)]">
                        {row.picker}
                      </TableCell>
                      <TableCell className="h-8 px-2 py-0">
                        <button
                          type="button"
                          className="flex h-6 w-6 items-center justify-center rounded border border-[#e4eaed] bg-white"
                          aria-label={`Open pick list ${row.pickListId}`}
                          onClick={(e) => e.stopPropagation()}
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
            <div className="inline-flex items-center gap-1">
              <span className="font-body text-[length:var(--body-font-size)] font-[number:var(--body-font-weight)] leading-[var(--body-line-height)] tracking-[var(--body-letter-spacing)] text-[#0b1516] [font-style:var(--body-font-style)]">
                Total Pick Lists:
              </span>
              <span className="font-subtitle-2-medium text-[length:var(--subtitle-2-medium-font-size)] font-[number:var(--subtitle-2-medium-font-weight)] leading-[var(--subtitle-2-medium-line-height)] tracking-[var(--subtitle-2-medium-letter-spacing)] text-[#0b1516] [font-style:var(--subtitle-2-medium-font-style)]">
                {pickPackRows.length}
              </span>
            </div>
            <div className="inline-flex items-center gap-1">
              <span className="font-body text-[length:var(--body-font-size)] font-[number:var(--body-font-weight)] leading-[var(--body-line-height)] tracking-[var(--body-letter-spacing)] text-[#0b1516] [font-style:var(--body-font-style)]">
                Need Attention:
              </span>
              <span className="font-subtitle-2-medium text-[length:var(--subtitle-2-medium-font-size)] font-[number:var(--subtitle-2-medium-font-weight)] leading-[var(--subtitle-2-medium-line-height)] tracking-[var(--subtitle-2-medium-letter-spacing)] text-[#0b1516] [font-style:var(--subtitle-2-medium-font-style)]">
                2
              </span>
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
            <h3 className="m-0 font-heading-5-medium text-[length:var(--heading-5-medium-font-size)] font-[number:var(--heading-5-medium-font-weight)] leading-[var(--heading-5-medium-line-height)] tracking-[var(--heading-5-medium-letter-spacing)] text-[#0b1516] [font-style:var(--heading-5-medium-font-style)]">
              Shipments
              {selectedPickListId && (
                <span className="ml-2 text-sm font-normal text-[#7f9199]">
                  — {filteredShipments.length} for {selectedPickListId}
                </span>
              )}
            </h3>
            {selectedShipmentIds.size > 0 && (
              <Button
                className="h-9 gap-2 rounded bg-[#008572] px-4 py-2 text-white hover:bg-[#007563] shadow-none"
                onClick={handleCreatePickList}
              >
                <PackagePlusIcon className="h-4 w-4" />
                <span className="font-subtitle-2-medium text-[length:var(--subtitle-2-medium-font-size)] font-[number:var(--subtitle-2-medium-font-weight)] leading-[var(--subtitle-2-medium-line-height)] tracking-[var(--subtitle-2-medium-letter-spacing)] [font-style:var(--subtitle-2-medium-font-style)]">
                  Create Pick List ({selectedShipmentIds.size})
                </span>
              </Button>
            )}
          </header>
          <div className="w-full overflow-x-auto">
            <Table className="w-full min-w-[1100px]">
              <TableHeader>
                <TableRow className="border-b border-[#e4eaed] bg-[#f6f9fb] hover:bg-[#f6f9fb]">
                  <TableHead className="h-8 w-[44px] px-2">
                    <div className="flex h-8 items-center justify-center">
                      <Checkbox
                        className="h-5 w-5 rounded-[4px] border-[#45565b] data-[state=checked]:border-[#008572] data-[state=checked]:bg-[#008572] data-[state=checked]:text-white data-[state=indeterminate]:border-[#008572] data-[state=indeterminate]:bg-[#008572]"
                        checked={allShipmentsSelected || (someShipmentsSelected ? "indeterminate" : false)}
                        onCheckedChange={(checked) =>
                          handleSelectAllShipments(checked === true)
                        }
                        aria-label="Select all shipments"
                      />
                    </div>
                  </TableHead>
                  <TableHead className="h-8 w-9 px-2" />
                  <TableHead className="h-8 w-[102px] px-2 font-subtitle-2-medium text-[length:var(--subtitle-2-medium-font-size)] font-[number:var(--subtitle-2-medium-font-weight)] leading-[var(--subtitle-2-medium-line-height)] tracking-[var(--subtitle-2-medium-letter-spacing)] text-[#0b1516] [font-style:var(--subtitle-2-medium-font-style)]">
                    Shipment ID
                  </TableHead>
                  <TableHead className="h-8 w-[98px] px-2 font-subtitle-2-medium text-[length:var(--subtitle-2-medium-font-size)] font-[number:var(--subtitle-2-medium-font-weight)] leading-[var(--subtitle-2-medium-line-height)] tracking-[var(--subtitle-2-medium-letter-spacing)] text-[#0b1516] [font-style:var(--subtitle-2-medium-font-style)]">
                    Pick List ID
                  </TableHead>
                  <TableHead className="h-8 w-[188px] px-2 font-subtitle-2-medium text-[length:var(--subtitle-2-medium-font-size)] font-[number:var(--subtitle-2-medium-font-weight)] leading-[var(--subtitle-2-medium-line-height)] tracking-[var(--subtitle-2-medium-letter-spacing)] text-[#0b1516] [font-style:var(--subtitle-2-medium-font-style)]">
                    Store
                  </TableHead>
                  <TableHead className="h-8 px-2 font-subtitle-2-medium text-[length:var(--subtitle-2-medium-font-size)] font-[number:var(--subtitle-2-medium-font-weight)] leading-[var(--subtitle-2-medium-line-height)] tracking-[var(--subtitle-2-medium-letter-spacing)] text-[#0b1516] [font-style:var(--subtitle-2-medium-font-style)]">
                    Total Value
                  </TableHead>
                  <TableHead className="h-8 w-[108px] px-2 font-subtitle-2-medium text-[length:var(--subtitle-2-medium-font-size)] font-[number:var(--subtitle-2-medium-font-weight)] leading-[var(--subtitle-2-medium-line-height)] tracking-[var(--subtitle-2-medium-letter-spacing)] text-[#0b1516] [font-style:var(--subtitle-2-medium-font-style)]">
                    Weight (lb)
                  </TableHead>
                  <TableHead className="h-8 w-[88px] px-2 font-subtitle-2-medium text-[length:var(--subtitle-2-medium-font-size)] font-[number:var(--subtitle-2-medium-font-weight)] leading-[var(--subtitle-2-medium-line-height)] tracking-[var(--subtitle-2-medium-letter-spacing)] text-[#0b1516] [font-style:var(--subtitle-2-medium-font-style)]">
                    Customer
                  </TableHead>
                  <TableHead className="h-8 px-2 font-subtitle-2-medium text-[length:var(--subtitle-2-medium-font-size)] font-[number:var(--subtitle-2-medium-font-weight)] leading-[var(--subtitle-2-medium-line-height)] tracking-[var(--subtitle-2-medium-letter-spacing)] text-[#0b1516] [font-style:var(--subtitle-2-medium-font-style)]">
                    Carrier
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredShipments.map((row) => {
                  const isChecked = selectedShipmentIds.has(row.id);
                  return (
                    <TableRow
                      key={row.id}
                      className={`h-8 border-b border-[#e4eaed] transition-colors ${
                        isChecked
                          ? "bg-[#e6f5f3] hover:bg-[#d9f0ed]"
                          : "bg-white hover:bg-[#f6f9fb]"
                      }`}
                    >
                      <TableCell className="h-8 px-2 py-0">
                        <div className="flex h-8 items-center justify-center">
                          <Checkbox
                            className="h-5 w-5 rounded-[4px] border-[#45565b] data-[state=checked]:border-[#008572] data-[state=checked]:bg-[#008572] data-[state=checked]:text-white"
                            checked={isChecked}
                            onCheckedChange={(checked) =>
                              handleShipmentCheck(row.id, checked === true)
                            }
                            aria-label={`Select shipment ${row.shipmentId}`}
                          />
                        </div>
                      </TableCell>
                      <TableCell className="h-8 px-2 py-0">
                        <button
                          type="button"
                          className="flex h-6 w-6 items-center justify-center rounded border border-[#e4eaed] bg-white"
                          aria-label={`Open shipment ${row.shipmentId}`}
                        >
                          <ChevronRightIcon className="h-3 w-3 text-[#45565b]" />
                        </button>
                      </TableCell>
                      <TableCell className="h-8 px-2 py-0 font-data-grid-entries text-[length:var(--data-grid-entries-font-size)] font-[number:var(--data-grid-entries-font-weight)] leading-[var(--data-grid-entries-line-height)] tracking-[var(--data-grid-entries-letter-spacing)] text-grey-11 [font-style:var(--data-grid-entries-font-style)]">
                        {row.shipmentId}
                      </TableCell>
                      <TableCell className="h-8 px-2 py-0 font-data-grid-entries text-[length:var(--data-grid-entries-font-size)] font-[number:var(--data-grid-entries-font-weight)] leading-[var(--data-grid-entries-line-height)] tracking-[var(--data-grid-entries-letter-spacing)] text-grey-11 [font-style:var(--data-grid-entries-font-style)]">
                        {row.pickListId}
                      </TableCell>
                      <TableCell className="h-8 px-2 py-0">
                        <div className="flex items-center gap-2.5">
                          <span
                            className="h-4 w-4 rounded-[50px] bg-cover bg-[50%_50%]"
                            style={{ backgroundImage: `url(${row.storeIcon})` }}
                            aria-hidden="true"
                          />
                          <span className="font-data-grid-entries text-[length:var(--data-grid-entries-font-size)] font-[number:var(--data-grid-entries-font-weight)] leading-[var(--data-grid-entries-line-height)] tracking-[var(--data-grid-entries-letter-spacing)] text-[#45565b] [font-style:var(--data-grid-entries-font-style)]">
                            {row.store}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="h-8 px-2 py-0 font-data-grid-entries text-[length:var(--data-grid-entries-font-size)] font-[number:var(--data-grid-entries-font-weight)] leading-[var(--data-grid-entries-line-height)] tracking-[var(--data-grid-entries-letter-spacing)] text-grey-11 [font-style:var(--data-grid-entries-font-style)]">
                        {row.totalValue}
                      </TableCell>
                      <TableCell className="h-8 px-2 py-0 font-data-grid-entries text-[length:var(--data-grid-entries-font-size)] font-[number:var(--data-grid-entries-font-weight)] leading-[var(--data-grid-entries-line-height)] tracking-[var(--data-grid-entries-letter-spacing)] text-grey-11 [font-style:var(--data-grid-entries-font-style)]">
                        {row.weight}
                      </TableCell>
                      <TableCell className="h-8 px-2 py-0 font-data-grid-entries text-[length:var(--data-grid-entries-font-size)] font-[number:var(--data-grid-entries-font-weight)] leading-[var(--data-grid-entries-line-height)] tracking-[var(--data-grid-entries-letter-spacing)] text-grey-11 [font-style:var(--data-grid-entries-font-style)]">
                        {row.customer}
                      </TableCell>
                      <TableCell className="h-8 px-2 py-0">
                        <div className="flex items-center gap-2.5">
                          <img
                            className="h-4 w-4 shrink-0"
                            alt="Carrier icon"
                            src={row.carrierIcon}
                          />
                          <span className="font-data-grid-entries text-[length:var(--data-grid-entries-font-size)] font-[number:var(--data-grid-entries-font-weight)] leading-[var(--data-grid-entries-line-height)] tracking-[var(--data-grid-entries-letter-spacing)] text-[#45565b] [font-style:var(--data-grid-entries-font-style)]">
                            {row.carrier}
                          </span>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
          <footer className="flex w-full flex-wrap items-center gap-4 border-t border-[#e4eaed] bg-white px-5 py-2">
            <div className="inline-flex items-center gap-1">
              <span className="font-body text-[length:var(--body-font-size)] font-[number:var(--body-font-weight)] leading-[var(--body-line-height)] tracking-[var(--body-letter-spacing)] text-[#0b1516] [font-style:var(--body-font-style)]">
                Total Shipments:
              </span>
              <span className="font-subtitle-2-medium text-[length:var(--subtitle-2-medium-font-size)] font-[number:var(--subtitle-2-medium-font-weight)] leading-[var(--subtitle-2-medium-line-height)] tracking-[var(--subtitle-2-medium-letter-spacing)] text-[#0b1516] [font-style:var(--subtitle-2-medium-font-style)]">
                {filteredShipments.length}
              </span>
            </div>
            <div className="inline-flex items-center gap-1">
              <span className="font-body text-[length:var(--body-font-size)] font-[number:var(--body-font-weight)] leading-[var(--body-line-height)] tracking-[var(--body-letter-spacing)] text-[#0b1516] [font-style:var(--body-font-style)]">
                Needs Attention:
              </span>
              <span className="font-subtitle-2-medium text-[length:var(--subtitle-2-medium-font-size)] font-[number:var(--subtitle-2-medium-font-weight)] leading-[var(--subtitle-2-medium-line-height)] tracking-[var(--subtitle-2-medium-letter-spacing)] text-[#0b1516] [font-style:var(--subtitle-2-medium-font-style)]">
                2
              </span>
            </div>
            {selectedShipmentIds.size > 0 && (
              <div className="ml-auto inline-flex items-center gap-2">
                <span className="text-sm text-[#7f9199]">
                  {selectedShipmentIds.size} shipment{selectedShipmentIds.size > 1 ? "s" : ""} selected
                </span>
                <Button
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
    </section>
  );
};
