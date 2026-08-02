import { Router, type IRouter } from "express";
import { eq, ilike, sql, desc } from "drizzle-orm";
import { db, adminTable } from "@workspace/db";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { requireAdmin } from "../middlewares/requireAdmin";
import { 
    RegisterAdminBody,
    registerAdminBodyEmailRegExp,
    registerAdminBodyPasswordMin,
    RegisterAdminResponse,
    loginAdminBodyEmailRegExp,
    loginAdminBodyPasswordMin,
    LoginAdminBody,
    LoginAdminResponse,
    LogoutAdminResponse,
    GetAdminMeResponse,
 } from "@workspace/api-zod";

const router: IRouter = Router();

const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
    throw new Error("JWT_SECRET belum di-set di environment");
}

const COOKIE_OPTIONS = {
    httpOnly: true,
    secure: true,
    sameSite: "lax" as const,
    maxAge: 7 * 24 * 60 * 60 * 1000,
};

// POST /admin/register
router.post("/register", async (req, res): Promise<void> => {
    const parsed = RegisterAdminBody.safeParse(req.body);
    if (!parsed.success) {
        res.status(400).json({error: parsed.error.message});
        return;
    }

    // const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!registerAdminBodyEmailRegExp.test(parsed.data.email)) {
        res.status(400).json({ error: "Format email tidak valid" });
        return;
    }

    const { email, password, nama } = parsed.data;

    const [existing] = await db.select().from(adminTable).where(eq(adminTable.email, email));

    if (existing) {
        res.status(409).json({error: "Email sudah terdaftar"});
        return;
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const [admin] = await db.insert(adminTable).values({email, passwordHash, nama}).returning();

    const token = jwt.sign({sub: admin.id, role: "admin"}, JWT_SECRET, {expiresIn: "7d"});
    res.cookie("token", token, COOKIE_OPTIONS);

    const response = RegisterAdminResponse.parse({id: admin.id, email: admin.email, nama: admin.nama});
    res.status(201).json(response);
});

// POST /admin/login
router.post("/login", async (req, res): Promise<void> => {
    const parsed = LoginAdminBody.safeParse(req.body);
    if (!parsed.success) {
        res.status(400).json({error: parsed.error.message});
        return;
    }

    // const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!loginAdminBodyEmailRegExp.test(parsed.data.email)) {
        res.status(400).json({ error: "Format email tidak valid" });
        return;
    }

    const { email, password } = parsed.data;

    const [admin] = await db.select().from(adminTable).where(eq(adminTable.email, email));

    if (!admin || !(await bcrypt.compare(password, admin.passwordHash))) {
        res.status(401).json({error: "Email atau password salah"});
        return;
    }

    const token = jwt.sign({sub: admin.id, role: "admin"}, JWT_SECRET, {expiresIn: "7d"});
    res.cookie("token", token, COOKIE_OPTIONS);
    
    const response = LoginAdminResponse.parse({id: admin.id, email: admin.email, nama: admin.nama});
    res.status(200).json(response);
});

// POST /admin/logout
router.post("/logout", (_req, res): void => {
    res.clearCookie("token");

    const response = LogoutAdminResponse.parse({ok: true});
    res.json(response);
});

// GET /admin/me
router.get("/me", requireAdmin,  async (req, res): Promise<void> => {
    const [admin] = await db.select().from(adminTable).where(eq(adminTable.id, req.user!.sub));

    if (!admin) {
        res.status(401).json({error: "Unauthorized"});
        return;
    }

    const response = GetAdminMeResponse.parse({id: admin.id, email: admin.email, nama: admin.nama});
    res.json(response)
});

export default router;