import { pgTable, uuid, varchar, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const adminTable = pgTable("admin", {
    id: uuid("id").defaultRandom().primaryKey(),
    email: varchar("email", { length: 255 }).notNull().unique(),
    passwordHash: varchar("password_hash", { length: 255 }).notNull(),
    nama: varchar("nama", { length: 255 }).notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertAdminSchema = createInsertSchema(adminTable).omit({
    id: true,
    createdAt: true,
    updatedAt: true,
});

export type InsertAdmin = z.infer<typeof insertAdminSchema>;
export type Admin = typeof adminTable.$inferSelect;