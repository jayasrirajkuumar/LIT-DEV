import { getAdminConsentUrl, logAuthError } from "../config/authConfig";

const SERVER_ERROR_PATTERN =
  /user api error|internal server error|\b500\b|\b502\b|\b503\b|\b504\b|network error|failed to fetch|econnrefused|service unavailable/i;

const SAFE_PREFIXES = [
  "No account found",
  "An account already exists",
  "Your verification session expired",
  "Your OTP has expired",
  "The OTP you entered is invalid",
  "This OTP has already been used",
  "Please enter a valid email",
  "Please enter the full",
  "Please enter the verification code",
  "Verification failed",
  "Something went wrong",
  "Unable to send verification code",
  "Email OTP is not available",
  "Additional profile information is required",
  "Unable to reach the sign-in service",
  "App permission approval is required",
  "The OTP does not match",
];

function isSafeUserMessage(message) {
  if (!message || message.length > 200) return false;
  return SAFE_PREFIXES.some((prefix) => message.startsWith(prefix));
}

function extractAadMessage(description) {
  if (!description || typeof description !== "string") return null;
  const match = description.match(/AADSTS\d+:\s*([^.\r\n]+)/i);
  return match?.[1]?.trim() || null;
}

/**
 * Maps auth errors to user-friendly copy. Logs full details to the console only.
 * @param {unknown} error
 * @param {"send"|"verify"|"resend"|"auth"} step
 */
export function sanitizeAuthError(error, step = "auth", session = null) {
  const err = error instanceof Error ? error : new Error(String(error ?? "Unknown error"));
  logAuthError(`Auth error (${step})`, {
    message: err.message,
    code: err.code,
    suberror: err.suberror,
    status: err.status,
    errorCodes: err.errorCodes,
    correlationId: err.correlationId,
    traceId: err.traceId,
    stack: err.stack,
  });

  if (err.code === "user_not_found") {
    return "No account found for this email. Switch to Create Account to continue.";
  }

  if (err.code === "user_already_exists" || err.code === "user_exists") {
    return "An account already exists for this email. Switch to Sign In to continue.";
  }

  if (err.code === "missing_session" || err.code === "missing_continuation_token") {
    return "Your verification session expired. Please request a new code.";
  }

  if (err.code === "missing_otp") {
    return "Please enter the verification code from your email.";
  }

  if (err.code === "invalid_otp_length") {
    return err.message;
  }

  if (err.code === "expired_token") {
    return "Your OTP has expired. Please request a new code.";
  }

  if (
    err.code === "consent_required" ||
    err.suberror === "consent_required" ||
    err.errorCodes?.includes?.(65001) ||
    /AADSTS65001/i.test(err.message ?? "")
  ) {
    logAuthError("Admin consent required for native auth", {
      adminConsentUrl: getAdminConsentUrl(),
      clientId: err.raw?.error_description?.match(/ID '([^']+)'/)?.[1],
    });
    return "App permission approval is required for this account. An Azure administrator must grant admin consent for the LIT app API permissions, then try signing in again.";
  }

  if (err.suberror === "invalid_oob_value") {
    const target = session?.maskedTarget || session?.email;
    if (target) {
      return `The OTP does not match the latest code sent to ${target}. Click Resend OTP and use only the newest email code.`;
    }
    return "The OTP you entered is invalid. Click Resend OTP and use only the newest email code.";
  }

  if (err.code === "unsupported_challenge_type") {
    return "This account cannot sign in with email OTP. Contact support or use the web sign-in option.";
  }

  if (err.code === "mfa_required") {
    return "This account requires additional verification that is not supported in this screen yet.";
  }

  if (err.code === "invalid_grant") {
    if (
      err.suberror === "consent_required" ||
      err.errorCodes?.includes?.(65001) ||
      /AADSTS65001/i.test(err.message ?? "")
    ) {
      return "App permission approval is required for this account. An Azure administrator must grant admin consent for the LIT app API permissions, then try signing in again.";
    }

    const aadMessage = extractAadMessage(err.message);
    if (/expired/i.test(err.message) || /expired/i.test(aadMessage || "")) {
      return "Your OTP has expired. Please request a new code.";
    }
    if (/already been used|already used/i.test(err.message)) {
      return "This OTP has already been used. Request a new code and try again.";
    }
    if (/invalid.*oob|invalid.*code|incorrect/i.test(err.message) || err.suberror === "invalid_oob_value") {
      return "The OTP you entered is invalid. Check the latest code in your email and try again.";
    }
    if (aadMessage && aadMessage.length <= 120) {
      return aadMessage;
    }
    return "Invalid OTP. Request a new code if this keeps happening.";
  }

  if (err.code === "invalid_code") {
    return "The OTP you entered is invalid. Check the latest code in your email and try again.";
  }

  if (err.code === "credential_required") {
    return "Additional verification is required. Please start sign-up again.";
  }

  if (err.code === "attributes_required") {
    return "Additional profile information is required to finish creating your account.";
  }

  if (err.code === "network_error") {
    return "Unable to reach the sign-in service. Check your connection and try again.";
  }

  if (err.code === "redirect_required" || err.suberror === "nativeauthapi_disabled") {
    return "Email OTP is not available in the custom sign-in screen. Enable Native Authentication on your Azure SPA app registration.";
  }

  if (err.message?.includes("verification session expired")) {
    return "Your verification session expired. Please request a new code.";
  }

  const aadMessage = extractAadMessage(err.message);
  if (aadMessage && aadMessage.length <= 120) {
    return aadMessage;
  }

  if (isSafeUserMessage(err.message)) {
    return err.message;
  }

  if (err.status >= 500 || SERVER_ERROR_PATTERN.test(err.message)) {
    return "Something went wrong. Please try again in a few moments.";
  }

  if (step === "verify") {
    return "Verification failed. Please try again.";
  }

  if (step === "send" || step === "resend") {
    return "Unable to send verification code. Please try again.";
  }

  return "Something went wrong. Please try again in a few moments.";
}
