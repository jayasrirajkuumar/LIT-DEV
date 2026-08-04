import { AppError } from "../utils/AppError.js";
import { userRepository } from "../repositories/userRepository.js";
import { logger } from "../utils/logger.js";

export async function getProfileForUser(userId) {
  const user = await userRepository.findById(userId);

  if (!user) {
    throw new AppError("User not found.", 404, "USER_NOT_FOUND");
  }

  if (!user.isActive) {
    throw new AppError("User account is inactive.", 403, "USER_INACTIVE");
  }

  return userRepository.toPublicUser(user);
}

export async function updateProfileForUser(userId, data) {
  const user = await userRepository.findById(userId);

  if (!user) {
    throw new AppError("User not found.", 404, "USER_NOT_FOUND");
  }

  if (!user.isActive) {
    throw new AppError("User account is inactive.", 403, "USER_INACTIVE");
  }

  return userRepository.updateProfile(userId, {
    displayName: data.displayName,
    phoneNumber: data.phoneNumber,
    profilePicture: data.profilePicture,
  }).then((user) => {
    logger.debug("Database update: users profile", { userId, displayName: user.displayName });
    return user;
  });
}

export default {
  getProfileForUser,
  updateProfileForUser,
};
