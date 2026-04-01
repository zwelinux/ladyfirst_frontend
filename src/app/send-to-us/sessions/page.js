"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
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

export default function SendToUsSessionsPage() {
  const router = useRouter();
  const { token } = useAuthSession();
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");

  useEffect(() => {
    if (!token) router.replace("/login");
  }, [router, token]);

  useEffect(() => {
    if (!token) return;
    let active = true;

    async function loadData() {
      setLoading(true);
      setError("");
      try {
        const response = await fetch(buildApiUrl("/admin/sendus/sessions/"), {
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
          },
        });
        const data = await readApiResponse(response);
        if (!response.ok) {
          throw new Error(
            typeof data === "string" && data.trim().startsWith("<!DOCTYPE")
              ? "Backend returned HTML instead of JSON for Send To Us sessions. Check the Django server error or admin permission."
              : "Failed to load Send To Us sessions.",
          );
        }
        if (active) setSessions(Array.isArray(data) ? data : []);
      } catch (loadError) {
        if (active) setError(loadError.message || "Unable to load sessions.");
      } finally {
        if (active) setLoading(false);
      }
    }

    loadData();
    return () => {
      active = false;
    };
  }, [token]);

  const filteredSessions = useMemo(() => {
    const keyword = search.trim().toLowerCase();
    if (!keyword) return sessions;
    return sessions.filter((session) =>
      [
        session.order_id,
        session.user_email,
        session.package_name,
        session.status,
        session.phone,
      ]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(keyword)),
    );
  }, [search, sessions]);

  if (!token) {
    return <main className="min-h-screen bg-[linear-gradient(180deg,_#f8fafc_0%,_#eef2ff_100%)] px-5 py-8"><div className="mx-auto max-w-4xl rounded-[28px] border border-white/70 bg-white/80 px-6 py-5 text-sm text-slate-600 shadow-[0_20px_60px_rgba(148,163,184,0.16)]">Checking session...</div></main>;
  }

  return (
    <main className="min-h-screen bg-[linear-gradient(180deg,_#f8fafc_0%,_#eef2ff_100%)] text-slate-900">
      <div className="mx-auto max-w-7xl px-5 py-8 lg:px-8">
        <header className="rounded-[28px] border border-white/70 bg-white/85 px-6 py-5 shadow-[0_20px_60px_rgba(148,163,184,0.16)]">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-sm font-medium uppercase tracking-[0.24em] text-orange-500">Send To Us Sessions</p>
              <h1 className="mt-3 text-3xl font-semibold tracking-tight text-slate-950">Sessions</h1>
            </div>
            <Link href="/" className="inline-flex items-center justify-center rounded-2xl border border-slate-200 bg-white px-5 py-3 text-sm font-medium text-slate-700 transition hover:bg-slate-50">Back To Dashboard</Link>
          </div>
        </header>

        <section className="mt-8 rounded-[28px] border border-slate-200 bg-white p-6 shadow-[0_10px_30px_rgba(15,23,42,0.06)]">
          <div className="max-w-md">
            <label className="block">
              <div className="mb-3 text-sm font-medium text-slate-700">Search Sessions</div>
              <input
                type="text"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search by order id, user, package, status"
                className="h-14 w-full rounded-2xl border border-slate-200 bg-white px-5 text-base text-slate-900 shadow-sm outline-none placeholder:text-slate-400"
              />
            </label>
          </div>

          {loading ? <div className="mt-6 rounded-2xl bg-slate-50 px-5 py-4 text-sm text-slate-600">Loading sessions...</div> : null}
          {error ? <div className="mt-6 rounded-2xl border border-rose-200 bg-rose-50 px-5 py-4 text-sm text-rose-700">{error}</div> : null}
          {!loading && !error && (
            <div className="mt-6 overflow-hidden rounded-2xl border border-slate-200">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-slate-200">
                  <thead className="bg-slate-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Order ID</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">User</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Package</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Status</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Pickup</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Photos</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 bg-white">
                    {filteredSessions.map((session) => (
                      <tr key={session.id}>
                        <td className="px-4 py-4 text-sm font-medium text-slate-900">{session.order_id}</td>
                        <td className="px-4 py-4 text-sm text-slate-700">{session.user_email}</td>
                        <td className="px-4 py-4 text-sm text-slate-700">{session.package_name || "-"}</td>
                        <td className="px-4 py-4"><span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700">{session.status}</span></td>
                        <td className="px-4 py-4 text-sm text-slate-700">{session.pickup_date ? `${session.pickup_date} ${session.pickup_time_slot || ""}` : "-"}</td>
                        <td className="px-4 py-4 text-sm text-slate-700">{session.photos?.length || 0}</td>
                        <td className="px-4 py-4">
                          <Link href={`/send-to-us/sessions/${session.id}`} className="inline-flex items-center justify-center rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50">View</Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
