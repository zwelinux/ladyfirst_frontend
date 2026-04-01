import { useEffect, useState } from "react";

export const AUTH_STORAGE_KEYS = {
  access: "access",
  refresh: "refresh",
  user: "auth_user",
};

export function isBrowser() {
  return typeof window !== "undefined";
}

function isLocalDevHost() {
  if (!isBrowser()) {
    return false;
  }

  const hostname = window.location.hostname;
  return (
    hostname === "localhost" ||
    hostname === "127.0.0.1" ||
    hostname.endsWith(".local")
  );
}

export function getStoredUser() {
  if (!isBrowser()) {
    return null;
  }

  const raw = window.localStorage.getItem(AUTH_STORAGE_KEYS.user);
  if (!raw) {
    return null;
  }

  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function getAccessToken() {
  if (!isBrowser()) {
    return "";
  }

  return window.localStorage.getItem(AUTH_STORAGE_KEYS.access) || "";
}

export function getRefreshToken() {
  if (!isBrowser()) {
    return "";
  }

  return window.localStorage.getItem(AUTH_STORAGE_KEYS.refresh) || "";
}

function readAuthSession() {
  const access = getAccessToken();
  const user = access ? getStoredUser() : null;

  return {
    token: access,
    user,
    ready: true,
  };
}

export function setAuthSession({ access, refresh, user }) {
  if (!isBrowser()) {
    return;
  }

  window.localStorage.setItem(AUTH_STORAGE_KEYS.access, access || "");
  window.localStorage.setItem(AUTH_STORAGE_KEYS.refresh, refresh || "");
  window.localStorage.setItem(
    AUTH_STORAGE_KEYS.user,
    JSON.stringify(user || null),
  );
  window.dispatchEvent(new Event("ladyfirst-auth-change"));
}

export function clearAuthSession() {
  if (!isBrowser()) {
    return;
  }

  Object.values(AUTH_STORAGE_KEYS).forEach((key) => {
    window.localStorage.removeItem(key);
  });
  window.dispatchEvent(new Event("ladyfirst-auth-change"));
}

export function useAuthSession() {
  const [session, setSession] = useState({
    token: "",
    user: null,
    ready: false,
  });

  useEffect(() => {
    function syncSession() {
      setSession(readAuthSession());
    }

    syncSession();

    window.addEventListener("storage", syncSession);
    window.addEventListener("ladyfirst-auth-change", syncSession);

    return () => {
      window.removeEventListener("storage", syncSession);
      window.removeEventListener("ladyfirst-auth-change", syncSession);
    };
  }, []);

  return session;
}
