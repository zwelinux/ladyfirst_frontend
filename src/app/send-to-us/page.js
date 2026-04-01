"use client";

import Link from "next/link";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthSession } from "@/lib/auth";

export default function SendToUsHubPage() {
  const router = useRouter();
  const { token, user, ready } = useAuthSession();

  useEffect(() => {
    if (ready && !token) {
      router.replace("/login");
    }
  }, [ready, router, token]);

  if (!ready || !token) {
    return (
      <main className="min-h-screen bg-[linear-gradient(180deg,_#f8fafc_0%,_#eef2ff_100%)] px-5 py-8">
        <div className="mx-auto max-w-4xl rounded-[28px] border border-white/70 bg-white/80 px-6 py-5 text-sm text-slate-600 shadow-[0_20px_60px_rgba(148,163,184,0.16)]">
          Checking session...
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[linear-gradient(180deg,_#f8fafc_0%,_#eef2ff_100%)] text-slate-900">
      <div className="mx-auto max-w-6xl px-5 py-8 lg:px-8">
        <header className="rounded-[28px] border border-white/70 bg-white/80 px-6 py-5 shadow-[0_20px_60px_rgba(148,163,184,0.16)]">
          <p className="text-sm font-medium uppercase tracking-[0.24em] text-orange-500">
            Send To Us
          </p>
          <h1 className="mt-3 text-3xl font-semibold tracking-tight text-slate-950">
            Send To Us Admin
          </h1>
          <p className="mt-2 text-sm text-slate-600">
            Logged in as {user?.email || user?.username || "Admin"}.
          </p>
        </header>

        <section className="mt-8 grid gap-6 md:grid-cols-2">
          <div className="rounded-[30px] border border-slate-200 bg-white p-8 shadow-[0_10px_30px_rgba(15,23,42,0.06)]">
            <p className="text-sm font-medium uppercase tracking-[0.24em] text-orange-500">
              Packages
            </p>
            <h2 className="mt-3 text-3xl font-semibold text-slate-950">
              Send To Us packages
            </h2>
            <p className="mt-4 text-base text-slate-600">
              Review package names, item ranges, prices, and active status.
            </p>
            <div className="mt-8">
              <Link
                href="/send-to-us/packages"
                className="inline-flex items-center justify-center rounded-2xl bg-slate-950 px-6 py-3 text-base font-medium text-white transition hover:bg-slate-800"
              >
                Open Packages
              </Link>
            </div>
          </div>

          <div className="rounded-[30px] border border-slate-200 bg-white p-8 shadow-[0_10px_30px_rgba(15,23,42,0.06)]">
            <p className="text-sm font-medium uppercase tracking-[0.24em] text-orange-500">
              Sessions
            </p>
            <h2 className="mt-3 text-3xl font-semibold text-slate-950">
              Send To Us sessions
            </h2>
            <p className="mt-4 text-base text-slate-600">
              Review session status, user, pickup details, and open session box photos.
            </p>
            <div className="mt-8">
              <Link
                href="/send-to-us/sessions"
                className="inline-flex items-center justify-center rounded-2xl bg-slate-950 px-6 py-3 text-base font-medium text-white transition hover:bg-slate-800"
              >
                Open Sessions
              </Link>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
