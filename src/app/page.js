"use client";

import Link from "next/link";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { clearAuthSession, useAuthSession } from "@/lib/auth";
import { apiFetch } from "@/lib/api";

const primaryActions = [
  {
    eyebrow: "Launch",
    title: "Upload Product",
    description: "Open the full seller-assisted upload flow with images, tags, category, and measurements.",
    href: "/products/upload",
    cta: "Open Upload",
    accent:
      "bg-[linear-gradient(135deg,_#f97316_0%,_#fb923c_100%)] text-white border-orange-300/40",
  },
  {
    eyebrow: "Catalog",
    title: "Products",
    description: "Browse the catalog, inspect status, and open product detail pages for edits.",
    href: "/products",
    cta: "View Products",
    accent:
      "bg-[linear-gradient(135deg,_#0f172a_0%,_#1e293b_100%)] text-white border-slate-700/60",
  },
  {
    eyebrow: "Commerce",
    title: "Orders",
    description: "Review orders, payment state, shipping details, and order items in one place.",
    href: "/orders",
    cta: "Open Orders",
    accent:
      "bg-[linear-gradient(135deg,_#155e75_0%,_#0f766e_100%)] text-white border-cyan-700/50",
  },
];

const commerceModules = [
  {
    name: "Users",
    href: "/users",
    summary: "Accounts, setup status, and product activity.",
    metric: "Accounts",
    tone: "border-slate-200 bg-white",
  },
  {
    name: "Coupons",
    href: "/coupons",
    summary: "Coupon inventory, assigned users, and expiry.",
    metric: "Incentives",
    tone: "border-orange-200/60 bg-[linear-gradient(180deg,_#fff7ed_0%,_#ffffff_100%)]",
  },
  {
    name: "Coupon Usages",
    href: "/coupon-usages",
    summary: "Which user consumed which coupon and when.",
    metric: "Redemption",
    tone: "border-cyan-200/70 bg-[linear-gradient(180deg,_#ecfeff_0%,_#ffffff_100%)]",
  },
];

const paymentModules = [
  {
    name: "Donation Payments",
    href: "/donation-payments",
    summary: "Donation settlement totals, receipts, and approval state.",
    metric: "Donations",
    tone: "border-slate-200 bg-white",
  },
  {
    name: "Relist Payments",
    href: "/relist-payments",
    summary: "Relist fee reviews, receipts, and payment status.",
    metric: "Relist",
    tone: "border-orange-200/60 bg-[linear-gradient(180deg,_#fff7ed_0%,_#ffffff_100%)]",
  },
  {
    name: "Return Payments",
    href: "/return-payments",
    summary: "Delivery fees, wallet deductions, and return charge review.",
    metric: "Returns",
    tone: "border-cyan-200/70 bg-[linear-gradient(180deg,_#ecfeff_0%,_#ffffff_100%)]",
  },
  {
    name: "Money Contracts",
    href: "/money-contract-payments",
    summary: "SCB refs, slips, webhook state, and approval workflow.",
    metric: "Contracts",
    tone: "border-emerald-200/70 bg-[linear-gradient(180deg,_#ecfdf5_0%,_#ffffff_100%)]",
  },
  {
    name: "Wallets",
    href: "/wallets",
    summary: "User and system wallet balances.",
    metric: "Balance",
    tone: "border-slate-200 bg-white",
  },
  {
    name: "Transactions",
    href: "/wallet-transactions",
    summary: "Credits, debits, references, and running balances.",
    metric: "Ledger",
    tone: "border-violet-200/70 bg-[linear-gradient(180deg,_#f5f3ff_0%,_#ffffff_100%)]",
  },
];

const operationsModules = [
  {
    name: "Send To Us Sessions",
    href: "/send-to-us/sessions",
    summary: "Session status, pickup details, and box photo access.",
  },
  {
    name: "Pickup Schedules",
    href: "/pickup-schedules",
    summary: "Scheduled pickups, time slots, phone, and address review.",
  },
];

function SectionHeader({ eyebrow, title, description }) {
  return (
    <div>
      <p className="text-xs font-semibold uppercase tracking-[0.28em] text-orange-500">
        {eyebrow}
      </p>
      <h2 className="mt-3 text-2xl font-semibold tracking-tight text-slate-950">
        {title}
      </h2>
      <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-600">
        {description}
      </p>
    </div>
  );
}

function UtilityCard({ name, href, summary }) {
  return (
    <Link
      href={href}
      className="group rounded-[28px] border border-slate-200 bg-white p-6 shadow-[0_12px_30px_rgba(15,23,42,0.06)] transition duration-200 hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-[0_18px_40px_rgba(15,23,42,0.08)]"
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-lg font-semibold text-slate-950">{name}</p>
          <p className="mt-3 text-sm leading-7 text-slate-600">{summary}</p>
        </div>
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 text-slate-500 transition group-hover:bg-slate-950 group-hover:text-white">
          ↗
        </div>
      </div>
    </Link>
  );
}

function AccentCard({ name, href, summary, metric, tone }) {
  return (
    <Link
      href={href}
      className={`group rounded-[28px] border p-6 shadow-[0_12px_30px_rgba(15,23,42,0.06)] transition duration-200 hover:-translate-y-0.5 hover:shadow-[0_18px_40px_rgba(15,23,42,0.08)] ${tone}`}
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
            {metric}
          </p>
          <p className="mt-3 text-xl font-semibold text-slate-950">{name}</p>
          <p className="mt-3 text-sm leading-7 text-slate-600">{summary}</p>
        </div>
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-950 text-sm text-white transition group-hover:translate-x-0.5">
          ↗
        </div>
      </div>
    </Link>
  );
}

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
      <main className="min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(251,146,60,0.12),_transparent_34%),linear-gradient(180deg,_#fcfcfb_0%,_#f3f4f6_100%)] px-5 py-8">
        <div className="mx-auto max-w-4xl rounded-[30px] border border-white/80 bg-white/85 px-6 py-5 text-sm text-slate-600 shadow-[0_20px_60px_rgba(148,163,184,0.16)] backdrop-blur">
          Checking session...
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(251,146,60,0.12),_transparent_34%),radial-gradient(circle_at_top_right,_rgba(15,23,42,0.08),_transparent_28%),linear-gradient(180deg,_#fcfcfb_0%,_#f1f5f9_100%)] text-slate-900">
      <div className="mx-auto max-w-7xl px-5 py-8 lg:px-8">
        <header className="overflow-hidden rounded-[34px] border border-slate-200/80 bg-[linear-gradient(135deg,_#0f172a_0%,_#111827_58%,_#1f2937_100%)] text-white shadow-[0_24px_80px_rgba(15,23,42,0.24)]">
          <div className="grid gap-10 px-6 py-7 lg:grid-cols-[1.2fr_0.8fr] lg:px-8 lg:py-8">
            <div>
              <div className="flex flex-wrap items-center gap-3 text-xs font-medium uppercase tracking-[0.24em] text-slate-300">
                <span className="inline-flex items-center rounded-full border border-white/10 bg-white/5 px-3 py-1">
                  Lady First Admin
                </span>
                <span className="inline-flex items-center rounded-full border border-emerald-400/20 bg-emerald-400/10 px-3 py-1 text-emerald-200">
                  Live Control
                </span>
              </div>

              <h1 className="mt-6 max-w-3xl text-4xl font-semibold tracking-tight sm:text-5xl">
                DASHBOARD
              </h1>

              <p className="mt-5 max-w-2xl text-sm leading-7 text-slate-300 sm:text-base">
                Manage everything under control.
              </p>
            </div>

            <div className="flex flex-col justify-between gap-4">
              <div className="rounded-[28px] border border-white/10 bg-white/6 p-5 backdrop-blur-sm">
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-400">
                  Session
                </p>
                <div className="mt-4 flex items-center justify-between gap-4">
                  <div>
                    <p className="text-lg font-semibold text-white">
                      {user?.email || user?.username || "Admin"}
                    </p>
                    <p className="mt-1 text-sm text-slate-300">
                      Signed in with staff access
                    </p>
                  </div>
                  <div className="flex h-12 min-w-12 items-center justify-center rounded-full bg-orange-500 text-sm font-semibold text-white">
                    {(user?.email || user?.username || "AD")
                      .slice(0, 2)
                      .toUpperCase()}
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={handleLogout}
                className="inline-flex items-center justify-center rounded-full border border-white/12 bg-white/5 px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/10"
              >
                Logout
              </button>
            </div>
          </div>
        </header>

        <section className="mt-8">
          <SectionHeader
            eyebrow="Primary Actions"
            title="Fast paths for the work admins do most"
            description="The top row is reserved for actions that typically start a workflow: uploading inventory, opening the catalog, and resolving order issues."
          />

          <div className="mt-6 grid gap-5 xl:grid-cols-3">
            {primaryActions.map((action) => (
              <Link
                key={action.href}
                href={action.href}
                className={`group rounded-[32px] border p-7 shadow-[0_16px_40px_rgba(15,23,42,0.08)] transition duration-200 hover:-translate-y-1 hover:shadow-[0_24px_48px_rgba(15,23,42,0.12)] ${action.accent}`}
              >
                <p className="text-xs font-semibold uppercase tracking-[0.26em] opacity-80">
                  {action.eyebrow}
                </p>
                <h2 className="mt-5 text-3xl font-semibold tracking-tight">
                  {action.title}
                </h2>
                <p className="mt-4 max-w-xl text-sm leading-7 opacity-90">
                  {action.description}
                </p>
                <div className="mt-8 inline-flex items-center gap-2 text-sm font-semibold">
                  <span>{action.cta}</span>
                  <span className="transition group-hover:translate-x-1">→</span>
                </div>
              </Link>
            ))}
          </div>
        </section>

        <section className="mt-10 grid gap-6 xl:grid-cols-[0.72fr_1.28fr]">
          <div className="overflow-hidden rounded-[32px] border border-slate-200/90 bg-[linear-gradient(180deg,_#fffaf5_0%,_#ffffff_100%)] shadow-[0_12px_30px_rgba(15,23,42,0.06)]">
            <div className="border-b border-slate-200/80 px-7 py-7">
              <SectionHeader
                eyebrow="Commerce"
                title="Catalog and customer records"
                description="Everything that shapes the storefront, inventory, and user-side buying experience."
              />
            </div>

            <div className="px-7 py-7">
              <div className="rounded-[30px] bg-[linear-gradient(135deg,_#111827_0%,_#1f2937_100%)] p-6 text-white shadow-[0_20px_50px_rgba(15,23,42,0.18)]">
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-orange-300">
                  Featured Surface
                </p>
                <h3 className="mt-4 text-3xl font-semibold tracking-tight">
                  Keep customer and catalog data tight.
                </h3>
                <p className="mt-4 text-sm leading-7 text-slate-300">
                  This area handles user identity, coupon strategy, and redemption visibility without dropping into backend admin tables.
                </p>
                <div className="mt-6 flex flex-wrap gap-3">
                  <Link
                    href="/users"
                    className="inline-flex items-center justify-center rounded-full bg-white px-4 py-2 text-sm font-semibold text-slate-950 transition hover:bg-slate-100"
                  >
                    Open Users
                  </Link>
                  <Link
                    href="/coupons"
                    className="inline-flex items-center justify-center rounded-full border border-white/12 bg-white/6 px-4 py-2 text-sm font-semibold text-white transition hover:bg-white/10"
                  >
                    Review Coupons
                  </Link>
                </div>
              </div>

              <div className="mt-5 grid gap-4">
                {commerceModules.map((item) => (
                  <AccentCard
                    key={item.href}
                    name={item.name}
                    href={item.href}
                    summary={item.summary}
                    metric={item.metric}
                    tone={item.tone}
                  />
                ))}
              </div>
            </div>
          </div>

          <div className="overflow-hidden rounded-[32px] border border-slate-200/90 bg-white shadow-[0_12px_30px_rgba(15,23,42,0.06)]">
            <div className="border-b border-slate-200/80 px-7 py-7">
              <SectionHeader
                eyebrow="Payments"
                title="Revenue, settlements, and wallet operations"
                description="Use this section for every finance-linked flow, from relist fees to wallet movement and money contract payment review."
              />
            </div>

            <div className="px-7 py-7">
              <div className="rounded-[30px] bg-[linear-gradient(135deg,_#0f172a_0%,_#1f2937_48%,_#155e75_100%)] p-6 text-white shadow-[0_20px_50px_rgba(15,23,42,0.18)]">
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-cyan-200">
                  Finance Surface
                </p>
                <h3 className="mt-4 text-3xl font-semibold tracking-tight">
                  Keep cash movement and settlement review visible.
                </h3>
                <p className="mt-4 text-sm leading-7 text-slate-300">
                  Track every payment-related workflow, from donation and relist approvals to wallet balances, transaction ledgers, and contract payment sessions.
                </p>
                <div className="mt-6 flex flex-wrap gap-3">
                  <Link
                    href="/wallets"
                    className="inline-flex items-center justify-center rounded-full bg-white px-4 py-2 text-sm font-semibold text-slate-950 transition hover:bg-slate-100"
                  >
                    Open Wallets
                  </Link>
                  <Link
                    href="/money-contract-payments"
                    className="inline-flex items-center justify-center rounded-full border border-white/12 bg-white/6 px-4 py-2 text-sm font-semibold text-white transition hover:bg-white/10"
                  >
                    Review Contracts
                  </Link>
                </div>
              </div>

              <div className="mt-5 grid gap-4 md:grid-cols-2">
                {paymentModules.map((item) => (
                  <AccentCard
                    key={item.href}
                    name={item.name}
                    href={item.href}
                    summary={item.summary}
                    metric={item.metric}
                    tone={item.tone}
                  />
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="mt-6">
          <div className="rounded-[32px] border border-slate-200/90 bg-white p-7 shadow-[0_12px_30px_rgba(15,23,42,0.06)]">
            <SectionHeader
              eyebrow="Operations"
              title="Pickup and Send To Us workflows"
              description="The logistics side of the business lives here: sessions, pickup scheduling, and the supporting review queue."
            />

            <div className="mt-6 grid gap-4 md:grid-cols-2">
              {operationsModules.map((item) => (
                <UtilityCard
                  key={item.href}
                  name={item.name}
                  href={item.href}
                  summary={item.summary}
                />
              ))}
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
