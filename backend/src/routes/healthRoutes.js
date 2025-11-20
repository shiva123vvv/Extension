import { Router } from "express";

const router = Router();

router.get("/", (_req, res) => {
  res.json({ ok: true, service: "Team Cognitive Load Monitor" });
});

export default router;
