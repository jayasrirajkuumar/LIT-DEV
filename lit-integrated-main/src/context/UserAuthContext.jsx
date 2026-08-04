import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useNavigate } from "react-router-dom";
import { buildLoginUrl, decodeJwt, logAuth, logAuthError } from "../config/authConfig";
import {
  getDefaultProfileExtensions,
  getProfileAvatar,
  getProfileExtensions,
  removeProfileAvatar,
  saveProfileAvatar,
  saveProfileExtensions,
} from "../services/profileService";
import {
  clearUserSession,
  fetchUserProfile,
  getStoredUserProfile,
  isSessionExpired,
  updateRemoteProfile,
} from "../services/userService";
import { logPersistence, logPersistenceError } from "../utils/persistenceLogger";

const UserAuthContext = createContext(null);

function readSessionUser() {
  try {
    const idToken = localStorage.getItem("id_token");
    const rawUser = localStorage.getItem("user_info");

    if (!idToken || !rawUser || isSessionExpired(idToken)) {
      return null;
    }

    return JSON.parse(rawUser);
  } catch {
    return null;
  }
}

function resolveProfileExtensions(azureUserId, email = "") {
  const savedExtensions = getProfileExtensions(azureUserId);
  if (!savedExtensions.username || savedExtensions.username === "@user") {
    return {
      ...savedExtensions,
      username: getDefaultProfileExtensions(email).username,
    };
  }
  return savedExtensions;
}

export const UserAuthProvider = ({ children }) => {
  const navigate = useNavigate();
  const [user, setUser] = useState(() => readSessionUser());
  const [userProfile, setUserProfile] = useState(() => getStoredUserProfile());
  const [avatarUrl, setAvatarUrl] = useState(() => {
    const sessionUser = readSessionUser();
    return sessionUser?.sub ? getProfileAvatar(sessionUser.sub) : null;
  });
  const [profileExtensions, setProfileExtensions] = useState(() => {
    const sessionUser = readSessionUser();
    const profile = getStoredUserProfile();
    return sessionUser?.sub
      ? resolveProfileExtensions(sessionUser.sub, profile?.email || "")
      : getDefaultProfileExtensions();
  });
  const [loading, setLoading] = useState(true);
  const syncSessionRef = useRef(null);

  const syncProfileFromStorage = useCallback((sessionUser = readSessionUser()) => {
    if (!sessionUser?.sub) {
      setAvatarUrl(null);
      setProfileExtensions(getDefaultProfileExtensions());
      return;
    }

    const storedProfile = getStoredUserProfile();
    if (storedProfile) {
      setUserProfile(storedProfile);
    }

    setAvatarUrl(getProfileAvatar(sessionUser.sub));
    setProfileExtensions(
      resolveProfileExtensions(
        sessionUser.sub,
        storedProfile?.email || sessionUser.email || sessionUser.preferred_username || "",
      ),
    );
  }, []);

  const syncSession = useCallback(async () => {
    if (syncSessionRef.current) {
      return syncSessionRef.current;
    }

    syncSessionRef.current = (async () => {
      const sessionUser = readSessionUser();

      if (!sessionUser) {
        setUser(null);
        setUserProfile(null);
        setAvatarUrl(null);
        setProfileExtensions(getDefaultProfileExtensions());
        setLoading(false);
        return;
      }

      setUser(sessionUser);

      const idToken = localStorage.getItem("id_token");
      const profile = await fetchUserProfile(sessionUser.sub, idToken);

      if (profile) {
        setUserProfile(profile);
      } else if (getStoredUserProfile()) {
        setUserProfile(getStoredUserProfile());
      }

      syncProfileFromStorage(sessionUser);
      setLoading(false);
    })();

    try {
      return await syncSessionRef.current;
    } finally {
      syncSessionRef.current = null;
    }
  }, [syncProfileFromStorage]);

  useEffect(() => {
    syncSession();

    const handleAuthChange = () => {
      syncSession();
    };

    const handleProfileChange = () => {
      syncProfileFromStorage();
    };

    window.addEventListener("lit-auth-change", handleAuthChange);
    window.addEventListener("lit-profile-change", handleProfileChange);
    window.addEventListener("storage", handleAuthChange);

    return () => {
      window.removeEventListener("lit-auth-change", handleAuthChange);
      window.removeEventListener("lit-profile-change", handleProfileChange);
      window.removeEventListener("storage", handleAuthChange);
    };
  }, [syncSession, syncProfileFromStorage]);

  const login = useCallback(async (returnTo = null) => {
    try {
      if (returnTo) {
        sessionStorage.setItem("auth_return_to", returnTo);
      }

      const loginUrl = await buildLoginUrl();
      logAuth("Starting Azure login from UserAuthContext");
      window.location.href = loginUrl;
    } catch (error) {
      logAuthError("Unable to start login", error.message);
      throw error;
    }
  }, []);

  const logout = useCallback(() => {
    clearUserSession();
    setUser(null);
    setUserProfile(null);
    setAvatarUrl(null);
    setProfileExtensions(getDefaultProfileExtensions());
    logAuth("User logged out");
    navigate("/", { replace: true });
  }, [navigate]);

  const refreshUserProfile = useCallback(async () => {
    if (!user?.sub) return null;

    const idToken = localStorage.getItem("id_token");
    const profile = await fetchUserProfile(user.sub, idToken);
    setUserProfile(profile);
    syncProfileFromStorage(user);
    return profile;
  }, [user, syncProfileFromStorage]);

  const updateProfile = useCallback(
    async ({ name, extensions }) => {
      const azureUserId = user?.sub || userProfile?.azureUserId;
      if (!azureUserId) {
        throw new Error("You must be signed in to update your profile.");
      }

      const nextExtensions = extensions || profileExtensions;
      if (extensions) {
        saveProfileExtensions(azureUserId, extensions);
        setProfileExtensions(nextExtensions);
      }

      const resolvedName = (
        name ??
        userProfile?.name ??
        user?.name ??
        user?.given_name ??
        user?.preferred_username ??
        "User"
      )?.trim();
      if (!resolvedName) {
        throw new Error("Display name is required.");
      }

      try {
        const profile = await updateRemoteProfile({
          displayName: resolvedName,
          phoneNumber: nextExtensions.phone?.trim() || null,
        });

        setUserProfile({
          ...profile,
          username: nextExtensions.username,
          country: nextExtensions.country,
          bio: nextExtensions.bio,
        });
        logPersistence("profile", "UserAuthContext state refreshed");
        return profile;
      } catch (error) {
        logPersistenceError("profile", "updateProfile failed", { message: error.message });
        throw error;
      }
    },
    [user, userProfile, profileExtensions],
  );

  const saveAvatar = useCallback(
    (dataUrl) => {
      const azureUserId = user?.sub || userProfile?.azureUserId;
      if (!azureUserId) return;

      saveProfileAvatar(azureUserId, dataUrl);
      setAvatarUrl(dataUrl);
    },
    [user, userProfile],
  );

  const removeAvatar = useCallback(() => {
    const azureUserId = user?.sub || userProfile?.azureUserId;
    if (!azureUserId) return;

    removeProfileAvatar(azureUserId);
    setAvatarUrl(null);
  }, [user, userProfile]);

  const displayName = useMemo(
    () =>
      userProfile?.name ||
      user?.name ||
      user?.given_name ||
      user?.preferred_username ||
      "User",
    [userProfile?.name, user?.name, user?.given_name, user?.preferred_username],
  );

  const displayEmail = useMemo(
    () =>
      userProfile?.email ||
      user?.email ||
      user?.preferred_username ||
      "",
    [userProfile?.email, user?.email, user?.preferred_username],
  );

  const value = useMemo(
    () => ({
      user,
      userProfile,
      avatarUrl,
      profileExtensions,
      isAuthenticated: !!user,
      isAdmin: userProfile?.role === "ADMIN",
      loading,
      login,
      logout,
      refreshUserProfile,
      updateProfile,
      saveAvatar,
      removeAvatar,
      displayName,
      displayEmail,
    }),
    [
      user,
      userProfile,
      avatarUrl,
      profileExtensions,
      loading,
      login,
      logout,
      refreshUserProfile,
      updateProfile,
      saveAvatar,
      removeAvatar,
      displayName,
      displayEmail,
    ],
  );

  return (
    <UserAuthContext.Provider value={value}>{children}</UserAuthContext.Provider>
  );
};

export const useUserAuth = () => {
  const context = useContext(UserAuthContext);
  if (!context) {
    throw new Error("useUserAuth must be used within a UserAuthProvider");
  }
  return context;
};

export function getPostLoginRedirectPath() {
  const returnTo = sessionStorage.getItem("auth_return_to");
  sessionStorage.removeItem("auth_return_to");
  return returnTo && returnTo !== "/auth/callback" ? returnTo : "/";
}
