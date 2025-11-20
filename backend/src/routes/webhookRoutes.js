import { Router } from "express";
import {
  handleWebhook,
  handleTeamHealthCommand,
  handleMyLoadCommand
} from "../controllers/webhookController.js";

const router = Router();

router.post("/webhook", handleWebhook);
router.post("/command/teamhealth", handleTeamHealthCommand);
router.post("/command/mystress", handleMyLoadCommand);

export default router;
