"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
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

export default function PickupSchedulesPage() {
  const router = useRouter();
  const { token, user } = useAuthSession();
  const [schedules, setSchedules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");

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

    async function loadSchedules() {
      setLoading(true);
      setError("");

      try {
        const response = await fetch(buildApiUrl("/admin/pickup-schedules/"), {
          headers: {
            Accept: "application/json",
            Authorization: `Bearer ${token}`,
          },
        });
        const data = await readApiResponse(response);

        if (!response.ok) {
          throw new Error(
            typeof data === "string" && data.trim().startsWith("<!DOCTYPE")
              ? "Backend returned HTML instead of JSON for pickup schedules. Check the Django server error or admin permission."
              : "Failed to load pickup schedules.",
          );
        }

        if (active) {
          setSchedules(Array.isArray(data) ? data : []);
        }
      } catch (loadError) {
        if (active) {
          setError(loadError.message || "Unable to load pickup schedules.");
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    loadSchedules();

    return () => {
      active = false;
    };
  }, [token]);

  const filteredSchedules = useMemo(() => {
    const keyword = search.trim().toLowerCase();
    if (!keyword) {
      return schedules;
    }

    return schedules.filter((item) =>
      [
        item.user_email,
        item.session_order_id,
        item.phone,
        item.address,
        item.pickup_date,
        item.pickup_time_slot,
      ]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(keyword)),
    );
  }, [schedules, search]);

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
                Pickup Schedules
              </p>
              <h1 className="mt-3 text-3xl font-semibold tracking-tight text-slate-950">
                Pickup Schedule List
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
                href="/send-to-us/sessions"
                className="inline-flex items-center justify-center rounded-2xl bg-slate-950 px-5 py-3 text-sm font-medium text-white transition hover:bg-slate-800"
              >
                View Sessions
              </Link>
            </div>
          </div>
        </header>

        <section className="mt-8 rounded-[28px] border border-slate-200 bg-white p-6 shadow-[0_10px_30px_rgba(15,23,42,0.06)]">
          <div className="max-w-md">
            <label className="block">
              <div className="mb-3 text-sm font-medium text-slate-700">
                Search Pickup Schedules
              </div>
              <input
                type="text"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search by user, order id, phone, address, date"
                className="h-14 w-full rounded-2xl border border-slate-200 bg-white px-5 text-base text-slate-900 shadow-sm outline-none placeholder:text-slate-400"
              />
            </label>
          </div>
        </section>

        <section className="mt-8 rounded-[28px] border border-slate-200 bg-white p-6 shadow-[0_10px_30px_rgba(15,23,42,0.06)]">
          <div>
            <p className="text-sm font-medium uppercase tracking-[0.2em] text-slate-500">
              Results
            </p>
            <h2 className="mt-2 text-2xl font-semibold text-slate-950">
              {filteredSchedules.length} pickup schedules
            </h2>
          </div>

          {loading ? (
            <div className="mt-6 rounded-2xl bg-slate-50 px-5 py-4 text-sm text-slate-600">
              Loading pickup schedules...
            </div>
          ) : null}

          {error ? (
            <div className="mt-6 rounded-2xl border border-rose-200 bg-rose-50 px-5 py-4 text-sm text-rose-700">
              {error}
            </div>
          ) : null}

          {!loading && !error && filteredSchedules.length === 0 ? (
            <div className="mt-6 rounded-2xl bg-slate-50 px-5 py-8 text-center text-sm text-slate-600">
              No pickup schedules found.
            </div>
          ) : null}

          {!loading && !error && filteredSchedules.length > 0 ? (
            <div className="mt-6 overflow-hidden rounded-2xl border border-slate-200">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-slate-200">
                  <thead className="bg-slate-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                        User
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                        Session
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                        Pickup Date
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                        Time Slot
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                        Phone
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                        Address
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                        Created
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 bg-white">
                    {filteredSchedules.map((item) => (
                      <tr key={item.id}>
                        <td className="px-4 py-4 text-sm text-slate-700">
                          {item.user_email || "-"}
                        </td>
                        <td className="px-4 py-4 text-sm text-slate-700">
                          {item.session_order_id ? (
                            <Link
                              href={`/send-to-us/sessions/${item.session}`}
                              className="font-medium text-orange-600 hover:text-orange-700"
                            >
                              {item.session_order_id}
                            </Link>
                          ) : (
                            "-"
                          )}
                        </td>
                        <td className="px-4 py-4 text-sm text-slate-700">
                          {item.pickup_date || "-"}
                        </td>
                        <td className="px-4 py-4 text-sm text-slate-700">
                          {item.pickup_time_slot || "-"}
                        </td>
                        <td className="px-4 py-4 text-sm text-slate-700">
                          {item.phone || "-"}
                        </td>
                        <td className="px-4 py-4 text-sm text-slate-700">
                          <div className="max-w-xs whitespace-pre-wrap break-words">
                            {item.address || "-"}
                          </div>
                        </td>
                        <td className="px-4 py-4 text-sm text-slate-700">
                          {formatDate(item.created_at)}
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
