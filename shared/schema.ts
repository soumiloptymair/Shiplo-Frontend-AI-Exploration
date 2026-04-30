import { sql } from "drizzle-orm";
import { pgTable, text, varchar } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

// ----- Shipments domain (frontend-only mock data for now) -----

export const SHIPMENT_STATUSES = [
  "Shipped",
  "Pending",
  "Label Created",
  "Delayed",
  "Delivered",
  "On Hold",
  "Needs Review",
  "Cancelled",
] as const;
export type ShipmentStatus = (typeof SHIPMENT_STATUSES)[number];

export const FREIGHT_TYPES = [
  "Parcel",
  "LTL",
  "Truckload",
  "Partial",
] as const;
export type FreightType = (typeof FREIGHT_TYPES)[number];

export const SHIPMENT_KIND = ["order", "return", "combined"] as const;
export type ShipmentKind = (typeof SHIPMENT_KIND)[number];

export interface Shipment {
  id: string;
  shipmentId: string;
  freightType: FreightType | "";
  orderRefId: string;
  orderRefKind: ShipmentKind;
  combinedCount?: number;
  status: ShipmentStatus | "";
  needsAttention?: boolean;
  createdOn: string;
  value: string;
  source: string;
  warehouse: string;
  shipping: string;
}
