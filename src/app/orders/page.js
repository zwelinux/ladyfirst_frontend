"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { useAuthSession } from "@/lib/auth";
import { apiFetch } from "@/lib/api";

const statusOptions = [
  { value: "", label: "All Statuses" },
  { value: "pending", label: "Pending" },
  { value: "out_for_delivery", label: "Out For Delivery" },
  { value: "delivered", label: "Delivered" },
  { value: "no_complaints", label: "No Complaints" },
  { value: "completed", label: "Completed" },
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

function formatDate(value) {
  if (!value) {
    return "-";
  }

  return new Date(value).toLocaleString();
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

  if (Array.isArray(data?.status) && data.status[0]) {
    return data.status[0];
  }

  return fallback;
}

export default function OrdersPage() {
  const router = useRouter();
  const { token, user, ready } = useAuthSession();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [draftStatuses, setDraftStatuses] = useState({});
  const [actionLoadingId, setActionLoadingId] = useState(null);

  async function loadOrders() {
    setLoading(true);
    setError("");

    try {
      const response = await apiFetch("/admin/orders/", {
        headers: {
          Accept: "application/json",
        },
      });
      const data = await readApiResponse(response);

      if (!response.ok) {
        throw new Error(
          typeof data === "string" && data.trim().startsWith("<!DOCTYPE")
            ? "Backend returned HTML instead of JSON for orders. Check the Django server error or admin permission."
            : "Failed to load orders.",
        );
      }

      setOrders(Array.isArray(data) ? data : []);
    } catch (loadError) {
      setError(loadError.message || "Unable to load orders.");
    } finally {
      setLoading(false);
    }
  }

  async function updateOrderStatus(orderId) {
    const nextStatus = draftStatuses[orderId];
    if (!nextStatus) {
      return;
    }

    setActionLoadingId(orderId);
    setError("");

    try {
      const response = await apiFetch(`/admin/orders/${orderId}/update-status/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status: nextStatus }),
      });
      const data = await readApiResponse(response);

      if (!response.ok) {
        throw new Error(getResponseErrorMessage(data, "Unable to update order status."));
      }

      await loadOrders();
    } catch (actionError) {
      setError(actionError.message || "Unable to update order status.");
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

    loadOrders();
  }, [ready, token]);

  const filteredOrders = useMemo(() => {
    const keyword = search.trim().toLowerCase();

    return orders.filter((order) => {
      const matchesStatus = !statusFilter || order.status === statusFilter;

      if (!matchesStatus) {
        return false;
      }

      if (!keyword) {
        return true;
      }

      return [
        order.id,
        order.buyer_email,
        order.payment_status,
        order.payment_intent_id,
        order.shipping_address_summary,
      ]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(keyword));
    });
  }, [orders, search, statusFilter]);

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
                Orders
              </p>
              <h1 className="mt-3 text-3xl font-semibold tracking-tight text-slate-950">
                Order List
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
                Search Orders
              </div>
              <input
                type="text"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search by order id, buyer, payment status, address"
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
              {filteredOrders.length} orders
            </h2>
          </div>

          {loading ? (
            <div className="mt-6 rounded-2xl bg-slate-50 px-5 py-4 text-sm text-slate-600">
              Loading orders...
            </div>
          ) : null}

          {error ? (
            <div className="mt-6 rounded-2xl border border-rose-200 bg-rose-50 px-5 py-4 text-sm text-rose-700">
              {error}
            </div>
          ) : null}

          {!loading && !error && filteredOrders.length === 0 ? (
            <div className="mt-6 rounded-2xl bg-slate-50 px-5 py-8 text-center text-sm text-slate-600">
              No orders found.
            </div>
          ) : null}

          {!loading && !error && filteredOrders.length > 0 ? (
            <div className="mt-6 overflow-hidden rounded-2xl border border-slate-200">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-slate-200">
                  <thead className="bg-slate-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                        Order
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                        Buyer
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                        Status
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                        Payment
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                        Items
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                        Total
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                        Created
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                        Action
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 bg-white">
                    {filteredOrders.map((order) => (
                      <tr key={order.id}>
                        <td className="px-4 py-4">
                          <div>
                            <p className="font-medium text-slate-900">#{order.id}</p>
                            <p className="mt-1 text-sm text-slate-500">
                              {order.payment_intent_id || "No payment intent"}
                            </p>
                          </div>
                        </td>
                        <td className="px-4 py-4 text-sm text-slate-700">
                          {order.buyer_email || "-"}
                        </td>
                        <td className="px-4 py-4">
                          <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium uppercase text-slate-700">
                            {order.status}
                          </span>
                        </td>
                        <td className="px-4 py-4 text-sm text-slate-700">
                          {order.payment_status || "-"}
                        </td>
                        <td className="px-4 py-4 text-sm text-slate-700">
                          {order.item_count}
                        </td>
                        <td className="px-4 py-4 text-sm text-slate-700">
                          {order.total_amount}
                        </td>
                        <td className="px-4 py-4 text-sm text-slate-700">
                          {formatDate(order.created_at)}
                        </td>
                        <td className="px-4 py-4">
                          <div className="flex min-w-[220px] flex-col gap-2">
                            <div className="flex items-center gap-2">
                              <select
                                value={draftStatuses[order.id] || order.status}
                                onChange={(event) =>
                                  setDraftStatuses((current) => ({
                                    ...current,
                                    [order.id]: event.target.value,
                                  }))
                                }
                                className="h-10 min-w-0 flex-1 rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-700 outline-none"
                              >
                                {statusOptions
                                  .filter((option) => option.value)
                                  .map((option) => (
                                    <option key={option.value} value={option.value}>
                                      {option.label}
                                    </option>
                                  ))}
                              </select>
                              <button
                                type="button"
                                onClick={() => updateOrderStatus(order.id)}
                                disabled={actionLoadingId === order.id || (draftStatuses[order.id] || order.status) === order.status}
                                className="inline-flex h-10 shrink-0 items-center justify-center rounded-xl bg-slate-950 px-3 text-sm font-medium text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-300"
                              >
                                {actionLoadingId === order.id ? "..." : "Save"}
                              </button>
                            </div>
                            <Link
                              href={`/orders/${order.id}`}
                              className="text-sm font-medium text-slate-600 transition hover:text-slate-950"
                            >
                              Open detail
                            </Link>
                          </div>
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
