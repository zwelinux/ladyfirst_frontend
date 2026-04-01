"use client";

import Link from "next/link";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { clearAuthSession, useAuthSession } from "@/lib/auth";
import { apiFetch } from "@/lib/api";

export default function Home() {
  const router = useRouter();
  const { token, user, ready } = useAuthSession();

  useEffect(() => {
    if (ready && !token) {
      router.replace("/login");
    }
  }, [ready, router, token]);

  async function handleLogout() {
    try {
      await apiFetch("/logout/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({}),
      });
    } catch {}

    clearAuthSession();
    router.replace("/login");
  }

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
        <header className="rounded-[28px] border border-white/70 bg-white/80 px-6 py-5 shadow-[0_20px_60px_rgba(148,163,184,0.16)] backdrop-blur">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="text-sm font-medium uppercase tracking-[0.24em] text-orange-500">
                Admin Dashboard
              </p>
              <h1 className="mt-3 text-3xl font-semibold tracking-tight text-slate-950">
                Product Management
              </h1>
              <p className="mt-2 text-sm text-slate-600">
                Logged in as {user?.email || user?.username || "Admin"}.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <div className="flex h-11 min-w-11 items-center justify-center rounded-full bg-slate-950 px-3 text-sm font-semibold text-white">
                {(user?.email || user?.username || "AD")
                  .slice(0, 2)
                  .toUpperCase()}
              </div>
              <button
                type="button"
                onClick={handleLogout}
                className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
              >
                Logout
              </button>
            </div>
          </div>
        </header>

        <section className="mt-8 grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
          <div className="rounded-[30px] border border-slate-200 bg-white p-8 shadow-[0_10px_30px_rgba(15,23,42,0.06)]">
            <p className="text-sm font-medium uppercase tracking-[0.24em] text-orange-500">
              Product Upload
            </p>
            <h2 className="mt-3 text-3xl font-semibold text-slate-950">
              Upload products on behalf of users
            </h2>
            <p className="mt-4 max-w-2xl text-base text-slate-600">
              Use the dedicated upload form to select a seller, enter product
              details, attach up to 6 images, assign category and tags, and
              submit directly to the backend.
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link
                href="/products"
                className="inline-flex items-center justify-center rounded-2xl border border-slate-200 bg-white px-6 py-3 text-base font-medium text-slate-700 transition hover:bg-slate-50"
              >
                View Products
              </Link>
              <Link
                href="/products/upload"
                className="inline-flex items-center justify-center rounded-2xl bg-orange-500 px-6 py-3 text-base font-medium text-white transition hover:bg-orange-600"
              >
                Open Product Upload
              </Link>
            </div>
          </div>

          <div className="rounded-[30px] border border-slate-200 bg-white p-8 shadow-[0_10px_30px_rgba(15,23,42,0.06)]">
            <p className="text-sm font-medium uppercase tracking-[0.24em] text-slate-500">
              Notes
            </p>
            <div className="mt-6 space-y-4 text-sm text-slate-600">
              <p>Staff login is required before product upload.</p>
              <p>The upload page uses the stored session automatically.</p>
              <p>Seller selection maps to `seller_id` in the backend API.</p>
              <p>Images, tags, category, and measurements are sent to Django directly.</p>
            </div>
          </div>
        </section>

        <section className="mt-6 grid gap-6 lg:grid-cols-2">
          <div className="rounded-[30px] border border-slate-200 bg-white p-8 shadow-[0_10px_30px_rgba(15,23,42,0.06)]">
            <p className="text-sm font-medium uppercase tracking-[0.24em] text-orange-500">
              Coupons
            </p>
            <h2 className="mt-3 text-3xl font-semibold text-slate-950">
              Coupon list
            </h2>
            <p className="mt-4 text-base text-slate-600">
              Review coupon codes, assigned users, amounts, expiry dates, and active status.
            </p>
            <div className="mt-8">
              <Link
                href="/coupons"
                className="inline-flex items-center justify-center rounded-2xl bg-slate-950 px-6 py-3 text-base font-medium text-white transition hover:bg-slate-800"
              >
                Open Coupons
              </Link>
            </div>
          </div>

          <div className="rounded-[30px] border border-slate-200 bg-white p-8 shadow-[0_10px_30px_rgba(15,23,42,0.06)]">
            <p className="text-sm font-medium uppercase tracking-[0.24em] text-orange-500">
              Coupon Usages
            </p>
            <h2 className="mt-3 text-3xl font-semibold text-slate-950">
              Coupon usage list
            </h2>
            <p className="mt-4 text-base text-slate-600">
              Review which user used which coupon and when it was consumed.
            </p>
            <div className="mt-8">
              <Link
                href="/coupon-usages"
                className="inline-flex items-center justify-center rounded-2xl bg-slate-950 px-6 py-3 text-base font-medium text-white transition hover:bg-slate-800"
              >
                Open Coupon Usages
              </Link>
            </div>
          </div>

          <div className="rounded-[30px] border border-slate-200 bg-white p-8 shadow-[0_10px_30px_rgba(15,23,42,0.06)]">
            <p className="text-sm font-medium uppercase tracking-[0.24em] text-orange-500">
              Donation Payments
            </p>
            <h2 className="mt-3 text-3xl font-semibold text-slate-950">
              Donation payment list
            </h2>
            <p className="mt-4 text-base text-slate-600">
              Review donation payment totals, wallet deductions, receipts, and approval status.
            </p>
            <div className="mt-8">
              <Link
                href="/donation-payments"
                className="inline-flex items-center justify-center rounded-2xl bg-slate-950 px-6 py-3 text-base font-medium text-white transition hover:bg-slate-800"
              >
                Open Donation Payments
              </Link>
            </div>
          </div>

          <div className="rounded-[30px] border border-slate-200 bg-white p-8 shadow-[0_10px_30px_rgba(15,23,42,0.06)]">
            <p className="text-sm font-medium uppercase tracking-[0.24em] text-orange-500">
              Relist Payments
            </p>
            <h2 className="mt-3 text-3xl font-semibold text-slate-950">
              Relist payment list
            </h2>
            <p className="mt-4 text-base text-slate-600">
              Review relist payment totals, QR amounts, receipts, and approval status.
            </p>
            <div className="mt-8">
              <Link
                href="/relist-payments"
                className="inline-flex items-center justify-center rounded-2xl bg-slate-950 px-6 py-3 text-base font-medium text-white transition hover:bg-slate-800"
              >
                Open Relist Payments
              </Link>
            </div>
          </div>

          <div className="rounded-[30px] border border-slate-200 bg-white p-8 shadow-[0_10px_30px_rgba(15,23,42,0.06)]">
            <p className="text-sm font-medium uppercase tracking-[0.24em] text-orange-500">
              Return Payments
            </p>
            <h2 className="mt-3 text-3xl font-semibold text-slate-950">
              Return payment list
            </h2>
            <p className="mt-4 text-base text-slate-600">
              Review delivery charges, wallet deductions, receipts, and return payment status.
            </p>
            <div className="mt-8">
              <Link
                href="/return-payments"
                className="inline-flex items-center justify-center rounded-2xl bg-slate-950 px-6 py-3 text-base font-medium text-white transition hover:bg-slate-800"
              >
                Open Return Payments
              </Link>
            </div>
          </div>

          <div className="rounded-[30px] border border-slate-200 bg-white p-8 shadow-[0_10px_30px_rgba(15,23,42,0.06)]">
            <p className="text-sm font-medium uppercase tracking-[0.24em] text-orange-500">
              Money Contract Payments
            </p>
            <h2 className="mt-3 text-3xl font-semibold text-slate-950">
              Money contract payment sessions
            </h2>
            <p className="mt-4 text-base text-slate-600">
              Review payment sessions, refs, slips, status changes, and webhook metadata for money contracts.
            </p>
            <div className="mt-8">
              <Link
                href="/money-contract-payments"
                className="inline-flex items-center justify-center rounded-2xl bg-slate-950 px-6 py-3 text-base font-medium text-white transition hover:bg-slate-800"
              >
                Open Money Contract Payments
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

          <div className="rounded-[30px] border border-slate-200 bg-white p-8 shadow-[0_10px_30px_rgba(15,23,42,0.06)]">
            <p className="text-sm font-medium uppercase tracking-[0.24em] text-orange-500">
              Pickup Schedules
            </p>
            <h2 className="mt-3 text-3xl font-semibold text-slate-950">
              Pickup schedule list
            </h2>
            <p className="mt-4 text-base text-slate-600">
              Review booked pickup dates, time slots, phone numbers, and linked Send To Us sessions.
            </p>
            <div className="mt-8">
              <Link
                href="/pickup-schedules"
                className="inline-flex items-center justify-center rounded-2xl bg-slate-950 px-6 py-3 text-base font-medium text-white transition hover:bg-slate-800"
              >
                Open Pickup Schedules
              </Link>
            </div>
          </div>

          <div className="rounded-[30px] border border-slate-200 bg-white p-8 shadow-[0_10px_30px_rgba(15,23,42,0.06)]">
            <p className="text-sm font-medium uppercase tracking-[0.24em] text-orange-500">
              Orders
            </p>
            <h2 className="mt-3 text-3xl font-semibold text-slate-950">
              Orders and order items
            </h2>
            <p className="mt-4 text-base text-slate-600">
              Review buyer orders, payment status, shipping details, receipts, and all items inside each order.
            </p>
            <div className="mt-8">
              <Link
                href="/orders"
                className="inline-flex items-center justify-center rounded-2xl bg-slate-950 px-6 py-3 text-base font-medium text-white transition hover:bg-slate-800"
              >
                Open Orders
              </Link>
            </div>
          </div>

          <div className="rounded-[30px] border border-slate-200 bg-white p-8 shadow-[0_10px_30px_rgba(15,23,42,0.06)]">
            <p className="text-sm font-medium uppercase tracking-[0.24em] text-orange-500">
              Users
            </p>
            <h2 className="mt-3 text-3xl font-semibold text-slate-950">
              User list
            </h2>
            <p className="mt-4 text-base text-slate-600">
              Browse user accounts, setup status, and product activity counts.
            </p>
            <div className="mt-8">
              <Link
                href="/users"
                className="inline-flex items-center justify-center rounded-2xl bg-slate-950 px-6 py-3 text-base font-medium text-white transition hover:bg-slate-800"
              >
                Open Users
              </Link>
            </div>
          </div>

          <div className="rounded-[30px] border border-slate-200 bg-white p-8 shadow-[0_10px_30px_rgba(15,23,42,0.06)]">
            <p className="text-sm font-medium uppercase tracking-[0.24em] text-orange-500">
              Wallets
            </p>
            <h2 className="mt-3 text-3xl font-semibold text-slate-950">
              Admin wallet list
            </h2>
            <p className="mt-4 text-base text-slate-600">
              View all user wallets and the system wallet with current balances.
            </p>
            <div className="mt-8">
              <Link
                href="/wallets"
                className="inline-flex items-center justify-center rounded-2xl bg-slate-950 px-6 py-3 text-base font-medium text-white transition hover:bg-slate-800"
              >
                Open Wallets
              </Link>
            </div>
          </div>

          <div className="rounded-[30px] border border-slate-200 bg-white p-8 shadow-[0_10px_30px_rgba(15,23,42,0.06)]">
            <p className="text-sm font-medium uppercase tracking-[0.24em] text-orange-500">
              Transactions
            </p>
            <h2 className="mt-3 text-3xl font-semibold text-slate-950">
              Wallet transaction list
            </h2>
            <p className="mt-4 text-base text-slate-600">
              Review credits, debits, references, and running balances across wallets.
            </p>
            <div className="mt-8">
              <Link
                href="/wallet-transactions"
                className="inline-flex items-center justify-center rounded-2xl bg-slate-950 px-6 py-3 text-base font-medium text-white transition hover:bg-slate-800"
              >
                Open Transactions
              </Link>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
