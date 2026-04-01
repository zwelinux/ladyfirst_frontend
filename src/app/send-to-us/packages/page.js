"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthSession } from "@/lib/auth";
import { apiFetch } from "@/lib/api";

async function readApiResponse(response) {
  const text = await response.text();
  try {
    return text ? JSON.parse(text) : null;
  } catch {
    return text;
  }
}

export default function SendToUsPackagesPage() {
  const router = useRouter();
  const { token, ready } = useAuthSession();
  const [packages, setPackages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (ready && !token) {
      router.replace("/login");
    }
  }, [ready, router, token]);

  useEffect(() => {
    if (!ready || !token) return;
    let active = true;

    async function loadData() {
      setLoading(true);
      setError("");
      try {
        const response = await apiFetch("/admin/sendus/packages/", {
          headers: {
            Accept: "application/json",
          },
        });
        const data = await readApiResponse(response);
        if (!response.ok) {
          throw new Error(
            typeof data === "string" && data.trim().startsWith("<!DOCTYPE")
              ? "Backend returned HTML instead of JSON for Send To Us packages. Check the Django server error or admin permission."
              : "Failed to load Send To Us packages.",
          );
        }
        if (active) setPackages(Array.isArray(data) ? data : []);
      } catch (loadError) {
        if (active) setError(loadError.message || "Unable to load packages.");
      } finally {
        if (active) setLoading(false);
      }
    }

    loadData();
    return () => {
      active = false;
    };
  }, [ready, token]);

  if (!ready || !token) {
    return <main className="min-h-screen bg-[linear-gradient(180deg,_#f8fafc_0%,_#eef2ff_100%)] px-5 py-8"><div className="mx-auto max-w-4xl rounded-[28px] border border-white/70 bg-white/80 px-6 py-5 text-sm text-slate-600 shadow-[0_20px_60px_rgba(148,163,184,0.16)]">Checking session...</div></main>;
  }

  return (
    <main className="min-h-screen bg-[linear-gradient(180deg,_#f8fafc_0%,_#eef2ff_100%)] text-slate-900">
      <div className="mx-auto max-w-7xl px-5 py-8 lg:px-8">
        <header className="rounded-[28px] border border-white/70 bg-white/85 px-6 py-5 shadow-[0_20px_60px_rgba(148,163,184,0.16)]">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-sm font-medium uppercase tracking-[0.24em] text-orange-500">Send To Us Packages</p>
              <h1 className="mt-3 text-3xl font-semibold tracking-tight text-slate-950">Packages</h1>
            </div>
            <Link href="/send-to-us" className="inline-flex items-center justify-center rounded-2xl border border-slate-200 bg-white px-5 py-3 text-sm font-medium text-slate-700 transition hover:bg-slate-50">Back To Send To Us</Link>
          </div>
        </header>

        <section className="mt-8 rounded-[28px] border border-slate-200 bg-white p-6 shadow-[0_10px_30px_rgba(15,23,42,0.06)]">
          {loading ? <div className="rounded-2xl bg-slate-50 px-5 py-4 text-sm text-slate-600">Loading packages...</div> : null}
          {error ? <div className="rounded-2xl border border-rose-200 bg-rose-50 px-5 py-4 text-sm text-rose-700">{error}</div> : null}
          {!loading && !error && (
            <div className="overflow-hidden rounded-2xl border border-slate-200">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-slate-200">
                  <thead className="bg-slate-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Name</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Min Items</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Max Items</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Price</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 bg-white">
                    {packages.map((pkg) => (
                      <tr key={pkg.id}>
                        <td className="px-4 py-4 text-sm font-medium text-slate-900">{pkg.name}</td>
                        <td className="px-4 py-4 text-sm text-slate-700">{pkg.min_items}</td>
                        <td className="px-4 py-4 text-sm text-slate-700">{pkg.max_items}</td>
                        <td className="px-4 py-4 text-sm text-slate-700">{pkg.price}</td>
                        <td className="px-4 py-4"><span className={`rounded-full px-3 py-1 text-xs font-medium ${pkg.is_active ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-slate-700"}`}>{pkg.is_active ? "Active" : "Inactive"}</span></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
