import axios from "axios";
import { logError } from "../utils/logger.js";

// Stub functions – implement real Zoho Cliq API calls if needed
export async function postMessageToWebhook(url, payload) {
  try {
    const res = await axios.post(url, payload);
    return res.data;
  } catch (err) {
    logError("Error posting to Cliq webhook:", err.message);
    return null;
  }
}
