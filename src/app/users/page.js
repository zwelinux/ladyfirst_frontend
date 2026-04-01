"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { useAuthSession } from "@/lib/auth";
import { apiFetch } from "@/lib/api";

export default function UsersPage() {
  const router = useRouter();
  const { token, user, ready } = useAuthSession();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");

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

    async function loadUsers() {
      setLoading(true);
      setError("");

      try {
        const response = await apiFetch("/users/");
        const data = await response.json();

        if (!response.ok) {
          throw new Error("Failed to load users.");
        }

        if (active) {
          setUsers(Array.isArray(data) ? data : []);
        }
      } catch (loadError) {
        if (active) {
          setError(loadError.message || "Unable to load users.");
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    loadUsers();

    return () => {
      active = false;
    };
  }, [ready, token]);

  const filteredUsers = useMemo(() => {
    const keyword = search.trim().toLowerCase();
    if (!keyword) {
      return users;
    }

    return users.filter((item) =>
      [
        item.email,
        item.username,
        item.phone_number,
        item.country,
        item.province,
      ]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(keyword)),
    );
  }, [search, users]);

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
                Users
              </p>
              <h1 className="mt-3 text-3xl font-semibold tracking-tight text-slate-950">
                User List
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
                href="/products"
                className="inline-flex items-center justify-center rounded-2xl bg-slate-950 px-5 py-3 text-sm font-medium text-white transition hover:bg-slate-800"
              >
                View Products
              </Link>
            </div>
          </div>
        </header>

        <section className="mt-8 rounded-[28px] border border-slate-200 bg-white p-6 shadow-[0_10px_30px_rgba(15,23,42,0.06)]">
          <div className="max-w-md">
            <label className="block">
              <div className="mb-3 text-sm font-medium text-slate-700">
                Search Users
              </div>
              <input
                type="text"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search by email, username, phone, country"
                className="h-14 w-full rounded-2xl border border-slate-200 bg-white px-5 text-base text-slate-900 shadow-sm outline-none placeholder:text-slate-400"
              />
            </label>
          </div>
        </section>

        <section className="mt-8 rounded-[28px] border border-slate-200 bg-white p-6 shadow-[0_10px_30px_rgba(15,23,42,0.06)]">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-medium uppercase tracking-[0.2em] text-slate-500">
                Results
              </p>
              <h2 className="mt-2 text-2xl font-semibold text-slate-950">
                {filteredUsers.length} users
              </h2>
            </div>
          </div>

          {loading ? (
            <div className="mt-6 rounded-2xl bg-slate-50 px-5 py-4 text-sm text-slate-600">
              Loading users...
            </div>
          ) : null}

          {error ? (
            <div className="mt-6 rounded-2xl border border-rose-200 bg-rose-50 px-5 py-4 text-sm text-rose-700">
              {error}
            </div>
          ) : null}

          {!loading && !error && filteredUsers.length === 0 ? (
            <div className="mt-6 rounded-2xl bg-slate-50 px-5 py-8 text-center text-sm text-slate-600">
              No users found.
            </div>
          ) : null}

          {!loading && !error && filteredUsers.length > 0 ? (
            <div className="mt-6 overflow-hidden rounded-2xl border border-slate-200">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-slate-200">
                  <thead className="bg-slate-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                        User
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                        Phone
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                        Location
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                        Setup
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                        Active Products
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                        Sold Products
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 bg-white">
                    {filteredUsers.map((item) => (
                      <tr key={item.id}>
                        <td className="px-4 py-4">
                          <div>
                            <p className="font-medium text-slate-900">
                              {item.email || item.username}
                            </p>
                            <p className="mt-1 text-sm text-slate-500">
                              {item.username || "-"}
                            </p>
                          </div>
                        </td>
                        <td className="px-4 py-4 text-sm text-slate-700">
                          {item.phone_number || "-"}
                        </td>
                        <td className="px-4 py-4 text-sm text-slate-700">
                          {[item.country, item.province, item.district]
                            .filter(Boolean)
                            .join(", ") || "-"}
                        </td>
                        <td className="px-4 py-4">
                          <span
                            className={`rounded-full px-3 py-1 text-xs font-medium ${
                              item.is_setup_complete
                                ? "bg-emerald-50 text-emerald-700"
                                : "bg-amber-50 text-amber-700"
                            }`}
                          >
                            {item.is_setup_complete ? "Complete" : "Incomplete"}
                          </span>
                        </td>
                        <td className="px-4 py-4 text-sm text-slate-700">
                          {item.active_count_human || item.active_count || 0}
                        </td>
                        <td className="px-4 py-4 text-sm text-slate-700">
                          {item.sold_count_human || item.sold_count || 0}
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
