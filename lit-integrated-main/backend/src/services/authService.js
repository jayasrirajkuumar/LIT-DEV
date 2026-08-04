import { validateAzureIdToken } from "../config/azureAuth.js";
import { provisionUserFromClaims } from "./userService.js";
import { issueWelcomeCoupon } from "./couponService.js";
import { adminNotificationService } from "./adminNotificationService.js";
import { ensureWallet } from "./walletService.js";
import { logger } from "../utils/logger.js";

export async function syncUserFromAzureToken(idToken) {
  logger.debug("Validating Azure ID token", { tokenLength: idToken?.length ?? 0 });

  const claims = await validateAzureIdToken(idToken);

  logger.debug("Azure token validated", {
    azureUserId: claims.azureUserId,
    email: claims.email,
    displayName: claims.displayName,
    hasProfilePicture: Boolean(claims.profilePicture),
  });

  const { user, isNewUser } = await provisionUserFromClaims(claims);

  try {
    await ensureWallet(user.id);
  } catch (err) {
    logger.warn("Wallet provisioning skipped", { userId: user.id, message: err.message });
  }

  if (isNewUser) {
    try {
      await issueWelcomeCoupon(user.id);
      await adminNotificationService.notifyNewCustomer({
        userId: user.id,
        email: user.email,
        displayName: user.displayName,
      });
    } catch (err) {
      logger.warn("Welcome coupon or customer notification skipped", { message: err.message });
    }
  }

  logger.info("User sync completed", {
    userId: user.id,
    azureUserId: user.azureUserId,
    isNewUser,
  });

  return {
    user,
    isNewUser,
    provisionedAt: new Date().toISOString(),
  };
}

export default {
  syncUserFromAzureToken,
};
