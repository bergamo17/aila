import { Router, type IRouter } from "express";
import { eq, sql, desc } from "drizzle-orm";
import { db, mataKuliahTable } from "@workspace/db";
import { requireAdmin } from "../middlewares/requireAdmin";
import {
  CreateMataKuliahBody,
  GetMataKuliahParams,
  UpdateMataKuliahParams,
  UpdateMataKuliahBody,
  DeleteMataKuliahParams,
  ListMataKuliahQueryParams,
} from "@workspace/api-zod";

const router: IRouter = Router();

router.use(requireAdmin);

// GET /mata-kuliah
router.get("/", async (req, res): Promise<void> => {
  const parsed = ListMataKuliahQueryParams.safeParse(req.query);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const { limit = 20, offset = 0 } = parsed.data;

  const [rows, [{ count }]] = await Promise.all([
    db
      .select()
      .from(mataKuliahTable)
      .orderBy(desc(mataKuliahTable.createdAt))
      .limit(limit)
      .offset(offset),
    db.select({ count: sql<number>`count(*)::int` }).from(mataKuliahTable),
  ]);

  res.json({ data: rows, total: count });
});

// POST /mata-kuliah
router.post("/", async (req, res): Promise<void> => {
  const parsed = CreateMataKuliahBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const [row] = await db.insert(mataKuliahTable).values(parsed.data).returning();
  res.status(201).json(row);
});

// GET /mata-kuliah/:id
router.get("/:id", async (req, res): Promise<void> => {
  const params = GetMataKuliahParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const [row] = await db
    .select()
    .from(mataKuliahTable)
    .where(eq(mataKuliahTable.id, params.data.id));

  if (!row) {
    res.status(404).json({ error: "Mata kuliah tidak ditemukan" });
    return;
  }

  res.json(row);
});

// PUT /mata-kuliah/:id
router.put("/:id", async (req, res): Promise<void> => {
  const params = UpdateMataKuliahParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const parsed = UpdateMataKuliahBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const [row] = await db
    .update(mataKuliahTable)
    .set(parsed.data)
    .where(eq(mataKuliahTable.id, params.data.id))
    .returning();

  if (!row) {
    res.status(404).json({ error: "Mata kuliah tidak ditemukan" });
    return;
  }

  res.json(row);
});

// DELETE /mata-kuliah/:id
router.delete("/:id", async (req, res): Promise<void> => {
  const params = DeleteMataKuliahParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const [row] = await db
    .delete(mataKuliahTable)
    .where(eq(mataKuliahTable.id, params.data.id))
    .returning();

  if (!row) {
    res.status(404).json({ error: "Mata kuliah tidak ditemukan" });
    return;
  }

  res.sendStatus(204);
});

export default router;
