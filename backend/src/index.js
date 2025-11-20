import express from "express";
import { ENV } from "./config/env.js";
import healthRoutes from "./routes/healthRoutes.js";
import webhookRoutes from "./routes/webhookRoutes.js";
import widgetRoutes from "./routes/widgetRoutes.js";
import { log } from "./utils/logger.js";

const app = express();

app.use(express.json());

// Routes
app.use("/health", healthRoutes);
app.use("/api/cliq", webhookRoutes);
app.use("/api/widget", widgetRoutes);

// Root
app.get("/", (_req, res) => {
  res.send("Team Cognitive Load Monitor backend is running.");
});

app.listen(ENV.PORT, () => {
  log(`Backend running on port ${ENV.PORT}`);
});
