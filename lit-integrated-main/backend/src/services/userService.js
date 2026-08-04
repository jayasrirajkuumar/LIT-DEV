import { AppError } from "../utils/AppError.js";
import { userRepository } from "../repositories/userRepository.js";
import { logger } from "../utils/logger.js";

/**
 * Just-In-Time user provisioning from Azure External ID claims.
 */
export async function provisionUserFromClaims(claims) {
  const now = new Date();

  logger.debug("Database lookup for Azure user", { azureUserId: claims.azureUserId });

  const existingUser = await userRepository.findByAzureUserId(claims.azureUserId);

  if (existingUser) {
    if (!existingUser.isActive) {
      throw new AppError("User account is inactive.", 403, "USER_INACTIVE");
    }

    logger.debug("Updating existing user", { userId: existingUser.id });

    const user = await userRepository.updateExistingUser(existingUser, {
      lastLogin: now,
      displayName: claims.displayName,
      email: claims.email,
      profilePicture: claims.profilePicture,
    });

    logger.info("Existing user synced", { userId: user.id, azureUserId: user.azureUserId });
    return { user, isNewUser: false };
  }

  const emailOwner = await userRepository.findByEmail(claims.email);
  if (emailOwner && emailOwner.azureUserId !== claims.azureUserId) {
    throw new AppError(
      "Email is already associated with another account.",
      409,
      "EMAIL_ALREADY_EXISTS",
    );
  }

  logger.debug("Creating new user", {
    azureUserId: claims.azureUserId,
    email: claims.email,
  });

  const user = await userRepository.createUser({
    azureUserId: claims.azureUserId,
    email: claims.email,
    displayName: claims.displayName,
    profilePicture: claims.profilePicture,
    lastLogin: now,
  });

  logger.info("New user provisioned", { userId: user.id, azureUserId: user.azureUserId });
  return { user, isNewUser: true };
}

export default {
  provisionUserFromClaims,
};
