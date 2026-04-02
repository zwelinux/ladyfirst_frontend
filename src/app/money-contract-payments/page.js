"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { useAuthSession } from "@/lib/auth";
import { apiFetch } from "@/lib/api";

const statusOptions = [
  { value: "", label: "All Statuses" },
  { value: "pending", label: "Pending" },
  { value: "paid", label: "Paid" },
  { value: "approved", label: "Approved" },
  { value: "cancelled", label: "Cancelled" },
];


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

function SessionActionButton({
  children,
  tone,
  disabled,
  onClick,
  title,
}) {
  const tones = {
    neutral:
      "border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50",
    approve:
      "border-emerald-300/60 bg-[linear-gradient(135deg,_#10b981_0%,_#059669_100%)] text-white hover:brightness-105",
    credit:
      "border-slate-800 bg-[linear-gradient(135deg,_#111827_0%,_#1f2937_100%)] text-white hover:brightness-110",
    invalid:
      "border-rose-200 bg-[linear-gradient(180deg,_#fff1f2_0%,_#ffe4e6_100%)] text-rose-700 hover:border-rose-300 hover:bg-rose-50",
  };

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      title={title}
      aria-label={title}
      className={`inline-flex min-h-11 items-center justify-center rounded-2xl border px-4 py-2 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-50 ${tones[tone]}`}
    >
      {children}
    </button>
  );
}

export default function MoneyContractPaymentsPage() {
  const router = useRouter();
  const { token, user, ready } = useAuthSession();
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [actionLoadingId, setActionLoadingId] = useState(null);

  async function loadSessions() {
    setLoading(true);
    setError("");

    try {
      const response = await apiFetch("/admin/money-contract/payments/");
      const data = await readApiResponse(response);

      if (!response.ok) {
        throw new Error(
          typeof data === "string" && data.trim().startsWith("<!DOCTYPE")
            ? "Backend returned HTML instead of JSON for money contract payments. Check the Django server error or admin permission."
            : "Failed to load money contract payments.",
        );
      }

      setSessions(Array.isArray(data) ? data : []);
    } catch (loadError) {
      setError(loadError.message || "Unable to load money contract payments.");
    } finally {
      setLoading(false);
    }
  }

  async function runAction(sessionId, action) {
    setActionLoadingId(sessionId);
    setError("");

    try {
      const response = await apiFetch(
        `/admin/money-contract/payments/${sessionId}/${action}/`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({}),
        },
      );
      const data = await readApiResponse(response);

      if (!response.ok) {
        throw new Error(getResponseErrorMessage(data, "Unable to update session."));
      }

      await loadSessions();
    } catch (actionError) {
      setError(actionError.message || "Unable to update session.");
    } finally {
      setActionLoadingId(null);
    }
  }

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

    loadSessions();

    return () => {
      active = false;
    };
  }, [ready, token]);

  const filteredSessions = useMemo(() => {
    const keyword = search.trim().toLowerCase();

    return sessions.filter((session) => {
      const matchesStatus = !statusFilter || session.status === statusFilter;
      if (!matchesStatus) {
        return false;
      }

      if (!keyword) {
        return true;
      }

      return [
        session.id,
        session.user_email,
        session.product_title,
        session.ref1,
        session.payment_source,
      ]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(keyword));
    });
  }, [sessions, search, statusFilter]);

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
                Money Contract Payments
              </p>
              <h1 className="mt-3 text-3xl font-semibold tracking-tight text-slate-950">
                Payment Session List
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
            </div>
          </div>
        </header>

        <section className="mt-8 rounded-[28px] border border-slate-200 bg-white p-6 shadow-[0_10px_30px_rgba(15,23,42,0.06)]">
          <div className="grid gap-4 lg:grid-cols-[1fr_260px]">
            <label className="block">
              <div className="mb-3 text-sm font-medium text-slate-700">
                Search Sessions
              </div>
              <input
                type="text"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search by session id, user, product, ref1"
                className="h-14 w-full rounded-2xl border border-slate-200 bg-white px-5 text-base text-slate-900 shadow-sm outline-none placeholder:text-slate-400"
              />
            </label>

            <label className="block">
              <div className="mb-3 text-sm font-medium text-slate-700">Status</div>
              <div className="relative">
                <select
                  value={statusFilter}
                  onChange={(event) => setStatusFilter(event.target.value)}
                  className="h-14 w-full appearance-none rounded-2xl border border-slate-200 bg-white px-5 pr-12 text-base text-slate-700 shadow-sm outline-none"
                >
                  {statusOptions.map((option) => (
                    <option key={option.value || option.label} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
                <span className="pointer-events-none absolute right-5 top-1/2 -translate-y-1/2 text-slate-400">
                  ˅
                </span>
              </div>
            </label>
          </div>
        </section>

        <section className="mt-8 rounded-[28px] border border-slate-200 bg-white p-6 shadow-[0_10px_30px_rgba(15,23,42,0.06)]">
          <div>
            <p className="text-sm font-medium uppercase tracking-[0.2em] text-slate-500">
              Results
            </p>
            <h2 className="mt-2 text-2xl font-semibold text-slate-950">
              {filteredSessions.length} payment sessions
            </h2>
          </div>

          {loading ? (
            <div className="mt-6 rounded-2xl bg-slate-50 px-5 py-4 text-sm text-slate-600">
              Loading money contract payments...
            </div>
          ) : null}

          {error ? (
            <div className="mt-6 rounded-2xl border border-rose-200 bg-rose-50 px-5 py-4 text-sm text-rose-700">
              {error}
            </div>
          ) : null}

          {!loading && !error && filteredSessions.length === 0 ? (
            <div className="mt-6 rounded-2xl bg-slate-50 px-5 py-8 text-center text-sm text-slate-600">
              No payment sessions found.
            </div>
          ) : null}

          {!loading && !error && filteredSessions.length > 0 ? (
            <div className="mt-6 overflow-hidden rounded-2xl border border-slate-200">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-slate-200">
                  <thead className="bg-slate-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                        Session
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                        User
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                        Product
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                        Amount
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                        Source
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                        Status
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                        Created
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 bg-white">
                    {filteredSessions.map((session) => (
                      <tr key={session.id}>
                        <td className="px-4 py-4">
                          <Link
                            href={`/money-contract-payments/${session.id}`}
                            className="group inline-block"
                          >
                            <p className="font-medium text-slate-900 transition group-hover:text-orange-600">
                              #{session.id}
                            </p>
                            <p className="mt-1 text-sm text-slate-500 transition group-hover:text-slate-700">
                              {session.ref1 || "No ref1"}
                            </p>
                          </Link>
                        </td>
                        <td className="px-4 py-4 text-sm text-slate-700">
                          {session.user_email || `User #${session.user}`}
                        </td>
                        <td className="px-4 py-4 text-sm text-slate-700">
                          {session.product_title || `Product #${session.product}`}
                        </td>
                        <td className="px-4 py-4 text-sm text-slate-700">
                          {session.amount}
                        </td>
                        <td className="px-4 py-4 text-sm text-slate-700">
                          {session.payment_source}
                        </td>
                        <td className="px-4 py-4">
                          <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium uppercase text-slate-700">
                            {session.status}
                          </span>
                        </td>
                        <td className="px-4 py-4 text-sm text-slate-700">
                          {formatDate(session.created_at)}
                        </td>
                        <td className="px-4 py-4">
                          {session.status === "paid" ? (
                            <div className="inline-flex rounded-[22px] border border-slate-200 bg-slate-50/80 p-2">
                              <div className="flex flex-wrap gap-2">
                                <SessionActionButton
                                  tone="approve"
                                  disabled={actionLoadingId === session.id}
                                  onClick={() => runAction(session.id, "approve")}
                                  title="Approve winner and start money contract"
                                >
                                  {actionLoadingId === session.id ? "…" : "✓"}
                                </SessionActionButton>
                                <SessionActionButton
                                  tone="credit"
                                  disabled={actionLoadingId === session.id}
                                  onClick={() => runAction(session.id, "reject-credit")}
                                  title="Reject this session and credit the buyer wallet"
                                >
                                  ⌁
                                </SessionActionButton>
                                <SessionActionButton
                                  tone="invalid"
                                  disabled={actionLoadingId === session.id}
                                  onClick={() => runAction(session.id, "reject-invalid")}
                                  title="Reject this session as invalid or fraudulent"
                                >
                                  ⨯
                                </SessionActionButton>
                              </div>
                            </div>
                          ) : null}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ) : null}
        </section>
      </div>
    </main>
  );
}
