"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useAuthSession } from "@/lib/auth";
import { apiFetch } from "@/lib/api";

const statusOptions = [
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

function OrderStatusBadge({ status }) {
  const tones = {
    pending: "bg-amber-50 text-amber-700 border-amber-200",
    out_for_delivery: "bg-sky-50 text-sky-700 border-sky-200",
    delivered: "bg-indigo-50 text-indigo-700 border-indigo-200",
    no_complaints: "bg-emerald-50 text-emerald-700 border-emerald-200",
    completed: "bg-slate-950 text-white border-slate-900",
    cancelled: "bg-rose-50 text-rose-700 border-rose-200",
  };

  return (
    <span
      className={`inline-flex items-center rounded-full border px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] ${
        tones[status] || "bg-slate-100 text-slate-700 border-slate-200"
      }`}
    >
      {(status || "unknown").replaceAll("_", " ")}
    </span>
  );
}

function DetailMetric({ label, value, tone = "default" }) {
  const tones = {
    default: "border-slate-200 bg-white",
    warm: "border-orange-200/70 bg-[linear-gradient(180deg,_#fff7ed_0%,_#ffffff_100%)]",
    cool: "border-sky-200/70 bg-[linear-gradient(180deg,_#eff6ff_0%,_#ffffff_100%)]",
    soft: "border-slate-200 bg-[linear-gradient(180deg,_#f8fafc_0%,_#ffffff_100%)]",
  };

  return (
    <div className={`rounded-2xl border px-4 py-4 ${tones[tone]}`}>
      <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">
        {label}
      </p>
      <p className="mt-2 text-base font-semibold text-slate-950 break-words">
        {value || "-"}
      </p>
    </div>
  );
}

function FulfillmentTimeline({ steps }) {
  return (
    <div className="w-full max-w-full rounded-[20px] border border-slate-200 bg-[linear-gradient(180deg,_#ffffff_0%,_#f8fafc_100%)] p-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
            Fulfillment Timeline
          </p>
          <p className="mt-1.5 text-xs text-slate-500 sm:text-sm">
            Track each delivery milestone in order.
          </p>
        </div>
      </div>

      <div className="mt-5 flex max-w-full flex-col gap-3">
        {steps.map((step, index) => (
          <div
            key={step.label}
            className="flex min-w-0 items-start gap-3"
          >
            <div className="flex flex-col items-center">
              <span
                className={`inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full border text-sm font-semibold ${
                  step.active
                    ? "border-emerald-600 bg-emerald-600 text-white"
                    : "border-slate-200 bg-white text-slate-400"
                }`}
              >
                {step.active ? "✓" : index + 1}
              </span>
              {index < steps.length - 1 ? (
                <span
                  className={`mt-2 h-12 w-px ${
                    step.active ? "bg-emerald-300" : "bg-slate-200"
                  }`}
                />
              ) : null}
            </div>

            <div
              className={`min-w-0 flex-1 rounded-[18px] border px-4 py-3.5 ${
                step.active
                  ? "border-emerald-200 bg-[linear-gradient(180deg,_#f7fffb_0%,_#ecfdf5_100%)]"
                  : "border-slate-200 bg-white"
              }`}
            >
              <div className="flex items-center justify-between gap-3">
                <p className="text-sm font-semibold leading-5 text-slate-950">
                  {step.label}
                </p>
                <span
                  className={`inline-flex shrink-0 items-center rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.16em] ${
                    step.active
                      ? "bg-emerald-100 text-emerald-700"
                      : "bg-slate-100 text-slate-500"
                  }`}
                >
                  {step.active ? "Done" : "Open"}
                </span>
              </div>
              <p className="mt-1.5 text-xs font-medium uppercase tracking-[0.16em] text-slate-400">
                Step {index + 1} of {steps.length}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

async function fetchOrderDetail(orderId) {
  const response = await apiFetch(`/admin/orders/${orderId}/`, {
    headers: {
      Accept: "application/json",
    },
  });
  const data = await readApiResponse(response);

  if (!response.ok) {
    throw new Error(
      typeof data === "string" && data.trim().startsWith("<!DOCTYPE")
        ? "Backend returned HTML instead of JSON for the order detail. Check the Django server error or admin permission."
        : "Failed to load order detail.",
    );
  }

  return data;
}

export default function OrderDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { token, ready } = useAuthSession();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [statusDraft, setStatusDraft] = useState("");
  const [actionLoading, setActionLoading] = useState(false);

  async function updateOrderStatus() {
    if (!order || !statusDraft) {
      return;
    }

    setActionLoading(true);
    setError("");

    try {
      const response = await apiFetch(`/admin/orders/${order.id}/update-status/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status: statusDraft }),
      });
      const data = await readApiResponse(response);

      if (!response.ok) {
        throw new Error(getResponseErrorMessage(data, "Unable to update order status."));
      }

      setOrder(data);
      setStatusDraft(data?.status || "");
    } catch (actionError) {
      setError(actionError.message || "Unable to update order status.");
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
    if (!token || !params?.id) {
      return;
    }

    let active = true;

    async function run() {
      setLoading(true);
      setError("");

      try {
        const data = await fetchOrderDetail(params.id);
        if (!active) {
          return;
        }
        setOrder(data);
        setStatusDraft(data?.status || "");
      } catch (loadError) {
        if (active) {
          setError(loadError.message || "Unable to load order detail.");
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
          <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
            <div className="min-w-0">
              <p className="text-sm font-medium uppercase tracking-[0.24em] text-orange-500">
                Order Detail
              </p>
              <h1 className="mt-3 text-2xl font-semibold tracking-tight text-slate-950 sm:text-3xl">
                {order ? `Order #${order.id}` : "Order"}
              </h1>
            </div>
            <div className="flex w-full flex-col gap-3 sm:flex-row sm:items-end xl:w-auto xl:items-end">
              {order ? (
                <div className="flex w-full flex-col gap-3 sm:flex-row xl:w-auto">
                  <div className="min-w-[220px]">
                    <select
                      value={statusDraft}
                      onChange={(event) => setStatusDraft(event.target.value)}
                      className="h-12 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm text-slate-700 outline-none"
                    >
                      {statusOptions.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  <button
                    type="button"
                    onClick={updateOrderStatus}
                    disabled={actionLoading || statusDraft === order.status}
                    className="inline-flex h-12 items-center justify-center rounded-2xl bg-slate-950 px-5 text-sm font-medium text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-300"
                  >
                    {actionLoading ? "Updating..." : "Update Status"}
                  </button>
                </div>
              ) : null}
              <Link
                href="/orders"
                className="inline-flex h-12 items-center justify-center rounded-2xl border border-slate-200 bg-white px-5 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
              >
                Back To Orders
              </Link>
            </div>
          </div>
        </header>

        {loading ? (
          <div className="mt-8 rounded-[28px] border border-slate-200 bg-white px-6 py-5 text-sm text-slate-600 shadow-[0_10px_30px_rgba(15,23,42,0.06)]">
            Loading order...
          </div>
        ) : null}

        {error ? (
          <div className="mt-8 rounded-[28px] border border-rose-200 bg-rose-50 px-6 py-5 text-sm text-rose-700">
            {error}
          </div>
        ) : null}

        {order ? (
          <div className="mt-8 grid gap-6 xl:grid-cols-[minmax(0,1.15fr)_minmax(340px,0.85fr)]">
            <section className="space-y-6">
              <div className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-[0_12px_36px_rgba(15,23,42,0.06)] sm:p-6">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                  <div className="min-w-0">
                    <p className="text-xs font-semibold uppercase tracking-[0.22em] text-orange-500">
                      Order Information
                    </p>
                    <h2 className="mt-3 text-3xl font-semibold tracking-tight text-slate-950 sm:text-4xl">
                      #{order.id}
                    </h2>
                    <p className="mt-3 text-sm text-slate-600">
                      Created {formatDate(order.created_at)}
                    </p>
                  </div>
                  <OrderStatusBadge status={order.status} />
                </div>

                <div className="mt-6 grid gap-3 sm:grid-cols-2">
                  <DetailMetric label="Buyer" value={order.buyer_email} />
                  <DetailMetric label="Payment Status" value={order.payment_status} tone="soft" />
                  <DetailMetric label="Total Amount" value={order.total_amount} tone="warm" />
                  <DetailMetric label="Items" value={String(order.item_count)} tone="soft" />
                </div>
              </div>

              <div className="grid gap-6">
                <div className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-[0_10px_30px_rgba(15,23,42,0.05)] sm:p-6">
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
                    Shipping Details
                  </p>
                  <h3 className="mt-2 text-xl font-semibold text-slate-950">
                    Delivery Context
                  </h3>
                  <div className="mt-5 grid gap-3">
                    <DetailMetric label="Address" value={order.shipping_address_summary || "-"} />
                    <DetailMetric label="Last Updated" value={formatDate(order.updated_at)} tone="soft" />
                  </div>
                  <div className="mt-3">
                    <DetailMetric label="Payment Intent" value={order.payment_intent_id || "-"} tone="soft" />
                  </div>
                </div>
              </div>

            </section>

            <section className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-[0_12px_36px_rgba(15,23,42,0.06)] sm:p-6">
              <div className="rounded-[24px] bg-slate-50 p-5">
                <p className="text-sm font-medium uppercase tracking-[0.22em] text-sky-600">
                  Order Items
                </p>
                <h2 className="mt-3 text-2xl font-semibold text-slate-950 sm:text-3xl">
                  Items In This Order
                </h2>
                <p className="mt-2 text-sm text-slate-600">
                  Review each purchased product, seller, quantity, and fulfillment progress.
                </p>
              </div>

              {!order.items?.length ? (
                <div className="mt-6 rounded-2xl bg-slate-50 px-5 py-8 text-center text-sm text-slate-600">
                  No order items found.
                </div>
              ) : (
                <div className="mt-6 space-y-4">
                  {order.items.map((item) => (
                    <article
                      key={item.id}
                      className="w-full rounded-[24px] border border-slate-200 bg-white p-4 shadow-[0_10px_24px_rgba(15,23,42,0.05)] sm:p-5"
                    >
                      <div className="flex flex-col gap-4">
                        <div className="min-w-0">
                          <p className="text-xs font-medium uppercase tracking-[0.18em] text-slate-500">
                            Product
                          </p>
                          <h3 className="mt-2 text-lg font-semibold text-slate-950 sm:text-xl">
                            {item.product_title || `Product #${item.product}`}
                          </h3>
                          <p className="mt-2 text-sm text-slate-600">
                            Seller: {item.seller_email || "-"}
                          </p>
                        </div>

                        <div className="grid gap-3 sm:grid-cols-2">
                          <DetailMetric label="Quantity" value={String(item.quantity)} tone="soft" />
                          <DetailMetric
                            label="Price At Purchase"
                            value={item.price_at_purchase}
                            tone="warm"
                          />
                        </div>
                      </div>

                      <div className="mt-5">
                        <FulfillmentTimeline
                          steps={[
                            {
                              label: "Out For Delivery",
                              active: item.is_out_for_delivery,
                            },
                            {
                              label: "Delivered",
                              active: item.is_delivered,
                            },
                            {
                              label: "No Complaints",
                              active: item.is_no_complaints,
                            },
                          ]}
                        />
                      </div>
                    </article>
                  ))}
                </div>
              )}
            </section>
          </div>
        ) : null}
      </div>
    </main>
  );
}
