import { Router, type IRouter } from "express";
import { eq, sql, desc } from "drizzle-orm";
import { db, nilaiTable, mahasiswaTable, mataKuliahTable } from "@workspace/db";
import { requireAdmin } from "../middlewares/requireAdmin";
import {
  CreateNilaiBody,
  UpdateNilaiParams,
  UpdateNilaiBody,
  DeleteNilaiParams,
  ListNilaiQueryParams,
} from "@workspace/api-zod";

const router: IRouter = Router();

router.use(requireAdmin);

async function buildNilaiDetail(nilaiRow: typeof nilaiTable.$inferSelect) {
  const [mahasiswa] = await db
    .select()
    .from(mahasiswaTable)
    .where(eq(mahasiswaTable.id, nilaiRow.mahasiswaId));
  const [mataKuliah] = await db
    .select()
    .from(mataKuliahTable)
    .where(eq(mataKuliahTable.id, nilaiRow.mataKuliahId));
  return { ...nilaiRow, mahasiswa, mataKuliah };
}

// GET /nilai
router.get("/", async (req, res): Promise<void> => {
  const parsed = ListNilaiQueryParams.safeParse(req.query);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const { mahasiswa_id, limit = 50, offset = 0 } = parsed.data;

  const baseQuery = db
    .select({
      id: nilaiTable.id,
      mahasiswaId: nilaiTable.mahasiswaId,
      mataKuliahId: nilaiTable.mataKuliahId,
      nilaiHuruf: nilaiTable.nilaiHuruf,
      semester: nilaiTable.semester,
      createdAt: nilaiTable.createdAt,
      updatedAt: nilaiTable.updatedAt,
      mahasiswa: mahasiswaTable,
      mataKuliah: mataKuliahTable,
    })
    .from(nilaiTable)
    .innerJoin(mahasiswaTable, eq(nilaiTable.mahasiswaId, mahasiswaTable.id))
    .innerJoin(mataKuliahTable, eq(nilaiTable.mataKuliahId, mataKuliahTable.id))
    .orderBy(desc(nilaiTable.createdAt))
    .limit(limit)
    .offset(offset);

  let countQuery = db
    .select({ count: sql<number>`count(*)::int` })
    .from(nilaiTable);

  const rows = mahasiswa_id
    ? await baseQuery.where(eq(nilaiTable.mahasiswaId, mahasiswa_id))
    : await baseQuery;

  const [{ count }] = mahasiswa_id
    ? await countQuery.where(eq(nilaiTable.mahasiswaId, mahasiswa_id))
    : await countQuery;

  res.json({ data: rows, total: count });
});

// POST /nilai
router.post("/", async (req, res): Promise<void> => {
  const parsed = CreateNilaiBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  // Verify mahasiswa and mata kuliah exist
  const [mahasiswa] = await db
    .select()
    .from(mahasiswaTable)
    .where(eq(mahasiswaTable.id, parsed.data.mahasiswaId));
  if (!mahasiswa) {
    res.status(404).json({ error: "Mahasiswa tidak ditemukan" });
    return;
  }

  const [mataKuliah] = await db
    .select()
    .from(mataKuliahTable)
    .where(eq(mataKuliahTable.id, parsed.data.mataKuliahId));
  if (!mataKuliah) {
    res.status(404).json({ error: "Mata kuliah tidak ditemukan" });
    return;
  }

  const [row] = await db.insert(nilaiTable).values(parsed.data).returning();
  res.status(201).json({ ...row, mahasiswa, mataKuliah });
});

// PUT /nilai/:id
router.put("/:id", async (req, res): Promise<void> => {
  const params = UpdateNilaiParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const parsed = UpdateNilaiBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const [row] = await db
    .update(nilaiTable)
    .set({ ...parsed.data, updatedAt: new Date() })
    .where(eq(nilaiTable.id, params.data.id))
    .returning();

  if (!row) {
    res.status(404).json({ error: "Nilai tidak ditemukan" });
    return;
  }

  const detail = await buildNilaiDetail(row);
  res.json(detail);
});

// DELETE /nilai/:id
router.delete("/:id", async (req, res): Promise<void> => {
  const params = DeleteNilaiParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const [row] = await db
    .delete(nilaiTable)
    .where(eq(nilaiTable.id, params.data.id))
    .returning();

  if (!row) {
    res.status(404).json({ error: "Nilai tidak ditemukan" });
    return;
  }

  res.sendStatus(204);
});

export default router;
