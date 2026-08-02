import { Router, type IRouter } from "express";
import { sql, desc } from "drizzle-orm";
import { requireAdmin } from "../middlewares/requireAdmin";
import { db, mahasiswaTable, mataKuliahTable, nilaiTable } from "@workspace/db";

const router: IRouter = Router();

router.use(requireAdmin);

// GET /dashboard/stats
router.get("/stats", async (_req, res): Promise<void> => {
  const [
    [{ totalMahasiswa }],
    [{ totalMataKuliah }],
    [{ totalNilai }],
    distribusiRaw,
    mahasiswaTerbaru,
  ] = await Promise.all([
    db.select({ totalMahasiswa: sql<number>`count(*)::int` }).from(mahasiswaTable),
    db.select({ totalMataKuliah: sql<number>`count(*)::int` }).from(mataKuliahTable),
    db.select({ totalNilai: sql<number>`count(*)::int` }).from(nilaiTable),
    db
      .select({
        nilaiHuruf: nilaiTable.nilaiHuruf,
        jumlah: sql<number>`count(*)::int`,
      })
      .from(nilaiTable)
      .groupBy(nilaiTable.nilaiHuruf)
      .orderBy(nilaiTable.nilaiHuruf),
    db
      .select()
      .from(mahasiswaTable)
      .orderBy(desc(mahasiswaTable.createdAt))
      .limit(5),
  ]);

  res.json({
    totalMahasiswa,
    totalMataKuliah,
    totalNilai,
    distribusiNilai: distribusiRaw,
    mahasiswaTerbaru,
  });
});

export default router;
