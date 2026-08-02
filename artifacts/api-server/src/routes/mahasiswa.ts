import { Router, type IRouter } from "express";
import { eq, ilike, sql, desc } from "drizzle-orm";
import { db, mahasiswaTable } from "@workspace/db";
import { requireAdmin } from "../middlewares/requireAdmin";
import {
  CreateMahasiswaBody,
  createMahasiswaBodyEmailRegExp,
  GetMahasiswaParams,
  UpdateMahasiswaParams,
  UpdateMahasiswaBody,
  updateMahasiswaBodyEmailRegExp,
  DeleteMahasiswaParams,
  ListMahasiswaQueryParams,
  GetMahasiswaTranskripParams,
} from "@workspace/api-zod";
import { nilaiTable, mataKuliahTable } from "@workspace/db";

const router: IRouter = Router();

router.use(requireAdmin);

const GRADE_POINTS: Record<string, number> = {
  A: 4.0,
  "B+": 3.5,
  B: 3.0,
  "C+": 2.5,
  C: 2.0,
  D: 1.0,
  E: 0.0,
};

// GET /mahasiswa
router.get("/", async (req, res): Promise<void> => {
  const parsed = ListMahasiswaQueryParams.safeParse(req.query);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const { limit = 20, offset = 0, search } = parsed.data;

  let query = db
    .select()
    .from(mahasiswaTable)
    .orderBy(desc(mahasiswaTable.createdAt))
    .limit(limit)
    .offset(offset);

  let countQuery = db
    .select({ count: sql<number>`count(*)::int` })
    .from(mahasiswaTable);

  if (search) {
    const pattern = `%${search}%`;
    const filter = sql`(${mahasiswaTable.nama} ilike ${pattern} or ${mahasiswaTable.nim} ilike ${pattern} or ${mahasiswaTable.jurusan} ilike ${pattern})`;
    query = query.where(filter) as typeof query;
    countQuery = countQuery.where(filter) as typeof countQuery;
  }

  const [rows, [{ count }]] = await Promise.all([query, countQuery]);

  res.json({ data: rows, total: count });
});

// POST /mahasiswa
router.post("/", async (req, res): Promise<void> => {
  const parsed = CreateMahasiswaBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  //const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!createMahasiswaBodyEmailRegExp.test((parsed.data.email))) {
    res.status(400).json({ error: "Format email tidak valid" });
    return;
  }

  const [row] = await db.insert(mahasiswaTable).values(parsed.data).returning();
  res.status(201).json(row);
});

// GET /mahasiswa/:id/transkrip — must be before /:id
router.get("/:id/transkrip", async (req, res): Promise<void> => {
  const params = GetMahasiswaTranskripParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const [mahasiswa] = await db
    .select()
    .from(mahasiswaTable)
    .where(eq(mahasiswaTable.id, params.data.id));

  if (!mahasiswa) {
    res.status(404).json({ error: "Mahasiswa tidak ditemukan" });
    return;
  }

  const nilaiRows = await db
    .select({
      nilaiId: nilaiTable.id,
      nilaiHuruf: nilaiTable.nilaiHuruf,
      semester: nilaiTable.semester,
      mataKuliah: mataKuliahTable,
    })
    .from(nilaiTable)
    .innerJoin(mataKuliahTable, eq(nilaiTable.mataKuliahId, mataKuliahTable.id))
    .where(eq(nilaiTable.mahasiswaId, params.data.id))
    .orderBy(nilaiTable.semester);

  const nilaiItems = nilaiRows.map((n) => ({
    nilaiId: n.nilaiId,
    mataKuliah: n.mataKuliah,
    nilaiHuruf: n.nilaiHuruf,
    semester: n.semester,
    bobotNilai: GRADE_POINTS[n.nilaiHuruf] ?? 0,
  }));

  const totalSks = nilaiItems.reduce((sum, n) => sum + n.mataKuliah.sks, 0);
  const weightedSum = nilaiItems.reduce(
    (sum, n) => sum + n.bobotNilai * n.mataKuliah.sks,
    0,
  );
  const ipk = totalSks > 0 ? Math.round((weightedSum / totalSks) * 100) / 100 : 0;

  res.json({ mahasiswa, nilai: nilaiItems, totalSks, ipk });
});

// GET /mahasiswa/:id
router.get("/:id", async (req, res): Promise<void> => {
  const params = GetMahasiswaParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const [row] = await db
    .select()
    .from(mahasiswaTable)
    .where(eq(mahasiswaTable.id, params.data.id));

  if (!row) {
    res.status(404).json({ error: "Mahasiswa tidak ditemukan" });
    return;
  }

  res.json(row);
});

// PUT /mahasiswa/:id
router.put("/:id", async (req, res): Promise<void> => {
  const params = UpdateMahasiswaParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const parsed = UpdateMahasiswaBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  // const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!updateMahasiswaBodyEmailRegExp.test(parsed.data.email)) {
    res.status(400).json({ error: "Format email tidak valid" });
    return;
  }

  const [row] = await db
    .update(mahasiswaTable)
    .set({ ...parsed.data, updatedAt: new Date() })
    .where(eq(mahasiswaTable.id, params.data.id))
    .returning();

  if (!row) {
    res.status(404).json({ error: "Mahasiswa tidak ditemukan" });
    return;
  }

  res.json(row);
});

// DELETE /mahasiswa/:id
router.delete("/:id", async (req, res): Promise<void> => {
  const params = DeleteMahasiswaParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const [row] = await db
    .delete(mahasiswaTable)
    .where(eq(mahasiswaTable.id, params.data.id))
    .returning();

  if (!row) {
    res.status(404).json({ error: "Mahasiswa tidak ditemukan" });
    return;
  }

  res.sendStatus(204);
});

export default router;
