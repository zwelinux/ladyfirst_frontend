"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useAuthSession } from "@/lib/auth";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://127.0.0.1:8000/api/auth";

function buildApiUrl(path) {
  return `${API_BASE_URL.replace(/\/$/, "")}/${path.replace(/^\//, "")}`;
}

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

export default function OrderDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { token } = useAuthSession();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!token) {
      router.replace("/login");
    }
  }, [router, token]);

  useEffect(() => {
    if (!token || !params?.id) {
      return;
    }

    let active = true;

    async function loadOrder() {
      setLoading(true);
      setError("");

      try {
        const response = await fetch(buildApiUrl(`/admin/orders/${params.id}/`), {
          headers: {
            Accept: "application/json",
            Authorization: `Bearer ${token}`,
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

        if (active) {
          setOrder(data);
        }
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

    loadOrder();

    return () => {
      active = false;
    };
  }, [params, token]);

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
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-sm font-medium uppercase tracking-[0.24em] text-orange-500">
                Order Detail
              </p>
              <h1 className="mt-3 text-3xl font-semibold tracking-tight text-slate-950">
                {order ? `Order #${order.id}` : "Order"}
              </h1>
            </div>
            <Link
              href="/orders"
              className="inline-flex items-center justify-center rounded-2xl border border-slate-200 bg-white px-5 py-3 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
            >
              Back To Orders
            </Link>
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
          <div className="mt-8 grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
            <section className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-[0_10px_30px_rgba(15,23,42,0.06)]">
              <div className="rounded-[24px] bg-[linear-gradient(135deg,_#fff7ed_0%,_#f8fafc_100%)] p-5">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <p className="text-sm font-medium uppercase tracking-[0.22em] text-orange-500">
                      Order Information
                    </p>
                    <h2 className="mt-3 text-3xl font-semibold text-slate-950">
                      #{order.id}
                    </h2>
                    <p className="mt-2 text-sm text-slate-600">
                      Created {formatDate(order.created_at)}
                    </p>
                  </div>
                  <span className="inline-flex items-center rounded-full bg-slate-100 px-4 py-2 text-sm font-medium uppercase text-slate-700">
                    {order.status}
                  </span>
                </div>
              </div>

              <div className="mt-6 grid gap-4 sm:grid-cols-2">
                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                  <p className="text-xs font-medium uppercase tracking-[0.18em] text-slate-500">
                    Buyer
                  </p>
                  <p className="mt-3 text-base font-medium text-slate-900">
                    {order.buyer_email || "-"}
                  </p>
                </div>
                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                  <p className="text-xs font-medium uppercase tracking-[0.18em] text-slate-500">
                    Payment Status
                  </p>
                  <p className="mt-3 text-base font-medium text-slate-900">
                    {order.payment_status || "-"}
                  </p>
                </div>
                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                  <p className="text-xs font-medium uppercase tracking-[0.18em] text-slate-500">
                    Total Amount
                  </p>
                  <p className="mt-3 text-base font-medium text-slate-900">
                    {order.total_amount}
                  </p>
                </div>
                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                  <p className="text-xs font-medium uppercase tracking-[0.18em] text-slate-500">
                    Items
                  </p>
                  <p className="mt-3 text-base font-medium text-slate-900">
                    {order.item_count}
                  </p>
                </div>
              </div>

              <div className="mt-6 rounded-2xl border border-slate-200 p-5">
                <p className="text-sm font-medium uppercase tracking-[0.18em] text-slate-500">
                  Shipping Details
                </p>
                <div className="mt-5 space-y-4">
                  <div>
                    <p className="text-xs uppercase tracking-[0.16em] text-slate-400">
                      Address
                    </p>
                    <p className="mt-1 text-base leading-7 text-slate-900">
                      {order.shipping_address_summary || "-"}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-[0.16em] text-slate-400">
                      Last Updated
                    </p>
                    <p className="mt-1 text-base font-medium text-slate-900">
                      {formatDate(order.updated_at)}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-[0.16em] text-slate-400">
                      Payment Intent
                    </p>
                    <p className="mt-1 text-base font-medium text-slate-900 break-all">
                      {order.payment_intent_id || "-"}
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-6 rounded-2xl border border-slate-200 p-5">
                <p className="text-sm font-medium uppercase tracking-[0.18em] text-slate-500">
                  Payment Receipt
                </p>
                <div className="mt-4">
                  {order.receipt_image_url ? (
                    <a
                      href={order.receipt_image_url}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center justify-center rounded-2xl bg-slate-950 px-5 py-3 text-sm font-medium text-white transition hover:bg-slate-800"
                    >
                      View Receipt
                    </a>
                  ) : (
                    <p className="text-sm text-slate-600">No receipt uploaded.</p>
                  )}
                </div>
              </div>
            </section>

            <section className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-[0_10px_30px_rgba(15,23,42,0.06)]">
              <div className="rounded-[24px] bg-[linear-gradient(135deg,_#eff6ff_0%,_#f8fafc_100%)] p-5">
                <p className="text-sm font-medium uppercase tracking-[0.22em] text-sky-600">
                  Order Items
                </p>
                <h2 className="mt-3 text-3xl font-semibold text-slate-950">
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
                      className="rounded-[24px] border border-slate-200 bg-white p-5 shadow-[0_10px_24px_rgba(15,23,42,0.06)]"
                    >
                      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                        <div>
                          <p className="text-xs font-medium uppercase tracking-[0.18em] text-slate-500">
                            Product
                          </p>
                          <h3 className="mt-2 text-xl font-semibold text-slate-950">
                            {item.product_title || `Product #${item.product}`}
                          </h3>
                          <p className="mt-2 text-sm text-slate-600">
                            Seller: {item.seller_email || "-"}
                          </p>
                        </div>

                        <div className="grid gap-3 sm:grid-cols-2 lg:min-w-[320px]">
                          <div className="rounded-2xl bg-slate-50 px-4 py-3">
                            <p className="text-xs uppercase tracking-[0.16em] text-slate-400">
                              Quantity
                            </p>
                            <p className="mt-1 text-base font-medium text-slate-900">
                              {item.quantity}
                            </p>
                          </div>
                          <div className="rounded-2xl bg-slate-50 px-4 py-3">
                            <p className="text-xs uppercase tracking-[0.16em] text-slate-400">
                              Price At Purchase
                            </p>
                            <p className="mt-1 text-base font-medium text-slate-900">
                              {item.price_at_purchase}
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                        <div className="rounded-2xl border border-slate-200 px-4 py-3">
                          <p className="text-xs uppercase tracking-[0.16em] text-slate-400">
                            Out For Delivery
                          </p>
                          <p className="mt-1 text-sm font-medium text-slate-900">
                            {item.is_out_for_delivery ? "Yes" : "No"}
                          </p>
                        </div>
                        <div className="rounded-2xl border border-slate-200 px-4 py-3">
                          <p className="text-xs uppercase tracking-[0.16em] text-slate-400">
                            Delivered
                          </p>
                          <p className="mt-1 text-sm font-medium text-slate-900">
                            {item.is_delivered ? "Yes" : "No"}
                          </p>
                        </div>
                        <div className="rounded-2xl border border-slate-200 px-4 py-3">
                          <p className="text-xs uppercase tracking-[0.16em] text-slate-400">
                            No Complaints
                          </p>
                          <p className="mt-1 text-sm font-medium text-slate-900">
                            {item.is_no_complaints ? "Yes" : "No"}
                          </p>
                        </div>
                        <div className="rounded-2xl border border-slate-200 px-4 py-3">
                          <p className="text-xs uppercase tracking-[0.16em] text-slate-400">
                            Money Ready
                          </p>
                          <p className="mt-1 text-sm font-medium text-slate-900">
                            {item.is_money_ready ? "Yes" : "No"}
                          </p>
                        </div>
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
