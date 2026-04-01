"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
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

function formatDate(value) {
  if (!value) {
    return "-";
  }

  return new Date(value).toLocaleString();
}

export default function CouponUsagesPage() {
  const router = useRouter();
  const { token, user, ready } = useAuthSession();
  const [usages, setUsages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (ready && !token) {
      router.replace("/login");
    }
  }, [ready, router, token]);

  useEffect(() => {
    if (!ready || !token) {
      return;
    }

    let active = true;

    async function loadUsages() {
      setLoading(true);
      setError("");

      try {
        const response = await apiFetch("/admin/coupon-usages/", {
          headers: {
            Accept: "application/json",
          },
        });
        const data = await readApiResponse(response);

        if (!response.ok) {
          throw new Error(
            typeof data === "string" && data.trim().startsWith("<!DOCTYPE")
              ? "Backend returned HTML instead of JSON for coupon usages. Check the Django server error or admin permission."
              : "Failed to load coupon usages.",
          );
        }

        if (active) {
          setUsages(Array.isArray(data) ? data : []);
        }
      } catch (loadError) {
        if (active) {
          setError(loadError.message || "Unable to load coupon usages.");
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    loadUsages();

    return () => {
      active = false;
    };
  }, [ready, token]);

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
      <div className="mx-auto max-w-7xl px-5 py-8 lg:px-8">
        <header className="rounded-[28px] border border-white/70 bg-white/85 px-6 py-5 shadow-[0_20px_60px_rgba(148,163,184,0.16)]">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="text-sm font-medium uppercase tracking-[0.24em] text-orange-500">
                Coupon Usages
              </p>
              <h1 className="mt-3 text-3xl font-semibold tracking-tight text-slate-950">
                Coupon Usage List
              </h1>
              <p className="mt-2 text-sm text-slate-600">
                Logged in as {user?.email || user?.username || "Admin"}.
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <Link
                href="/"
                className="inline-flex items-center justify-center rounded-2xl border border-slate-200 bg-white px-5 py-3 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
              >
                Back To Dashboard
              </Link>
              <Link
                href="/coupons"
                className="inline-flex items-center justify-center rounded-2xl bg-slate-950 px-5 py-3 text-sm font-medium text-white transition hover:bg-slate-800"
              >
                View Coupons
              </Link>
            </div>
          </div>
        </header>

        <section className="mt-8 rounded-[28px] border border-slate-200 bg-white p-6 shadow-[0_10px_30px_rgba(15,23,42,0.06)]">
          {loading ? (
            <div className="rounded-2xl bg-slate-50 px-5 py-4 text-sm text-slate-600">
              Loading coupon usages...
            </div>
          ) : null}

          {error ? (
            <div className="rounded-2xl border border-rose-200 bg-rose-50 px-5 py-4 text-sm text-rose-700">
              {error}
            </div>
          ) : null}

          {!loading && !error && (
            <div className="overflow-hidden rounded-2xl border border-slate-200">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-slate-200">
                  <thead className="bg-slate-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                        Coupon
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                        Amount
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                        User
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                        Used At
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 bg-white">
                    {usages.map((usage) => (
                      <tr key={usage.id}>
                        <td className="px-4 py-4 text-sm font-medium text-slate-900">
                          {usage.coupon_code || "-"}
                        </td>
                        <td className="px-4 py-4 text-sm text-slate-700">
                          {usage.coupon_amount ?? "-"}
                        </td>
                        <td className="px-4 py-4 text-sm text-slate-700">
                          {usage.user_email || "-"}
                        </td>
                        <td className="px-4 py-4 text-sm text-slate-700">
                          {formatDate(usage.used_at)}
                        </td>
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
