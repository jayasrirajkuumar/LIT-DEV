import { decodeJwt, logAuth, logAuthError } from "../config/authConfig";
import { getProfileExtensions } from "./profileService";
import { logPersistence } from "../utils/persistenceLogger";
import { getProfile as fetchProfileApi, updateProfile as updateProfileApi } from "./userApiService";
import { USER_API_BASE } from "../config/apiBase.js";

const USER_PROFILE_KEY = "lit_user_profile";
const USERS_REGISTRY_KEY = "lit_users_registry";

const AUTH_PROVIDER = "azure_external_id";
const SYNC_ENDPOINT = `${USER_API_BASE}/auth/sync-user`;
const MAX_SYNC_RETRIES = 2;

function readRegistry() {
  try {
    const raw = localStorage.getItem(USERS_REGISTRY_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function writeRegistry(registry) {
  localStorage.setItem(USERS_REGISTRY_KEY, JSON.stringify(registry));
}

export function getStoredUserProfile() {
  try {
    const raw = localStorage.getItem(USER_PROFILE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function storeUserProfile(profile, options = {}) {
  const { notifyAuthChange = false } = options;

  if (profile?.azureUserId) {
    const registry = readRegistry();
    registry[profile.azureUserId] = {
      ...registry[profile.azureUserId],
      ...profile,
    };
    writeRegistry(registry);
  }

  localStorage.setItem(USER_PROFILE_KEY, JSON.stringify(profile));
  window.dispatchEvent(new Event("lit-profile-change"));

  if (notifyAuthChange) {
    window.dispatchEvent(new Event("lit-auth-change"));
  }
}

export function clearStoredUserProfile() {
  localStorage.removeItem(USER_PROFILE_KEY);
}

function mapAzureClaimsToUserPayload(claims = {}) {
  return {
    azureUserId: claims.sub || claims.oid,
    name: claims.name || claims.given_name || "User",
    email:
      claims.email ||
      claims.preferred_username ||
      claims.emails?.[0] ||
      "",
    picture: typeof claims.picture === "string" ? claims.picture : null,
    authProvider: AUTH_PROVIDER,
  };
}

function parseApiError(payload, status) {
  const message =
    payload?.error?.message ||
    (typeof payload?.error === "string" ? payload.error : null) ||
    payload?.message ||
    `User API error: ${status}`;
  const error = new Error(message);
  error.code = payload?.error?.code;
  error.status = status;
  return error;
}

function mapBackendUserToProfile(apiUser, localProfile) {
  return {
    ...localProfile,
    _id: apiUser.id,
    id: apiUser.id,
    azureUserId: apiUser.azureUserId,
    name: apiUser.displayName || localProfile.name,
    email: apiUser.email || localProfile.email,
    phone: apiUser.phoneNumber || localProfile.phone || "",
    avatarUrl: apiUser.profilePicture || localProfile.avatarUrl || null,
    role: apiUser.role,
    isActive: apiUser.isActive,
    createdAt: apiUser.createdAt || localProfile.createdAt,
    lastLogin: apiUser.lastLogin || localProfile.lastLogin,
    syncStatus: "synced",
  };
}

function mergeProfileOnLogin(payload) {
  const registry = readRegistry();
  const existing = registry[payload.azureUserId];
  const extensions = getProfileExtensions(payload.azureUserId);
  const now = new Date().toISOString();

  return {
    azureUserId: payload.azureUserId,
    name: existing?.name || payload.name,
    email: payload.email || existing?.email || "",
    username: extensions.username || existing?.username || "",
    phone: extensions.phone || existing?.phone || "",
    country: extensions.country || existing?.country || "",
    bio: extensions.bio || existing?.bio || "",
    authProvider: AUTH_PROVIDER,
    createdAt: existing?.createdAt || now,
    lastLogin: now,
    _id: existing?._id || `local-${payload.azureUserId}`,
  };
}

function upsertLocalUser(payload) {
  const profile = mergeProfileOnLogin(payload);
  const registry = readRegistry();
  registry[payload.azureUserId] = profile;
  writeRegistry(registry);
  storeUserProfile(profile);
  return profile;
}

async function upsertRemoteUser(payload, idToken, attempt = 1) {
  logAuth("Calling sync-user", {
    endpoint: SYNC_ENDPOINT,
    attempt,
    azureUserId: payload.azureUserId,
  });

  let response;

  try {
    response = await fetch(SYNC_ENDPOINT, {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        Authorization: `Bearer ${idToken}`,
      },
      body: JSON.stringify({}),
    });
  } catch (networkError) {
    logAuthError("sync-user network error", networkError.message);

    if (attempt < MAX_SYNC_RETRIES) {
      logAuth("Retrying sync-user", { attempt: attempt + 1 });
      return upsertRemoteUser(payload, idToken, attempt + 1);
    }

    throw new Error(
      `Unable to reach the authentication API at ${SYNC_ENDPOINT}. Ensure the backend is running.`,
    );
  }

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    logAuthError("sync-user failed", {
      status: response.status,
      code: data?.error?.code,
      message: data?.error?.message,
      reason: data?.error?.details?.reason,
      tokenIss: data?.error?.details?.tokenIss,
    });
    throw parseApiError(data, response.status);
  }

  const apiUser = data?.data?.user ?? data?.user;

  if (!apiUser?.id) {
    logAuthError("sync-user returned unexpected payload", data);
    throw new Error("Authentication sync succeeded but no user profile was returned.");
  }

  logAuth("sync-user success", {
    userId: apiUser.id,
    isNewUser: data?.data?.isNewUser ?? data?.isNewUser,
  });

  const localProfile = mergeProfileOnLogin(payload);
  const profile = mapBackendUserToProfile(apiUser, localProfile);

  storeUserProfile(profile, { notifyAuthChange: true });
  return profile;
}

/**
 * Creates or updates a user after Azure login.
 * Preserves locally edited profile fields across logins.
 * Falls back to a local profile if the backend sync API is unavailable.
 */
export async function upsertUserFromClaims(claims, idToken) {
  const payload = mapAzureClaimsToUserPayload(claims);

  if (!payload.azureUserId) {
    throw new Error("Azure user ID (sub) is missing from token claims.");
  }

  if (!idToken) {
    throw new Error("Azure ID token is missing. Cannot sync user profile.");
  }

  logAuth("Login sync started", {
    azureUserId: payload.azureUserId,
    email: payload.email,
  });

  try {
    const profile = await upsertRemoteUser(payload, idToken);
    logAuth("User synced with backend", {
      userId: profile.id,
      azureUserId: profile.azureUserId,
    });
    return profile;
  } catch (error) {
    logAuthError("Backend sync failed; continuing with local profile", {
      message: error.message,
      status: error.status,
      code: error.code,
    });

    const profile = upsertLocalUser(payload);
    profile.syncStatus = "local_only";
    storeUserProfile(profile, { notifyAuthChange: true });

    logAuth("User session stored locally (backend sync deferred)", {
      azureUserId: profile.azureUserId,
      email: profile.email,
    });

    return profile;
  }
}

/**
 * Saves name and phone collected during sign-up to the backend profile.
 */
export async function applySignupProfileDetails(profileDetails) {
  if (!profileDetails?.displayName) return getStoredUserProfile();

  const payload = {
    displayName: profileDetails.displayName,
  };

  if (profileDetails.phoneNumber) {
    payload.phoneNumber = profileDetails.phoneNumber;
  }

  try {
    const apiUser = await updateProfileApi(payload);
    const stored = getStoredUserProfile();
    const updated = mapBackendUserToProfile(apiUser, stored || {});
    storeUserProfile(updated, { notifyAuthChange: true });
    logAuth("Signup profile details saved", { userId: updated.id });
    return updated;
  } catch (error) {
    logAuthError("Failed to save signup profile details", error.message);
    const stored = getStoredUserProfile();
    if (stored) {
      const localUpdate = {
        ...stored,
        name: profileDetails.displayName,
        phone: profileDetails.phoneNumber || stored.phone || "",
      };
      storeUserProfile(localUpdate, { notifyAuthChange: true });
      return localUpdate;
    }
    return null;
  }
}

function mergeExtensionsIntoProfile(profile, azureUserId) {
  const extensions = getProfileExtensions(azureUserId);
  return {
    ...profile,
    username: extensions.username || profile.username,
    phone: extensions.phone || profile.phone || "",
    country: extensions.country || profile.country || "",
    bio: extensions.bio || profile.bio || "",
  };
}

export async function fetchUserProfile(azureUserId, idToken) {
  if (!azureUserId) return getStoredUserProfile();

  if (!idToken || isSessionExpired(idToken)) {
    const stored = getStoredUserProfile();
    return stored?.azureUserId === azureUserId ? stored : null;
  }

  try {
    logPersistence("profile", "fetchUserProfile → GET /users/me");
    const apiUser = await fetchProfileApi();

    if (apiUser?.id) {
      const mergedProfile = mergeExtensionsIntoProfile(
        mapBackendUserToProfile(
          apiUser,
          mergeProfileOnLogin({
            azureUserId,
            name: apiUser.displayName,
            email: apiUser.email,
            authProvider: AUTH_PROVIDER,
          }),
        ),
        azureUserId,
      );
      storeUserProfile(mergedProfile);
      logPersistence("profile", "frontend refresh after GET /users/me", {
        userId: mergedProfile.id,
      });
      return mergedProfile;
    }
  } catch (error) {
    logAuthError("Failed to fetch remote user profile", error.message);
    logPersistence("profile", "GET /users/me failed, using cached profile", {
      message: error.message,
    });
  }

  const registry = readRegistry();
  const fallback = registry[azureUserId] || getStoredUserProfile();
  return fallback?.azureUserId === azureUserId
    ? mergeExtensionsIntoProfile(fallback, azureUserId)
    : null;
}

export async function updateRemoteProfile({ displayName, phoneNumber }) {
  logPersistence("profile", "updateRemoteProfile → PATCH /users/me", {
    displayName,
    phoneNumber,
  });

  const apiUser = await updateProfileApi({
    displayName,
    phoneNumber: phoneNumber || null,
  });

  const azureUserId = apiUser.azureUserId || getStoredUserProfile()?.azureUserId;
  const localBase = azureUserId
    ? mergeProfileOnLogin({
        azureUserId,
        name: apiUser.displayName,
        email: apiUser.email,
        authProvider: AUTH_PROVIDER,
      })
    : getStoredUserProfile() || {};

  const profile = mergeExtensionsIntoProfile(
    mapBackendUserToProfile(apiUser, localBase),
    azureUserId,
  );

  storeUserProfile(profile);
  logPersistence("profile", "frontend refresh after PATCH /users/me", {
    userId: profile.id,
  });
  return profile;
}

export function isSessionExpired(idToken) {
  if (!idToken) return true;
  const decoded = decodeJwt(idToken);
  if (!decoded?.exp) return false;
  return decoded.exp * 1000 <= Date.now();
}

export function clearUserSession() {
  localStorage.removeItem("id_token");
  localStorage.removeItem("user_info");
  sessionStorage.removeItem("user_info");
  localStorage.removeItem(USER_PROFILE_KEY);
  window.dispatchEvent(new Event("lit-auth-change"));
}

/** @deprecated Use upsertUserFromClaims */
export async function createUser(userData) {
  return upsertUserFromClaims(
    {
      sub: userData.provider,
      name: userData.name,
      email: userData.email,
    },
    localStorage.getItem("id_token"),
  );
}
