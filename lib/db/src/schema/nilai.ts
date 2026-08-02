import { pgTable, bigserial, bigint, varchar, timestamp, unique } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { mahasiswaTable } from "./mahasiswa";
import { mataKuliahTable } from "./mata_kuliah";

export const nilaiTable = pgTable(
  "nilai",
  {
    id: bigserial("id", { mode: "number" }).primaryKey(),
    mahasiswaId: bigint("mahasiswa_id", { mode: "number" })
      .notNull()
      .references(() => mahasiswaTable.id, { onDelete: "cascade" }),
    mataKuliahId: bigint("mata_kuliah_id", { mode: "number" })
      .notNull()
      .references(() => mataKuliahTable.id, { onDelete: "cascade" }),
    nilaiHuruf: varchar("nilai_huruf", { length: 2 }).notNull(),
    semester: varchar("semester", { length: 50 }).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [unique().on(t.mahasiswaId, t.mataKuliahId, t.semester)],
);

export const insertNilaiSchema = createInsertSchema(nilaiTable).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertNilai = z.infer<typeof insertNilaiSchema>;
export type Nilai = typeof nilaiTable.$inferSelect;
