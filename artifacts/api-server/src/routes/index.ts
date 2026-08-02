import { Router, type IRouter } from "express";
import healthRouter from "./health";
import mahasiswaRouter from "./mahasiswa";
import mataKuliahRouter from "./mata_kuliah";
import nilaiRouter from "./nilai";
import dashboardRouter from "./dashboard";
import adminRouter from "./admin"

const router: IRouter = Router();

router.use("/health", healthRouter);
router.use("/mahasiswa", mahasiswaRouter);
router.use("/mata-kuliah", mataKuliahRouter);
router.use("/nilai", nilaiRouter);
router.use("/dashboard", dashboardRouter);
router.use("/admin", adminRouter);

export default router;
