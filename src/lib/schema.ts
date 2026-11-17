import { relations } from "drizzle-orm";
import {
  boolean,
  doublePrecision,
  index,
  integer,
  pgEnum,
  pgTable,
  text,
  timestamp,
} from "drizzle-orm/pg-core";

export const roleEnum = pgEnum("role", ["ADMIN", "MERCHANT", "DRIVER"]);

export const deliveryStatusEnum = pgEnum("delivery_status", [
  "WAITING_LOCATION", // course créée, on attend la position du client
  "READY", // position reçue, prix calculé, en attente d'un livreur
  "ASSIGNED", // livreur désigné
  "PICKED_UP", // colis récupéré chez le commerçant
  "DELIVERED", // livré
  "FAILED", // échec (client absent, refus...)
  "CANCELLED", // annulée
]);

export type Role = (typeof roleEnum.enumValues)[number];
export type DeliveryStatus = (typeof deliveryStatusEnum.enumValues)[number];

const id = () =>
  text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID());

export const users = pgTable("users", {
  id: id(),
  name: text("name").notNull(),
  phone: text("phone").notNull().unique(), // format 2376XXXXXXXX
  passwordHash: text("password_hash").notNull(),
  role: roleEnum("role").notNull(),
  active: boolean("active").notNull().default(true),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),

  // Champs commerçant
  shopName: text("shop_name"),
  pickupLandmark: text("pickup_landmark"),
  pickupLat: doublePrecision("pickup_lat"),
  pickupLng: doublePrecision("pickup_lng"),
});

export const deliveries = pgTable(
  "deliveries",
  {
    id: id(),
    code: text("code").notNull().unique(), // code court lisible, ex. NG-4K7P

    merchantId: text("merchant_id")
      .notNull()
      .references(() => users.id),
    driverId: text("driver_id").references(() => users.id),

    customerName: text("customer_name").notNull(),
    customerPhone: text("customer_phone").notNull(),
    packageDesc: text("package_desc").notNull(),
    amountToCollect: integer("amount_to_collect").notNull().default(0), // FCFA
    heavy: boolean("heavy").notNull().default(false),
    night: boolean("night").notNull().default(false),

    locationToken: text("location_token").notNull().unique(),
    dropLat: doublePrecision("drop_lat"),
    dropLng: doublePrecision("drop_lng"),
    dropAccuracy: doublePrecision("drop_accuracy"),
    dropLandmark: text("drop_landmark"),

    distanceKm: doublePrecision("distance_km"),
    price: integer("price"), // FCFA, calculé selon la distance

    status: deliveryStatusEnum("status").notNull().default("WAITING_LOCATION"),
    failReason: text("fail_reason"),
    settled: boolean("settled").notNull().default(false), // reversé au commerçant

    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    locatedAt: timestamp("located_at", { withTimezone: true }),
    assignedAt: timestamp("assigned_at", { withTimezone: true }),
    pickedUpAt: timestamp("picked_up_at", { withTimezone: true }),
    deliveredAt: timestamp("delivered_at", { withTimezone: true }),
    settledAt: timestamp("settled_at", { withTimezone: true }),
  },
  (t) => [
    index("deliveries_merchant_idx").on(t.merchantId, t.createdAt),
    index("deliveries_driver_idx").on(t.driverId, t.status),
    index("deliveries_status_idx").on(t.status),
  ],
);

export const usersRelations = relations(users, ({ many }) => ({
  merchantDeliveries: many(deliveries, { relationName: "merchant" }),
  driverDeliveries: many(deliveries, { relationName: "driver" }),
}));

export const deliveriesRelations = relations(deliveries, ({ one }) => ({
  merchant: one(users, { fields: [deliveries.merchantId], references: [users.id], relationName: "merchant" }),
  driver: one(users, { fields: [deliveries.driverId], references: [users.id], relationName: "driver" }),
}));

export type User = typeof users.$inferSelect;
export type Delivery = typeof deliveries.$inferSelect;
