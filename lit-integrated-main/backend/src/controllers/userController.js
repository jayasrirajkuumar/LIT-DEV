import { getProfileForUser, updateProfileForUser } from "../services/profileService.js";
import { AppError } from "../utils/AppError.js";

export async function getMyProfile(req, res) {
  const profile = await getProfileForUser(req.dbUser.id);

  res.json({
    success: true,
    data: { user: profile },
  });
}

export async function updateMyProfile(req, res) {
  if ("email" in (req.body ?? {})) {
    throw new AppError("Email cannot be modified.", 400, "EMAIL_READ_ONLY");
  }

  const profile = await updateProfileForUser(req.dbUser.id, req.validatedBody);

  res.json({
    success: true,
    data: { user: profile },
  });
}

export default {
  getMyProfile,
  updateMyProfile,
};
