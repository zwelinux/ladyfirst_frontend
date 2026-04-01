"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AUTH_STORAGE_KEYS, setAuthSession, useAuthSession } from "@/lib/auth";
import { apiFetch, getApiBaseUrl } from "@/lib/api";

export default function LoginPage() {
  const router = useRouter();
  const { token, ready } = useAuthSession();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [debugInfo, setDebugInfo] = useState({
    host: "",
    apiBase: "",
    hasAccessToken: false,
    hasRefreshToken: false,
    hasStoredUser: false,
    waitSeconds: 0,
  });

  useEffect(() => {
    if (ready && token) {
      router.replace("/");
    }
  }, [ready, router, token]);

  useEffect(() => {
    if (typeof window === "undefined") {
      return undefined;
    }

    function syncDebugInfo() {
      setDebugInfo((current) => ({
        ...current,
        host: window.location.host,
        apiBase: getApiBaseUrl(),
        hasAccessToken: Boolean(
          window.localStorage.getItem(AUTH_STORAGE_KEYS.access),
        ),
        hasRefreshToken: Boolean(
          window.localStorage.getItem(AUTH_STORAGE_KEYS.refresh),
        ),
        hasStoredUser: Boolean(
          window.localStorage.getItem(AUTH_STORAGE_KEYS.user),
        ),
      }));
    }

    syncDebugInfo();

    const intervalId = window.setInterval(() => {
      syncDebugInfo();
      setDebugInfo((current) => ({
        ...current,
        waitSeconds: current.waitSeconds + 1,
      }));
    }, 1000);

    window.addEventListener("storage", syncDebugInfo);
    window.addEventListener("ladyfirst-auth-change", syncDebugInfo);

    return () => {
      window.clearInterval(intervalId);
      window.removeEventListener("storage", syncDebugInfo);
      window.removeEventListener("ladyfirst-auth-change", syncDebugInfo);
    };
  }, []);

  async function handleSubmit(event) {
    event.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await apiFetch("/login/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Login failed.");
      }

      setAuthSession({
        access: data.access,
        refresh: data.refresh,
        user: data.user,
      });

      router.replace("/");
    } catch (loginError) {
      setError(loginError.message || "Login failed.");
    } finally {
      setLoading(false);
    }
  }

  if (!ready || token) {
    return (
      <main className="min-h-screen bg-[linear-gradient(180deg,_#f8fafc_0%,_#eef2ff_100%)] px-5 py-8">
        <div className="mx-auto flex min-h-[calc(100vh-4rem)] max-w-6xl items-center justify-center">
          <div className="w-full max-w-4xl rounded-[32px] border border-white/70 bg-white px-8 py-10 shadow-[0_20px_70px_rgba(148,163,184,0.2)]">
            <p className="text-sm font-medium uppercase tracking-[0.24em] text-orange-500">
              Auth Status
            </p>
            <h1 className="mt-4 text-3xl font-semibold text-slate-950">
              Checking session...
            </h1>
            <p className="mt-3 text-sm text-slate-600">
              This page is waiting for client auth hydration or redirect logic.
            </p>

            <div className="mt-8 grid gap-4 sm:grid-cols-2">
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <p className="text-xs uppercase tracking-[0.16em] text-slate-400">
                  Ready
                </p>
                <p className="mt-2 text-base font-medium text-slate-900">
                  {ready ? "true" : "false"}
                </p>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <p className="text-xs uppercase tracking-[0.16em] text-slate-400">
                  Has Token
                </p>
                <p className="mt-2 text-base font-medium text-slate-900">
                  {token ? "true" : "false"}
                </p>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <p className="text-xs uppercase tracking-[0.16em] text-slate-400">
                  Host
                </p>
                <p className="mt-2 break-all text-base font-medium text-slate-900">
                  {debugInfo.host || "-"}
                </p>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <p className="text-xs uppercase tracking-[0.16em] text-slate-400">
                  Wait Time
                </p>
                <p className="mt-2 text-base font-medium text-slate-900">
                  {debugInfo.waitSeconds}s
                </p>
              </div>
            </div>

            <div className="mt-6 rounded-2xl border border-slate-200 p-5">
              <p className="text-xs uppercase tracking-[0.16em] text-slate-400">
                API Base
              </p>
              <p className="mt-2 break-all text-sm text-slate-700">
                {debugInfo.apiBase || "-"}
              </p>
            </div>

            <div className="mt-6 grid gap-4 sm:grid-cols-3">
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <p className="text-xs uppercase tracking-[0.16em] text-slate-400">
                  Access In Storage
                </p>
                <p className="mt-2 text-base font-medium text-slate-900">
                  {debugInfo.hasAccessToken ? "true" : "false"}
                </p>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <p className="text-xs uppercase tracking-[0.16em] text-slate-400">
                  Refresh In Storage
                </p>
                <p className="mt-2 text-base font-medium text-slate-900">
                  {debugInfo.hasRefreshToken ? "true" : "false"}
                </p>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <p className="text-xs uppercase tracking-[0.16em] text-slate-400">
                  User In Storage
                </p>
                <p className="mt-2 text-base font-medium text-slate-900">
                  {debugInfo.hasStoredUser ? "true" : "false"}
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[linear-gradient(180deg,_#f8fafc_0%,_#eef2ff_100%)] px-5 py-8">
      <div className="mx-auto flex min-h-[calc(100vh-4rem)] max-w-6xl items-center justify-center">
        <div className="grid w-full overflow-hidden rounded-[32px] border border-white/70 bg-white shadow-[0_20px_70px_rgba(148,163,184,0.2)] lg:grid-cols-[1.1fr_0.9fr]">
          <section className="bg-slate-950 px-8 py-10 text-white lg:px-12 lg:py-14">
            <p className="text-sm font-medium uppercase tracking-[0.3em] text-teal-300">
              Lady First
            </p>
            <h1 className="mt-6 max-w-md text-4xl font-semibold tracking-tight">
              Login Admin Dashboard
            </h1>
            <p className="mt-4 max-w-md text-base text-slate-300">
              Sign in with a staff account. After login, you will be redirected
              to the dashboard where you can manage.
            </p>

            <div className="mt-10 space-y-4">
              {[
                "Dashboard access",
                "Upload products for users with seller_id",
                "JWT session stored locally for API requests",
              ].map((item) => (
                <div
                  key={item}
                  className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-slate-200"
                >
                  {item}
                </div>
              ))}
            </div>
          </section>

          <section className="px-8 py-10 lg:px-12 lg:py-14">
            <p className="text-sm font-medium uppercase tracking-[0.24em] text-orange-500">
              Sign In
            </p>
            <h2 className="mt-4 text-3xl font-semibold text-slate-950">
              Login
            </h2>

            <form onSubmit={handleSubmit} className="mt-10 space-y-6">
              <label className="block">
                <div className="mb-3 text-sm font-medium text-slate-700">
                  Email
                </div>
                <input
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder="admin@example.com"
                  className="h-14 w-full rounded-2xl border border-slate-200 bg-white px-5 text-base text-slate-900 shadow-sm outline-none transition placeholder:text-slate-400 focus:border-slate-300"
                />
              </label>

              <label className="block">
                <div className="mb-3 text-sm font-medium text-slate-700">
                  Password
                </div>
                <input
                  type="password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  placeholder="Enter password"
                  className="h-14 w-full rounded-2xl border border-slate-200 bg-white px-5 text-base text-slate-900 shadow-sm outline-none transition placeholder:text-slate-400 focus:border-slate-300"
                />
              </label>

              {error ? (
                <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
                  {error}
                </div>
              ) : null}

              <button
                type="submit"
                disabled={loading}
                className="h-14 w-full rounded-2xl bg-orange-500 text-lg font-medium text-white transition hover:bg-orange-600 disabled:cursor-not-allowed disabled:bg-orange-300"
              >
                {loading ? "Signing in..." : "Login"}
              </button>
            </form>
          </section>
        </div>
      </div>
    </main>
  );
}
