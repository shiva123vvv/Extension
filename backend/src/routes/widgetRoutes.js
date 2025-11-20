import { Router } from "express";
import { getTeamSummaryWidget } from "../controllers/widgetController.js";

const router = Router();

router.get("/team-summary", getTeamSummaryWidget);

export default router;
