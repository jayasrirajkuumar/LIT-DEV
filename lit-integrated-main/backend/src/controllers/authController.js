import { syncUserFromAzureToken } from "../services/authService.js";
import { AppError } from "../utils/AppError.js";
import { logger } from "../utils/logger.js";

function resolveIdToken(req) {
  const bearer = req.headers.authorization?.startsWith("Bearer ")
    ? req.headers.authorization.slice("Bearer ".length).trim()
    : null;

  const bodyToken = req.validatedBody?.idToken;
  const token = bearer || bodyToken;

  if (!token) {
    throw new AppError(
      "Provide an Azure ID token via Authorization: Bearer <token> or request body idToken.",
      401,
      "TOKEN_MISSING",
    );
  }

  return token;
}

export async function syncUser(req, res) {
  logger.debug("POST /auth/sync-user received", {
    hasAuthorizationHeader: Boolean(req.headers.authorization),
  });

  const idToken = resolveIdToken(req);

  logger.debug("Azure token received for sync", { tokenLength: idToken.length });

  const result = await syncUserFromAzureToken(idToken);

  logger.debug("Sending sync-user response", {
    userId: result.user.id,
    isNewUser: result.isNewUser,
  });

  res.status(result.isNewUser ? 201 : 200).json({
    success: true,
    data: {
      user: result.user,
      isNewUser: result.isNewUser,
      provisionedAt: result.provisionedAt,
    },
  });
}

export default {
  syncUser,
};
