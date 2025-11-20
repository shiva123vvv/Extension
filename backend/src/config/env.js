import dotenv from "dotenv";

dotenv.config();

export const ENV = {
  PORT: process.env.PORT || 5000,
  NODE_ENV: process.env.NODE_ENV || "development",
  BACKEND_BASE_URL: process.env.BACKEND_BASE_URL || "http://localhost:5000",
  // For future: CLiq OAuth tokens etc
  ZOHO_CLIQ_BOT_NAME: process.env.ZOHO_CLIQ_BOT_NAME || "TeamLoadBot"
};
