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

function getResponseErrorMessage(data, fallback) {
  if (typeof data === "string") {
    if (data.trim().startsWith("<!DOCTYPE")) {
      return "Backend returned HTML instead of JSON. Check the Django route, permission, or server error.";
    }
    return data || fallback;
  }

  if (data?.detail) {
    return data.detail;
  }

  if (data?.error) {
    return data.error;
  }

  return fallback;
}

function formatDate(value) {
  if (!value) {
    return "-";
  }

  return new Date(value).toLocaleString();
}

export default function WalletTransactionDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { token, ready } = useAuthSession();
  const [transaction, setTransaction] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [actionLoading, setActionLoading] = useState(false);

  async function updateStatus(status) {
    setActionLoading(true);
    setError("");

    try {
      const response = await apiFetch(`/admin/wallet/transactions/${params.id}/update-status/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status }),
      });
      const data = await readApiResponse(response);

      if (!response.ok) {
        throw new Error(getResponseErrorMessage(data, "Unable to update wallet transaction."));
      }

      setTransaction(data);
    } catch (actionError) {
      setError(actionError.message || "Unable to update wallet transaction.");
    } finally {
      setActionLoading(false);
    }
  }

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

    async function run() {
      setLoading(true);
      setError("");

      try {
        const response = await apiFetch(`/admin/wallet/transactions/${params.id}/`);
        const data = await readApiResponse(response);

        if (!response.ok) {
          throw new Error(getResponseErrorMessage(data, "Failed to load wallet transaction."));
        }

        if (active) {
          setTransaction(data);
        }
      } catch (loadError) {
        if (active) {
          setError(loadError.message || "Unable to load wallet transaction.");
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    run();

    return () => {
      active = false;
    };
  }, [ready, token, params]);

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
      <div className="mx-auto max-w-5xl px-5 py-8 lg:px-8">
        <header className="rounded-[28px] border border-white/70 bg-white/85 px-6 py-5 shadow-[0_20px_60px_rgba(148,163,184,0.16)]">
          <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
            <div>
              <p className="text-sm font-medium uppercase tracking-[0.24em] text-orange-500">
                Wallet Transaction
              </p>
              <h1 className="mt-3 text-2xl font-semibold tracking-tight text-slate-950 sm:text-3xl">
                {transaction ? `#${transaction.id}` : "Detail"}
              </h1>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row xl:items-center">
              {transaction?.tx_type === "withdraw" && transaction?.status === "pending" ? (
                <>
                  <button
                    type="button"
                    onClick={() => updateStatus("approved")}
                    disabled={actionLoading}
                    className="inline-flex h-12 items-center justify-center rounded-2xl bg-emerald-600 px-5 text-sm font-medium text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:bg-emerald-300"
                  >
                    {actionLoading ? "Updating..." : "Approve"}
                  </button>
                  <button
                    type="button"
                    onClick={() => updateStatus("rejected")}
                    disabled={actionLoading}
                    className="inline-flex h-12 items-center justify-center rounded-2xl bg-rose-600 px-5 text-sm font-medium text-white transition hover:bg-rose-700 disabled:cursor-not-allowed disabled:bg-rose-300"
                  >
                    {actionLoading ? "Updating..." : "Reject And Refund"}
                  </button>
                </>
              ) : null}
              <Link
                href="/wallet-transactions"
                className="inline-flex h-12 items-center justify-center rounded-2xl border border-slate-200 bg-white px-5 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
              >
                Back To Transactions
              </Link>
            </div>
          </div>
        </header>

        {loading ? (
          <div className="mt-8 rounded-[28px] border border-slate-200 bg-white px-6 py-5 text-sm text-slate-600 shadow-[0_10px_30px_rgba(15,23,42,0.06)]">
            Loading wallet transaction...
          </div>
        ) : null}

        {error ? (
          <div className="mt-8 rounded-[28px] border border-rose-200 bg-rose-50 px-6 py-5 text-sm text-rose-700">
            {error}
          </div>
        ) : null}

        {transaction ? (
          <section className="mt-8 rounded-[28px] border border-slate-200 bg-white p-6 shadow-[0_10px_30px_rgba(15,23,42,0.06)]">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-400">
                  Transaction Overview
                </p>
                <h2 className="mt-2 text-2xl font-semibold text-slate-950">
                  {transaction.wallet_owner_email} · {transaction.wallet_name}
                </h2>
                <p className="mt-2 text-sm text-slate-600">
                  {transaction.tx_type} {transaction.sign > 0 ? "+" : "-"}
                  {transaction.amount} at {formatDate(transaction.created_at)}
                </p>
              </div>
              <span className="inline-flex items-center rounded-full bg-slate-100 px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-slate-700">
                {transaction.status || "approved"}
              </span>
            </div>

            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">Wallet</p>
                <p className="mt-2 text-sm font-medium text-slate-900">
                  {transaction.wallet_owner_email} · {transaction.wallet_name}
                </p>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">Tx Type</p>
                <p className="mt-2 text-sm font-medium text-slate-900">{transaction.tx_type}</p>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">Amount</p>
                <p className="mt-2 text-sm font-medium text-slate-900">{transaction.amount}</p>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">Sign</p>
                <p className="mt-2 text-sm font-medium text-slate-900">{transaction.sign}</p>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">Running Balance</p>
                <p className="mt-2 text-sm font-medium text-slate-900">{transaction.running_balance}</p>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">Reference</p>
                <p className="mt-2 text-sm font-medium text-slate-900">{transaction.reference || "-"}</p>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 sm:col-span-2">
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">Note</p>
                <p className="mt-2 text-sm font-medium text-slate-900">{transaction.note || "-"}</p>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 sm:col-span-2">
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">Meta</p>
                <pre className="mt-2 overflow-x-auto whitespace-pre-wrap break-words text-sm text-slate-700">
                  {JSON.stringify(transaction.meta || {}, null, 2)}
                </pre>
              </div>
            </div>

          </section>
        ) : null}
      </div>
    </main>
  );
}
