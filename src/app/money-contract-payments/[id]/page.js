"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
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

export default function MoneyContractPaymentDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { token, ready } = useAuthSession();
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (ready && !token) {
      router.replace("/login");
    }
  }, [ready, router, token]);

  useEffect(() => {
    if (!ready || !token || !params?.id) {
      return;
    }

    let active = true;

    async function loadSession() {
      setLoading(true);
      setError("");

      try {
        const response = await apiFetch(`/admin/money-contract/payments/${params.id}/`);
        const data = await readApiResponse(response);

        if (!response.ok) {
          throw new Error(
            typeof data === "string" && data.trim().startsWith("<!DOCTYPE")
              ? "Backend returned HTML instead of JSON for the money contract payment detail. Check the Django server error or admin permission."
              : "Failed to load money contract payment detail.",
          );
        }

        if (active) {
          setSession(data);
        }
      } catch (loadError) {
        if (active) {
          setError(loadError.message || "Unable to load money contract payment detail.");
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    loadSession();

    return () => {
      active = false;
    };
  }, [params, ready, token]);

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
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-sm font-medium uppercase tracking-[0.24em] text-orange-500">
                Money Contract Payment
              </p>
              <h1 className="mt-3 text-3xl font-semibold tracking-tight text-slate-950">
                {session ? `Session #${session.id}` : "Session Detail"}
              </h1>
            </div>
            <Link
              href="/money-contract-payments"
              className="inline-flex items-center justify-center rounded-2xl border border-slate-200 bg-white px-5 py-3 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
            >
              Back To Sessions
            </Link>
          </div>
        </header>

        {loading ? (
          <div className="mt-8 rounded-[28px] border border-slate-200 bg-white px-6 py-5 text-sm text-slate-600 shadow-[0_10px_30px_rgba(15,23,42,0.06)]">
            Loading session...
          </div>
        ) : null}

        {error ? (
          <div className="mt-8 rounded-[28px] border border-rose-200 bg-rose-50 px-6 py-5 text-sm text-rose-700">
            {error}
          </div>
        ) : null}

        {session ? (
          <div className="mt-8 grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
            <section className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-[0_10px_30px_rgba(15,23,42,0.06)]">
              <div className="rounded-[24px] bg-[linear-gradient(135deg,_#fff7ed_0%,_#f8fafc_100%)] p-5">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <p className="text-sm font-medium uppercase tracking-[0.22em] text-orange-500">
                      Session Information
                    </p>
                    <h2 className="mt-3 text-3xl font-semibold text-slate-950">
                      #{session.id}
                    </h2>
                    <p className="mt-2 text-sm text-slate-600">
                      Created {formatDate(session.created_at)}
                    </p>
                  </div>
                  <span className="inline-flex items-center rounded-full bg-slate-100 px-4 py-2 text-sm font-medium uppercase text-slate-700">
                    {session.status}
                  </span>
                </div>
              </div>

              <div className="mt-6 grid gap-4 sm:grid-cols-2">
                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                  <p className="text-xs font-medium uppercase tracking-[0.18em] text-slate-500">
                    User
                  </p>
                  <p className="mt-3 text-base font-medium text-slate-900">
                    {session.user_email || `User #${session.user}`}
                  </p>
                </div>
                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                  <p className="text-xs font-medium uppercase tracking-[0.18em] text-slate-500">
                    Product
                  </p>
                  <p className="mt-3 text-base font-medium text-slate-900">
                    {session.product_title || `Product #${session.product}`}
                  </p>
                </div>
                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                  <p className="text-xs font-medium uppercase tracking-[0.18em] text-slate-500">
                    Amount
                  </p>
                  <p className="mt-3 text-base font-medium text-slate-900">
                    {session.amount}
                  </p>
                </div>
                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                  <p className="text-xs font-medium uppercase tracking-[0.18em] text-slate-500">
                    Payment Source
                  </p>
                  <p className="mt-3 text-base font-medium text-slate-900">
                    {session.payment_source}
                  </p>
                </div>
              </div>

              <div className="mt-6 rounded-2xl border border-slate-200 p-5">
                <p className="text-sm font-medium uppercase tracking-[0.18em] text-slate-500">
                  Timeline
                </p>
                <div className="mt-5 grid gap-4 sm:grid-cols-2">
                  <div>
                    <p className="text-xs uppercase tracking-[0.16em] text-slate-400">
                      Confirmed At
                    </p>
                    <p className="mt-1 text-base font-medium text-slate-900">
                      {formatDate(session.confirmed_at)}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-[0.16em] text-slate-400">
                      Approved At
                    </p>
                    <p className="mt-1 text-base font-medium text-slate-900">
                      {formatDate(session.approved_at)}
                    </p>
                  </div>
                </div>
              </div>
            </section>

            <section className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-[0_10px_30px_rgba(15,23,42,0.06)]">
              <div className="rounded-[24px] bg-[linear-gradient(135deg,_#eff6ff_0%,_#f8fafc_100%)] p-5">
                <p className="text-sm font-medium uppercase tracking-[0.22em] text-sky-600">
                  Payment Data
                </p>
                <h2 className="mt-3 text-3xl font-semibold text-slate-950">
                  Payment Metadata
                </h2>
                <p className="mt-2 text-sm text-slate-600">
                  Review reference values, automation status, QR payload, slip, and webhook data.
                </p>
              </div>

              <div className="mt-6 space-y-5">
                <div className="rounded-2xl border border-slate-200 p-5">
                  <p className="text-xs uppercase tracking-[0.16em] text-slate-400">
                    Ref1
                  </p>
                  <p className="mt-1 text-base font-medium text-slate-900 break-all">
                    {session.ref1 || "-"}
                  </p>
                </div>

                <div className="rounded-2xl border border-slate-200 p-5">
                  <p className="text-xs uppercase tracking-[0.16em] text-slate-400">
                    Auto Confirmed
                  </p>
                  <p className="mt-1 text-base font-medium text-slate-900">
                    {session.is_auto ? "Yes" : "No"}
                  </p>
                </div>

                <div className="rounded-2xl border border-slate-200 p-5">
                  <p className="text-xs uppercase tracking-[0.16em] text-slate-400">
                    QR Payload
                  </p>
                  <p className="mt-1 text-sm leading-7 text-slate-900 break-all">
                    {session.qr_payload || "-"}
                  </p>
                </div>

                <div className="rounded-2xl border border-slate-200 p-5">
                  <p className="text-xs uppercase tracking-[0.16em] text-slate-400">
                    Slip
                  </p>
                  <div className="mt-3">
                    {session.slip_url ? (
                      <a
                        href={session.slip_url}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center justify-center rounded-2xl bg-slate-950 px-5 py-3 text-sm font-medium text-white transition hover:bg-slate-800"
                      >
                        View Payment Slip
                      </a>
                    ) : (
                      <p className="text-sm text-slate-600">No slip uploaded.</p>
                    )}
                  </div>
                </div>

                <div className="rounded-2xl border border-slate-200 p-5">
                  <p className="text-xs uppercase tracking-[0.16em] text-slate-400">
                    Meta
                  </p>
                  <pre className="mt-3 overflow-x-auto rounded-2xl bg-slate-50 p-4 text-xs leading-6 text-slate-700">
                    {JSON.stringify(session.meta || {}, null, 2)}
                  </pre>
                </div>

                <div className="rounded-2xl border border-slate-200 p-5">
                  <p className="text-xs uppercase tracking-[0.16em] text-slate-400">
                    Webhook Log
                  </p>
                  <pre className="mt-3 overflow-x-auto rounded-2xl bg-slate-50 p-4 text-xs leading-6 text-slate-700">
                    {JSON.stringify(session.webhook_log || {}, null, 2)}
                  </pre>
                </div>
              </div>
            </section>
          </div>
        ) : null}
      </div>
    </main>
  );
}
