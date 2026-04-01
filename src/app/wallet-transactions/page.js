"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { useAuthSession } from "@/lib/auth";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://127.0.0.1:8000/api/auth";

function buildApiUrl(path) {
  return `${API_BASE_URL.replace(/\/$/, "")}/${path.replace(/^\//, "")}`;
}

export default function WalletTransactionsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { token, user } = useAuthSession();
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [walletId, setWalletId] = useState(searchParams.get("wallet") || "");

  useEffect(() => {
    if (!token) {
      router.replace("/login");
    }
  }, [router, token]);

  useEffect(() => {
    if (!token) {
      return;
    }

    let active = true;

    async function loadTransactions() {
      setLoading(true);
      setError("");

      try {
        const query = new URLSearchParams();
        if (walletId) {
          query.set("wallet", walletId);
        }

        const response = await fetch(
          buildApiUrl(`/admin/wallet/transactions/${query.toString() ? `?${query.toString()}` : ""}`),
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          },
        );
        const data = await response.json();

        if (!response.ok) {
          throw new Error("Failed to load wallet transactions.");
        }

        if (active) {
          setTransactions(Array.isArray(data) ? data : []);
        }
      } catch (loadError) {
        if (active) {
          setError(loadError.message || "Unable to load wallet transactions.");
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    loadTransactions();

    return () => {
      active = false;
    };
  }, [token, walletId]);

  if (!token) {
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
                Wallet Transactions
              </p>
              <h1 className="mt-3 text-3xl font-semibold tracking-tight text-slate-950">
                Transaction List
              </h1>
              <p className="mt-2 text-sm text-slate-600">
                Logged in as {user?.email || user?.username || "Admin"}.
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <Link
                href="/wallets"
                className="inline-flex items-center justify-center rounded-2xl border border-slate-200 bg-white px-5 py-3 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
              >
                Back To Wallets
              </Link>
            </div>
          </div>
        </header>

        <section className="mt-8 rounded-[28px] border border-slate-200 bg-white p-6 shadow-[0_10px_30px_rgba(15,23,42,0.06)]">
          <div className="max-w-xs">
            <label className="block">
              <div className="mb-3 text-sm font-medium text-slate-700">
                Filter By Wallet ID
              </div>
              <input
                type="text"
                value={walletId}
                onChange={(event) => setWalletId(event.target.value)}
                placeholder="Enter wallet id"
                className="h-14 w-full rounded-2xl border border-slate-200 bg-white px-5 text-base text-slate-900 shadow-sm outline-none placeholder:text-slate-400"
              />
            </label>
          </div>

          <div className="mt-6">
            {loading ? (
              <div className="rounded-2xl bg-slate-50 px-5 py-4 text-sm text-slate-600">
                Loading transactions...
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
                          Wallet
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                          Owner
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                          Type
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                          Amount
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                          Running Balance
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                          Reference
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                          Created
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 bg-white">
                      {transactions.map((tx) => (
                        <tr key={tx.id}>
                          <td className="px-4 py-4 text-sm font-medium text-slate-900">
                            {tx.wallet_name} #{tx.wallet_id}
                          </td>
                          <td className="px-4 py-4 text-sm text-slate-700">
                            {tx.wallet_owner_email || "-"}
                          </td>
                          <td className="px-4 py-4 text-sm text-slate-700">
                            {tx.tx_type}
                          </td>
                          <td className="px-4 py-4 text-sm text-slate-700">
                            {tx.sign > 0 ? "+" : "-"}
                            {tx.amount}
                          </td>
                          <td className="px-4 py-4 text-sm text-slate-700">
                            {tx.running_balance}
                          </td>
                          <td className="px-4 py-4 text-sm text-slate-700">
                            {tx.reference || "-"}
                          </td>
                          <td className="px-4 py-4 text-sm text-slate-700">
                            {tx.created_at
                              ? new Date(tx.created_at).toLocaleString()
                              : "-"}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        </section>
      </div>
    </main>
  );
}
