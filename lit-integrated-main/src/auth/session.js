export const OTP_SESSION_KEY = "lit_otp_session";
export const SIGNUP_DRAFT_KEY = "lit_signup_draft";
export const OTP_SESSION_MAX_AGE_MS = 15 * 60 * 1000;
export const SIGNUP_DRAFT_MAX_AGE_MS = 30 * 60 * 1000;

export function normalizeAuthEmail(email) {
  return String(email ?? "").trim().toLowerCase();
}

export function persistOtpSession(session) {
  sessionStorage.setItem(OTP_SESSION_KEY, JSON.stringify(session));
}

export function retrieveOtpSession() {
  const raw = sessionStorage.getItem(OTP_SESSION_KEY);
  if (!raw) return null;
  try {
    const session = JSON.parse(raw);
    if (!session?.continuationToken || !session?.email) return null;

    if (session.issuedAt && Date.now() - session.issuedAt > OTP_SESSION_MAX_AGE_MS) {
      sessionStorage.removeItem(OTP_SESSION_KEY);
      return null;
    }

    return session;
  } catch {
    return null;
  }
}

export function removeOtpSession() {
  sessionStorage.removeItem(OTP_SESSION_KEY);
}

export function persistSignupDraft(draft) {
  sessionStorage.setItem(
    SIGNUP_DRAFT_KEY,
    JSON.stringify({ ...draft, savedAt: Date.now() }),
  );
}

export function retrieveSignupDraft() {
  const raw = sessionStorage.getItem(SIGNUP_DRAFT_KEY);
  if (!raw) return null;
  try {
    const draft = JSON.parse(raw);
    if (!draft?.firstName || !draft?.lastName) return null;
    if (draft.savedAt && Date.now() - draft.savedAt > SIGNUP_DRAFT_MAX_AGE_MS) {
      sessionStorage.removeItem(SIGNUP_DRAFT_KEY);
      return null;
    }
    return draft;
  } catch {
    return null;
  }
}

export function removeSignupDraft() {
  sessionStorage.removeItem(SIGNUP_DRAFT_KEY);
}

export function buildDisplayName(draft) {
  return [draft?.firstName, draft?.lastName].filter(Boolean).join(" ").trim();
}
