import { useSyncExternalStore } from "react";

export const AUTH_STORAGE_KEYS = {
  access: "access",
  refresh: "refresh",
  user: "auth_user",
};

const EMPTY_AUTH_SNAPSHOT = Object.freeze({
  token: "",
  user: null,
});

let cachedSnapshot = EMPTY_AUTH_SNAPSHOT;
const authListeners = new Set();

export function isBrowser() {
  return typeof window !== "undefined";
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
  emitAuthChange();
}

export function clearAuthSession() {
  if (!isBrowser()) {
    return;
  }

  Object.values(AUTH_STORAGE_KEYS).forEach((key) => {
    window.localStorage.removeItem(key);
  });
  emitAuthChange();
}

function subscribe(onStoreChange) {
  authListeners.add(onStoreChange);

  if (isBrowser()) {
    window.addEventListener("storage", onStoreChange);
  }

  return () => {
    authListeners.delete(onStoreChange);

    if (isBrowser()) {
      window.removeEventListener("storage", onStoreChange);
    }
  };
}

function getSnapshot() {
  const nextToken = getAccessToken();
  const nextUser = getStoredUser();

  if (
    cachedSnapshot.token === nextToken &&
    JSON.stringify(cachedSnapshot.user) === JSON.stringify(nextUser)
  ) {
    return cachedSnapshot;
  }

  cachedSnapshot = {
    token: nextToken,
    user: nextUser,
  };

  return cachedSnapshot;
}

function getServerSnapshot() {
  return EMPTY_AUTH_SNAPSHOT;
}

function emitAuthChange() {
  cachedSnapshot = getSnapshot();
  authListeners.forEach((listener) => listener());
}

export function useAuthSession() {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
