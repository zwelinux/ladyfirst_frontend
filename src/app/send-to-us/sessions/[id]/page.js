"use client";

import Image from "next/image";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useAuthSession } from "@/lib/auth";
import { apiFetch } from "@/lib/api";

async function readApiResponse(response) {
  const text = await response.text();
  try {
    return text ? JSON.parse(text) : null;
  } catch {
    return text;
  }
}

export default function SendToUsSessionDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { token, ready } = useAuthSession();
  const [session, setSession] = useState(null);
  const [previewPhoto, setPreviewPhoto] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (ready && !token) router.replace("/login");
  }, [ready, router, token]);

  useEffect(() => {
    if (!token || !params?.id) return;
    let active = true;

    async function loadData() {
      setLoading(true);
      setError("");
      try {
        const response = await apiFetch(`/admin/sendus/sessions/${params.id}/`, {
          headers: {
            Accept: "application/json",
          },
        });
        const data = await readApiResponse(response);
        if (!response.ok) {
          throw new Error(
            typeof data === "string" && data.trim().startsWith("<!DOCTYPE")
              ? "Backend returned HTML instead of JSON for the Send To Us session detail. Check the Django server error or admin permission."
              : "Failed to load Send To Us session.",
          );
        }
        if (active) setSession(data);
      } catch (loadError) {
        if (active) setError(loadError.message || "Unable to load session.");
      } finally {
        if (active) setLoading(false);
      }
    }

    loadData();
    return () => {
      active = false;
    };
  }, [params, ready, token]);

  if (!ready || !token) {
    return <main className="min-h-screen bg-[linear-gradient(180deg,_#f8fafc_0%,_#eef2ff_100%)] px-5 py-8"><div className="mx-auto max-w-4xl rounded-[28px] border border-white/70 bg-white/80 px-6 py-5 text-sm text-slate-600 shadow-[0_20px_60px_rgba(148,163,184,0.16)]">Checking session...</div></main>;
  }

  const statusTone =
    session?.status === "scheduled"
      ? "bg-emerald-50 text-emerald-700"
      : session?.status === "cancelled"
        ? "bg-rose-50 text-rose-700"
        : session?.status === "picked_up"
          ? "bg-sky-50 text-sky-700"
          : "bg-slate-100 text-slate-700";

  return (
    <main className="min-h-screen bg-[linear-gradient(180deg,_#f8fafc_0%,_#eef2ff_100%)] text-slate-900">
      <div className="mx-auto max-w-7xl px-5 py-8 lg:px-8">
        <header className="rounded-[28px] border border-white/70 bg-white/85 px-6 py-5 shadow-[0_20px_60px_rgba(148,163,184,0.16)]">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-sm font-medium uppercase tracking-[0.24em] text-orange-500">Send To Us Session</p>
              <h1 className="mt-3 text-3xl font-semibold tracking-tight text-slate-950">Session Detail</h1>
            </div>
            <Link href="/send-to-us/sessions" className="inline-flex items-center justify-center rounded-2xl border border-slate-200 bg-white px-5 py-3 text-sm font-medium text-slate-700 transition hover:bg-slate-50">Back To Sessions</Link>
          </div>
        </header>

        {loading ? <div className="mt-8 rounded-[28px] border border-slate-200 bg-white px-6 py-5 text-sm text-slate-600 shadow-[0_10px_30px_rgba(15,23,42,0.06)]">Loading session...</div> : null}
        {error ? <div className="mt-8 rounded-[28px] border border-rose-200 bg-rose-50 px-6 py-5 text-sm text-rose-700">{error}</div> : null}

        {session ? (
          <div className="mt-8 grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
            <section className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-[0_10px_30px_rgba(15,23,42,0.06)]">
              <div className="rounded-[24px] bg-[linear-gradient(135deg,_#fff7ed_0%,_#f8fafc_100%)] p-5">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <p className="text-sm font-medium uppercase tracking-[0.22em] text-orange-500">
                      Session Information
                    </p>
                    <h2 className="mt-3 text-3xl font-semibold text-slate-950">
                      {session.order_id}
                    </h2>
                    <p className="mt-2 text-sm text-slate-600">
                      Created {session.created_at ? new Date(session.created_at).toLocaleString() : "-"}
                    </p>
                  </div>
                  <span
                    className={`inline-flex items-center rounded-full px-4 py-2 text-sm font-medium capitalize ${statusTone}`}
                  >
                    {session.status}
                  </span>
                </div>
              </div>

              <div className="mt-6 grid gap-4 sm:grid-cols-2">
                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                  <p className="text-xs font-medium uppercase tracking-[0.18em] text-slate-500">
                    User
                  </p>
                  <p className="mt-3 text-base font-medium text-slate-900">
                    {session.user_email}
                  </p>
                </div>

                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                  <p className="text-xs font-medium uppercase tracking-[0.18em] text-slate-500">
                    Package
                  </p>
                  <p className="mt-3 text-base font-medium text-slate-900">
                    {session.package_name || "-"}
                  </p>
                </div>
              </div>

              <div className="mt-6 grid gap-6 xl:grid-cols-2">
                <div className="rounded-2xl border border-slate-200 p-5">
                  <p className="text-sm font-medium uppercase tracking-[0.18em] text-slate-500">
                    Pickup Details
                  </p>
                  <div className="mt-5 space-y-4">
                    <div>
                      <p className="text-xs uppercase tracking-[0.16em] text-slate-400">
                        Pickup Date
                      </p>
                      <p className="mt-1 text-base font-medium text-slate-900">
                        {session.pickup_date || "-"}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs uppercase tracking-[0.16em] text-slate-400">
                        Time Slot
                      </p>
                      <p className="mt-1 text-base font-medium text-slate-900">
                        {session.pickup_time_slot || "-"}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs uppercase tracking-[0.16em] text-slate-400">
                        Address
                      </p>
                      <p className="mt-1 text-base leading-7 text-slate-900">
                        {session.address || "-"}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="rounded-2xl border border-slate-200 p-5">
                  <p className="text-sm font-medium uppercase tracking-[0.18em] text-slate-500">
                    Contact Details
                  </p>
                  <div className="mt-5 space-y-4">
                    <div>
                      <p className="text-xs uppercase tracking-[0.16em] text-slate-400">
                        Phone
                      </p>
                      <p className="mt-1 text-base font-medium text-slate-900">
                        {session.phone || "-"}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs uppercase tracking-[0.16em] text-slate-400">
                        Line ID
                      </p>
                      <p className="mt-1 text-base font-medium text-slate-900">
                        {session.line_id || "-"}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs uppercase tracking-[0.16em] text-slate-400">
                        Photo Count
                      </p>
                      <p className="mt-1 text-base font-medium text-slate-900">
                        {session.photos?.length || 0}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            <section className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-[0_10px_30px_rgba(15,23,42,0.06)]">
              <div className="rounded-[24px] bg-[linear-gradient(135deg,_#eff6ff_0%,_#f8fafc_100%)] p-5">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <p className="text-sm font-medium uppercase tracking-[0.22em] text-sky-600">
                      Box Photos
                    </p>
                    <h2 className="mt-3 text-3xl font-semibold text-slate-950">
                      Photo Gallery
                    </h2>
                    <p className="mt-2 text-sm text-slate-600">
                      Review uploaded box images for this session before pickup and confirmation.
                    </p>
                  </div>
                </div>
              </div>

              {session.photos?.length ? (
                <div className="mt-6 grid gap-5 sm:grid-cols-2">
                  {session.photos.map((photo) => (
                    <article
                      key={photo.id}
                      className="overflow-hidden rounded-[24px] border border-slate-200 bg-white shadow-[0_10px_24px_rgba(15,23,42,0.06)]"
                    >
                      <div
                        className="relative cursor-pointer"
                        onClick={() => setPreviewPhoto(photo)}
                      >
                        <div className="absolute left-4 top-4 z-10 rounded-full bg-slate-950/80 px-3 py-1 text-xs font-medium text-white backdrop-blur">
                          Photo #{photo.id}
                        </div>
                        <div className="absolute inset-x-0 bottom-0 z-10 bg-gradient-to-t from-slate-950/60 to-transparent px-4 py-4 text-sm font-medium text-white">
                          Click to preview
                        </div>
                      </div>
                      <Image
                        src={photo.image}
                        alt=""
                        width={640}
                        height={400}
                        unoptimized
                        className="h-64 w-full object-cover"
                      />
                      <div className="border-t border-slate-100 bg-slate-50/60 px-4 py-4">
                        <p className="text-xs font-medium uppercase tracking-[0.16em] text-slate-400">
                          Uploaded At
                        </p>
                        <p className="mt-2 text-sm font-medium text-slate-700">
                          {photo.uploaded_at
                            ? new Date(photo.uploaded_at).toLocaleString()
                            : "-"}
                        </p>
                        <a
                          href={photo.image}
                          download
                          target="_blank"
                          rel="noreferrer"
                          className="mt-4 inline-flex items-center justify-center rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
                        >
                          View Photo 
                        </a>
                      </div>
                    </article>
                  ))}
                </div>
              ) : (
                <div className="mt-6 rounded-[24px] border border-dashed border-slate-200 bg-slate-50 px-6 py-12 text-center">
                  <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-white text-2xl shadow-sm">
                    📦
                  </div>
                  <p className="mt-5 text-lg font-medium text-slate-800">
                    No box photos uploaded
                  </p>
                  <p className="mt-2 text-sm text-slate-600">
                    This session does not have any uploaded box images yet.
                  </p>
                </div>
              )}
            </section>
          </div>
        ) : null}

        {previewPhoto ? (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 px-4 py-6 backdrop-blur-sm"
            onClick={() => setPreviewPhoto(null)}
          >
            <div
              className="relative w-full max-w-5xl overflow-hidden rounded-[28px] bg-white shadow-[0_30px_80px_rgba(15,23,42,0.35)]"
              onClick={(event) => event.stopPropagation()}
            >
              <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
                <div>
                  <p className="text-xs font-medium uppercase tracking-[0.18em] text-slate-400">
                    Box Photo Preview
                  </p>
                  <p className="mt-1 text-base font-medium text-slate-900">
                    Photo #{previewPhoto.id}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setPreviewPhoto(null)}
                  className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
                >
                  Close
                </button>
              </div>

              <div className="bg-slate-100 p-4">
                <Image
                  src={previewPhoto.image}
                  alt=""
                  width={1400}
                  height={1000}
                  unoptimized
                  className="max-h-[75vh] w-full rounded-2xl object-contain bg-white"
                />
              </div>

              <div className="flex flex-wrap items-center justify-between gap-3 px-5 py-4">
                <p className="text-sm text-slate-500">
                  Uploaded{" "}
                  {previewPhoto.uploaded_at
                    ? new Date(previewPhoto.uploaded_at).toLocaleString()
                    : "-"}
                </p>
                <a
                  href={previewPhoto.image}
                  download
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center justify-center rounded-xl bg-slate-950 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-800"
                >
                  Download Photo
                </a>
              </div>
            </div>
          </div>
        ) : null}
      </div>
    </main>
  );
}
