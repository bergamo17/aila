import { pgTable, bigserial, varchar, integer, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const mataKuliahTable = pgTable("mata_kuliah", {
  id: bigserial("id", { mode: "number" }).primaryKey(),
  kodeMk: varchar("kode_mk", { length: 20 }).unique().notNull(),
  namaMk: varchar("nama_mk", { length: 255 }).notNull(),
  sks: integer("sks").notNull(),
  dosenPengampu: varchar("dosen_pengampu", { length: 255 }),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const insertMataKuliahSchema = createInsertSchema(mataKuliahTable).omit({
  id: true,
  createdAt: true,
});

export type InsertMataKuliah = z.infer<typeof insertMataKuliahSchema>;
export type MataKuliah = typeof mataKuliahTable.$inferSelect;
