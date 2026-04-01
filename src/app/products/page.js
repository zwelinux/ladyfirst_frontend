"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import { useAuthSession } from "@/lib/auth";
import { apiFetch } from "@/lib/api";

const statusOptions = [
  { value: "", label: "All Statuses" },
  { value: "active", label: "Active" },
  { value: "pending", label: "Pending" },
  { value: "sold", label: "Sold" },
  { value: "expired", label: "Expired" },
  { value: "bidding", label: "Bidding" },
];


function ProductsPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { token, user: currentUser, ready } = useAuthSession();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [products, setProducts] = useState([]);
  const [filters, setFilters] = useState({
    keyword: searchParams.get("keyword") || "",
    status: searchParams.get("status") || "",
  });
  const [pagination, setPagination] = useState({
    current_page: 1,
    total_pages: 1,
    found_products: 0,
    has_next_page: false,
  });

  const page = Number(searchParams.get("page") || "1");

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

    async function loadProducts() {
      setLoading(true);
      setError("");

      try {
        const query = new URLSearchParams();
        query.set("page", String(page));
        query.set("limit", "20");

        if (filters.keyword.trim()) {
          query.set("keyword", filters.keyword.trim());
        }

        if (filters.status) {
          query.set("status", filters.status);
        }

        const response = await apiFetch(`/products/?${query.toString()}`);
        const data = await response.json();

        if (!response.ok) {
          throw new Error("Failed to load product list.");
        }

        if (!active) {
          return;
        }

        setProducts(data.products || []);
        setPagination({
          current_page: data.current_page || 1,
          total_pages: data.total_pages || 1,
          found_products: data.found_products || 0,
          has_next_page: data.has_next_page || false,
        });
      } catch (loadError) {
        if (active) {
          setError(loadError.message || "Unable to load products.");
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    loadProducts();

    return () => {
      active = false;
    };
  }, [filters.keyword, filters.status, page, ready, token]);

  function applyFilters(event) {
    event.preventDefault();
    const query = new URLSearchParams();

    if (filters.keyword.trim()) {
      query.set("keyword", filters.keyword.trim());
    }

    if (filters.status) {
      query.set("status", filters.status);
    }

    query.set("page", "1");
    router.push(`/products?${query.toString()}`);
  }

  function goToPage(nextPage) {
    const query = new URLSearchParams(searchParams.toString());
    query.set("page", String(nextPage));
    router.push(`/products?${query.toString()}`);
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
      <div className="mx-auto max-w-7xl px-5 py-8 lg:px-8">
        <header className="rounded-[28px] border border-white/70 bg-white/85 px-6 py-5 shadow-[0_20px_60px_rgba(148,163,184,0.16)]">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="text-sm font-medium uppercase tracking-[0.24em] text-orange-500">
                Product List
              </p>
              <h1 className="mt-3 text-3xl font-semibold tracking-tight text-slate-950">
                Products
              </h1>
              <p className="mt-2 text-sm text-slate-600">
                Logged in as {currentUser?.email || currentUser?.username || "Admin"}.
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
                href="/products/upload"
                className="inline-flex items-center justify-center rounded-2xl bg-orange-500 px-5 py-3 text-sm font-medium text-white transition hover:bg-orange-600"
              >
                Create Product
              </Link>
            </div>
          </div>
        </header>

        <section className="mt-8 rounded-[28px] border border-slate-200 bg-white p-6 shadow-[0_10px_30px_rgba(15,23,42,0.06)]">
          <form
            onSubmit={applyFilters}
            className="grid gap-4 lg:grid-cols-[1fr_240px_170px]"
          >
            <label className="block">
              <div className="mb-3 text-sm font-medium text-slate-700">Search</div>
              <input
                type="text"
                value={filters.keyword}
                onChange={(event) =>
                  setFilters((current) => ({
                    ...current,
                    keyword: event.target.value,
                  }))
                }
                placeholder="Search by product title"
                className="h-14 w-full rounded-2xl border border-slate-200 bg-white px-5 text-base text-slate-900 shadow-sm outline-none placeholder:text-slate-400"
              />
            </label>

            <label className="block">
              <div className="mb-3 text-sm font-medium text-slate-700">Status</div>
              <div className="relative">
                <select
                  value={filters.status}
                  onChange={(event) =>
                    setFilters((current) => ({
                      ...current,
                      status: event.target.value,
                    }))
                  }
                  className="h-14 w-full appearance-none rounded-2xl border border-slate-200 bg-white px-5 pr-12 text-base text-slate-700 shadow-sm outline-none"
                >
                  {statusOptions.map((option) => (
                    <option key={option.label} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
                <span className="pointer-events-none absolute right-5 top-1/2 -translate-y-1/2 text-slate-400">
                  ˅
                </span>
              </div>
            </label>

            <div className="flex items-end">
              <button
                type="submit"
                className="h-14 w-full rounded-2xl bg-slate-950 px-5 text-sm font-medium text-white transition hover:bg-slate-800"
              >
                Apply Filters
              </button>
            </div>
          </form>
        </section>

        <section className="mt-8 rounded-[28px] border border-slate-200 bg-white p-6 shadow-[0_10px_30px_rgba(15,23,42,0.06)]">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-medium uppercase tracking-[0.2em] text-slate-500">
                Results
              </p>
              <h2 className="mt-2 text-2xl font-semibold text-slate-950">
                {pagination.found_products} products found
              </h2>
            </div>
            <p className="text-sm text-slate-500">
              Page {pagination.current_page} of {pagination.total_pages}
            </p>
          </div>

          {loading ? (
            <div className="mt-6 rounded-2xl bg-slate-50 px-5 py-4 text-sm text-slate-600">
              Loading products...
            </div>
          ) : null}

          {error ? (
            <div className="mt-6 rounded-2xl border border-rose-200 bg-rose-50 px-5 py-4 text-sm text-rose-700">
              {error}
            </div>
          ) : null}

          {!loading && !error && products.length === 0 ? (
            <div className="mt-6 rounded-2xl bg-slate-50 px-5 py-8 text-center text-sm text-slate-600">
              No products found for the current filters.
            </div>
          ) : null}

          {!loading && !error && products.length > 0 ? (
            <div className="mt-6 overflow-hidden rounded-2xl border border-slate-200">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-slate-200">
                  <thead className="bg-slate-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                        Product
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                        Seller
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                        Category
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                        Status
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                        Price
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
                    {products.map((product) => (
                      <tr key={product.id}>
                        <td className="px-4 py-4">
                          <div>
                            <p className="font-medium text-slate-900">{product.title}</p>
                            <p className="mt-1 text-sm text-slate-500">
                              {product.product_slug || `#${product.id}`}
                            </p>
                          </div>
                        </td>
                        <td className="px-4 py-4 text-sm text-slate-700">
                          {product.seller_details?.email ||
                            product.seller_details?.username ||
                            product.seller ||
                            "-"}
                        </td>
                        <td className="px-4 py-4 text-sm text-slate-700">
                          {product.category_name || "-"}
                        </td>
                        <td className="px-4 py-4">
                          <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium uppercase text-slate-700">
                            {product.status}
                          </span>
                        </td>
                        <td className="px-4 py-4 text-sm text-slate-700">
                          {product.second_hand_price || "-"}
                        </td>
                        <td className="px-4 py-4 text-sm text-slate-700">
                          {product.created_at
                            ? new Date(product.created_at).toLocaleDateString()
                            : "-"}
                        </td>
                        <td className="px-4 py-4">
                          <Link
                            href={`/products/${product.id}`}
                            className="inline-flex items-center justify-center rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
                          >
                            Edit
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ) : null}

          <div className="mt-6 flex items-center justify-between gap-3">
            <button
              type="button"
              onClick={() => goToPage(Math.max(1, pagination.current_page - 1))}
              disabled={pagination.current_page <= 1}
              className="rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Previous
            </button>
            <button
              type="button"
              onClick={() => goToPage(pagination.current_page + 1)}
              disabled={!pagination.has_next_page}
              className="rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Next
            </button>
          </div>
        </section>
      </div>
    </main>
  );
}

export default function ProductsPage() {
  return (
    <Suspense
      fallback={
        <main className="min-h-screen bg-[linear-gradient(180deg,_#f8fafc_0%,_#eef2ff_100%)] px-5 py-8">
          <div className="mx-auto max-w-4xl rounded-[28px] border border-white/70 bg-white/80 px-6 py-5 text-sm text-slate-600 shadow-[0_20px_60px_rgba(148,163,184,0.16)]">
            Loading products...
          </div>
        </main>
      }
    >
      <ProductsPageContent />
    </Suspense>
  );
}
