import { pgTable, bigserial, varchar, integer, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const mahasiswaTable = pgTable("mahasiswa", {
  id: bigserial("id", { mode: "number" }).primaryKey(),
  nim: varchar("nim", { length: 20 }).unique().notNull(),
  nama: varchar("nama", { length: 255 }).notNull(),
  jurusan: varchar("jurusan", { length: 100 }).notNull(),
  angkatan: integer("angkatan").notNull(),
  email: varchar("email", { length: 255 }),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export const insertMahasiswaSchema = createInsertSchema(mahasiswaTable).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertMahasiswa = z.infer<typeof insertMahasiswaSchema>;
export type Mahasiswa = typeof mahasiswaTable.$inferSelect;
