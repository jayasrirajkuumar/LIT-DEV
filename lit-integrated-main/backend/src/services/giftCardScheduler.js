import config from "../config/env.js";
import { logger } from "../utils/logger.js";

const INTERVAL_MS = 60 * 1000;

export function startGiftCardScheduler() {
  if (!config.isProduction) {
    logger.info("Gift card scheduler disabled in development");
    return () => {};
  }

  let running = false;

  const tick = async () => {
    if (running) return;
    running = true;
    try {
      const { processScheduledGiftCards } = await import("./giftCardService.js");
      const { runGiftCardMaintenance } = await import("./adminGiftCardService.js");
      const scheduled = await processScheduledGiftCards();
      const maintenance = await runGiftCardMaintenance();
      if (scheduled.processed > 0 || maintenance.expired > 0) {
        logger.info("Gift card scheduler tick", { scheduled, maintenance });
      }
    } catch (error) {
      logger.error("Gift card scheduler error", { message: error.message });
    } finally {
      running = false;
    }
  };

  const intervalId = setInterval(tick, INTERVAL_MS);
  setTimeout(tick, 15_000);
  logger.info("Gift card scheduler started");
  return () => clearInterval(intervalId);
}


export default { startGiftCardScheduler };

