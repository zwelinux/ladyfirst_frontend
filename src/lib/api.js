const LOCAL_API_BASE_URL = "http://127.0.0.1:8000/api/auth";
const PROD_API_BASE_URL = "https://x.ladyfirst.me/api/auth";

function getStoredAccessToken() {
  if (typeof window === "undefined") {
    return "";
  }

  return window.localStorage.getItem("access") || "";
}

export function getApiBaseUrl() {
  const envValue = process.env.NEXT_PUBLIC_API_BASE_URL;
  if (envValue && envValue.trim()) {
    return envValue.trim();
  }

  if (typeof window !== "undefined") {
    const hostname = window.location.hostname;
    if (
      hostname === "localhost" ||
      hostname === "127.0.0.1" ||
      hostname.endsWith(".local")
    ) {
      return LOCAL_API_BASE_URL;
    }
  }

  return PROD_API_BASE_URL;
}

export function buildApiUrl(path) {
  const baseUrl = getApiBaseUrl();
  return `${baseUrl.replace(/\/$/, "")}/${path.replace(/^\//, "")}`;
}

export async function apiFetch(path, options = {}) {
  const { headers, ...rest } = options;
  const accessToken = getStoredAccessToken();

  return fetch(buildApiUrl(path), {
    credentials: "include",
    ...rest,
    headers: {
      Accept: "application/json",
      ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
      ...headers,
    },
  });
}
