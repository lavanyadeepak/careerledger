import { Router } from "express";
import { authenticate } from "../middleware/auth";
import * as dashboardController from "../controllers/dashboardController";

const router = Router();

router.use(authenticate);

router.get("/stats", dashboardController.getStats);
router.get("/charts/applications-by-month", dashboardController.getApplicationsByMonth);
router.get("/charts/company-wise", dashboardController.getCompanyWise);
router.get("/charts/status-distribution", dashboardController.getStatusDistribution);
router.get("/followups", dashboardController.getDashboardFollowups);

export default router;