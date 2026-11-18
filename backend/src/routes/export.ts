import { Router } from "express";
import { authenticate } from "../middleware/auth";
import * as exportController from "../controllers/exportController";

const router = Router();

router.use(authenticate);

router.get("/excel", exportController.exportExcel);
router.get("/csv", exportController.exportCsv);

export default router;