import { ChevronRightIcon, FilterIcon, SearchIcon } from "lucide-react";
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
  pickListId: "123456",
  createdOn: "01/15/2025",
  warehouse: "KS Fulfilment Center",
  totalOrders: "14",
  picker: "John Doe",
}));

const shipmentRows = [
  {
    id: "shipment-1",
    shipmentId: "123456",
    pickListId: "123456",
    store: "Walmart Marketplace",
    storeIcon: "/figmaAssets/integrations.png",
    totalValue: "$1,234.50",
    weight: "210",
    customer: "John Doe",
    carrier: "UPS Express",
    carrierIcon: "/figmaAssets/pngegg--2--1.png",
  },
  {
    id: "shipment-2",
    shipmentId: "123456",
    pickListId: "123456",
    store: "Walmart Marketplace",
    storeIcon: "/figmaAssets/integrations-1.png",
    totalValue: "$1,234.50",
    weight: "210",
    customer: "John Doe",
    carrier: "UPS Express",
    carrierIcon: "/figmaAssets/pngegg--2--1-1.png",
  },
  {
    id: "shipment-3",
    shipmentId: "123456",
    pickListId: "123456",
    store: "Walmart Marketplace",
    storeIcon: "/figmaAssets/integrations-2.png",
    totalValue: "$1,234.50",
    weight: "210",
    customer: "John Doe",
    carrier: "UPS Express",
    carrierIcon: "/figmaAssets/pngegg--2--1-2.png",
  },
  {
    id: "shipment-4",
    shipmentId: "123456",
    pickListId: "123456",
    store: "Walmart Marketplace",
    storeIcon: "/figmaAssets/integrations-3.png",
    totalValue: "$1,234.50",
    weight: "210",
    customer: "John Doe",
    carrier: "UPS Express",
    carrierIcon: "/figmaAssets/pngegg--2--1-3.png",
  },
  {
    id: "shipment-5",
    shipmentId: "123456",
    pickListId: "123456",
    store: "Walmart Marketplace",
    storeIcon: "/figmaAssets/integrations-4.png",
    totalValue: "$1,234.50",
    weight: "210",
    customer: "John Doe",
    carrier: "UPS Express",
    carrierIcon: "/figmaAssets/pngegg--2--1-4.png",
  },
  {
    id: "shipment-6",
    shipmentId: "123456",
    pickListId: "123456",
    store: "Walmart Marketplace",
    storeIcon: "/figmaAssets/integrations-5.png",
    totalValue: "$1,234.50",
    weight: "210",
    customer: "John Doe",
    carrier: "UPS Express",
    carrierIcon: "/figmaAssets/pngegg--2--1-5.png",
  },
  {
    id: "shipment-7",
    shipmentId: "123456",
    pickListId: "123456",
    store: "Walmart Marketplace",
    storeIcon: "/figmaAssets/integrations-6.png",
    totalValue: "$1,234.50",
    weight: "210",
    customer: "John Doe",
    carrier: "UPS Express",
    carrierIcon: "/figmaAssets/pngegg--2--1-6.png",
  },
  {
    id: "shipment-8",
    shipmentId: "123456",
    pickListId: "123456",
    store: "Walmart Marketplace",
    storeIcon: "/figmaAssets/integrations-7.png",
    totalValue: "$1,234.50",
    weight: "210",
    customer: "John Doe",
    carrier: "UPS Express",
    carrierIcon: "/figmaAssets/pngegg--2--1-7.png",
  },
  {
    id: "shipment-9",
    shipmentId: "123456",
    pickListId: "123456",
    store: "Walmart Marketplace",
    storeIcon: "/figmaAssets/integrations-8.png",
    totalValue: "$1,234.50",
    weight: "210",
    customer: "John Doe",
    carrier: "UPS Express",
    carrierIcon: "/figmaAssets/pngegg--2--1-8.png",
  },
  {
    id: "shipment-10",
    shipmentId: "123456",
    pickListId: "123456",
    store: "Walmart Marketplace",
    storeIcon: "/figmaAssets/integrations-9.png",
    totalValue: "$1,234.50",
    weight: "210",
    customer: "John Doe",
    carrier: "UPS Express",
    carrierIcon: "/figmaAssets/pngegg--2--1-9.png",
  },
];

export const PickPackDashboardSection = (): JSX.Element => {
  return (
    <section className="flex flex-1 flex-col items-start justify-center gap-2 self-stretch">
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
              <Select defaultValue="PA Fulfilment Facility">
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
                {pickPackRows.map((row) => (
                  <TableRow
                    key={row.id}
                    className="h-8 border-b border-[#e4eaed] bg-white hover:bg-white"
                  >
                    <TableCell className="h-8 px-2 py-0">
                      <button
                        type="button"
                        className="flex h-8 items-center justify-center"
                        aria-label={`Select pick list ${row.pickListId}`}
                      >
                        <img
                          className="h-6 w-6"
                          alt="Radio button"
                          src="/figmaAssets/radiobuttonuncheckedoutlined.svg"
                        />
                      </button>
                    </TableCell>
                    <TableCell className="h-8 px-2 py-0 font-data-grid-entries text-[length:var(--data-grid-entries-font-size)] font-[number:var(--data-grid-entries-font-weight)] leading-[var(--data-grid-entries-line-height)] tracking-[var(--data-grid-entries-letter-spacing)] text-grey-11 [font-style:var(--data-grid-entries-font-style)]">
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
                    <TableCell className="h-8 px-2 py-0" />
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          <footer className="flex w-full flex-wrap items-center gap-4 border-t border-[#e4eaed] bg-white px-5 py-2">
            <div className="inline-flex items-center gap-1">
              <span className="font-body text-[length:var(--body-font-size)] font-[number:var(--body-font-weight)] leading-[var(--body-line-height)] tracking-[var(--body-letter-spacing)] text-[#0b1516] [font-style:var(--body-font-style)]">
                Total Pick Lists:
              </span>
              <span className="font-subtitle-2-medium text-[length:var(--subtitle-2-medium-font-size)] font-[number:var(--subtitle-2-medium-font-weight)] leading-[var(--subtitle-2-medium-line-height)] tracking-[var(--subtitle-2-medium-letter-spacing)] text-[#0b1516] [font-style:var(--subtitle-2-medium-font-style)]">
                8
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
          </footer>
        </CardContent>
      </Card>
      <Card className="w-full overflow-hidden rounded-lg border border-[#e4eaed] bg-white shadow-none">
        <CardContent className="p-0">
          <header className="flex h-[42px] items-center border-b border-[#eff6f9] bg-white px-5 py-2">
            <h3 className="m-0 font-heading-5-medium text-[length:var(--heading-5-medium-font-size)] font-[number:var(--heading-5-medium-font-weight)] leading-[var(--heading-5-medium-line-height)] tracking-[var(--heading-5-medium-letter-spacing)] text-[#0b1516] [font-style:var(--heading-5-medium-font-style)]">
              Shipments
            </h3>
          </header>
          <div className="w-full overflow-x-auto">
            <Table className="w-full min-w-[1100px]">
              <TableHeader>
                <TableRow className="border-b border-[#e4eaed] bg-[#f6f9fb] hover:bg-[#f6f9fb]">
                  <TableHead className="h-8 w-[60px] px-2" />
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
                {shipmentRows.map((row) => (
                  <TableRow
                    key={row.id}
                    className="h-8 border-b border-[#e4eaed] bg-white hover:bg-white"
                  >
                    <TableCell className="h-8 px-2 py-0">
                      <div className="flex h-8 items-center justify-center">
                        <Checkbox
                          className="h-5 w-5 rounded-[4px] border-[#45565b] data-[state=checked]:border-[#45565b] data-[state=checked]:bg-white data-[state=checked]:text-[#45565b]"
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
                ))}
              </TableBody>
            </Table>
          </div>
          <footer className="flex w-full flex-wrap items-center gap-4 border-t border-[#e4eaed] bg-white px-5 py-2">
            <div className="inline-flex items-center gap-1">
              <span className="font-body text-[length:var(--body-font-size)] font-[number:var(--body-font-weight)] leading-[var(--body-line-height)] tracking-[var(--body-letter-spacing)] text-[#0b1516] [font-style:var(--body-font-style)]">
                Total Shipments:
              </span>
              <span className="font-subtitle-2-medium text-[length:var(--subtitle-2-medium-font-size)] font-[number:var(--subtitle-2-medium-font-weight)] leading-[var(--subtitle-2-medium-line-height)] tracking-[var(--subtitle-2-medium-letter-spacing)] text-[#0b1516] [font-style:var(--subtitle-2-medium-font-style)]">
                240
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
          </footer>
        </CardContent>
      </Card>
    </section>
  );
};
