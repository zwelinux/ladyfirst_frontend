"use client";

import Image from "next/image";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { useAuthSession } from "@/lib/auth";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://127.0.0.1:8000/api/auth";

const measurementConfig = [
  { key: "width_cm", label: "Width" },
  { key: "height_cm", label: "Height" },
  { key: "depth_cm", label: "Depth" },
  { key: "start_drop_cm", label: "Start Drop" },
  { key: "chest_bust", label: "Chest/Bust" },
  { key: "waist", label: "Waist" },
  { key: "hip", label: "Hip" },
  { key: "shoulder", label: "Shoulder" },
  { key: "sleeve", label: "Sleeve" },
  { key: "inseam", label: "Inseam" },
  { key: "foot_size_us", label: "Foot Size" },
  { key: "top_length", label: "Top Length" },
  { key: "bottom_length", label: "Bottom Length" },
];

const defaultForm = {
  title: "",
  description: "",
  quantity: "1",
  size: "",
  color: "",
  condition: "",
  original_price: "",
  second_hand_price: "",
  category: "",
  useSellerMeasurements: false,
};

const defaultMeasurements = measurementConfig.reduce((acc, item) => {
  acc[item.key] = "";
  return acc;
}, {});

function buildApiUrl(path) {
  return `${API_BASE_URL.replace(/\/$/, "")}/${path.replace(/^\//, "")}`;
}

function SectionTitle({ title }) {
  return <h2 className="text-2xl font-semibold text-slate-950">{title}</h2>;
}

function InputField({
  label,
  name,
  value,
  onChange,
  placeholder,
  type = "text",
  disabled = false,
}) {
  return (
    <label className="block">
      <div className="mb-3 text-sm font-medium text-slate-700">{label}</div>
      <input
        name={name}
        type={type}
        value={value}
        onChange={onChange}
        disabled={disabled}
        placeholder={placeholder}
        className="h-14 w-full rounded-2xl border border-slate-200 bg-white px-5 text-base text-slate-900 shadow-sm outline-none placeholder:text-slate-400 disabled:bg-slate-100"
      />
    </label>
  );
}

function SelectField({ label, name, value, onChange, options }) {
  return (
    <label className="block">
      <div className="mb-3 text-sm font-medium text-slate-700">{label}</div>
      <div className="relative">
        <select
          name={name}
          value={value}
          onChange={onChange}
          className="h-14 w-full appearance-none rounded-2xl border border-slate-200 bg-white px-5 pr-12 text-base text-slate-700 shadow-sm outline-none"
        >
          <option value="">Select {label}</option>
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <span className="pointer-events-none absolute right-5 top-1/2 -translate-y-1/2 text-slate-400">
          ˅
        </span>
      </div>
    </label>
  );
}

export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { token, user: currentUser } = useAuthSession();
  const productId = params?.id;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [product, setProduct] = useState(null);
  const [form, setForm] = useState(defaultForm);
  const [measurements, setMeasurements] = useState(defaultMeasurements);
  const [selectedTags, setSelectedTags] = useState([]);
  const [newImages, setNewImages] = useState([]);
  const [deleteImageIds, setDeleteImageIds] = useState([]);
  const [catalog, setCatalog] = useState({
    categories: [],
    tags: [],
    sizes: [],
    colors: [],
    conditions: [],
  });

  useEffect(() => {
    if (!token) {
      router.replace("/login");
    }
  }, [router, token]);

  useEffect(() => {
    if (!token || !productId) {
      return;
    }

    let active = true;

    async function loadPageData() {
      setLoading(true);
      setError("");

      try {
        const [
          productResponse,
          categoriesResponse,
          tagsResponse,
          sizesResponse,
          colorsResponse,
          conditionsResponse,
        ] = await Promise.all([
          fetch(buildApiUrl(`/products/${productId}/`), {
            headers: { Authorization: `Bearer ${token}` },
          }),
          fetch(buildApiUrl("/categories/")),
          fetch(buildApiUrl("/tags/")),
          fetch(buildApiUrl("/sizes/")),
          fetch(buildApiUrl("/colors/")),
          fetch(buildApiUrl("/conditions/")),
        ]);

        const productData = await productResponse.json();
        const categories = await categoriesResponse.json();
        const tags = await tagsResponse.json();
        const sizes = await sizesResponse.json();
        const colors = await colorsResponse.json();
        const conditions = await conditionsResponse.json();

        if (!productResponse.ok) {
          throw new Error(
            productData?.detail ||
              productData?.error ||
              "Failed to load product detail.",
          );
        }

        if (!active) {
          return;
        }

        setProduct(productData);
        setForm({
          title: productData.title || "",
          description: productData.description || "",
          quantity: String(productData.quantity || 1),
          size: productData.size || "",
          color: productData.color || "",
          condition: productData.condition || "",
          original_price: productData.original_price || "",
          second_hand_price: productData.second_hand_price || "",
          category: productData.category ? String(productData.category) : "",
          useSellerMeasurements: false,
        });
        setMeasurements({
          width_cm: productData.width_cm ? String(productData.width_cm) : "",
          height_cm: productData.height_cm ? String(productData.height_cm) : "",
          depth_cm: productData.depth_cm ? String(productData.depth_cm) : "",
          start_drop_cm: productData.start_drop_cm
            ? String(productData.start_drop_cm)
            : "",
          chest_bust: productData.chest_bust ? String(productData.chest_bust) : "",
          waist: productData.waist ? String(productData.waist) : "",
          hip: productData.hip ? String(productData.hip) : "",
          shoulder: productData.shoulder ? String(productData.shoulder) : "",
          sleeve: productData.sleeve ? String(productData.sleeve) : "",
          inseam: productData.inseam ? String(productData.inseam) : "",
          foot_size_us: productData.foot_size_us
            ? String(productData.foot_size_us)
            : "",
          top_length: productData.top_length ? String(productData.top_length) : "",
          bottom_length: productData.bottom_length
            ? String(productData.bottom_length)
            : "",
        });
        setSelectedTags((productData.tags || []).map((tag) => tag.name));
        setCatalog({
          categories,
          tags,
          sizes: sizes.map((item) => ({ value: item.size, label: item.size })),
          colors: colors.map((item) => ({ value: item.color, label: item.color })),
          conditions: conditions.map((item) => ({
            value: item.condition,
            label: item.condition,
          })),
        });
      } catch (loadError) {
        if (active) {
          setError(loadError.message || "Unable to load product.");
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    loadPageData();

    return () => {
      active = false;
    };
  }, [productId, token]);

  const categoryOptions = useMemo(
    () =>
      catalog.categories.map((category) => ({
        value: String(category.id),
        label: category.title,
      })),
    [catalog.categories],
  );

  function handleFormChange(event) {
    const { name, value, type, checked } = event.target;
    setForm((current) => ({
      ...current,
      [name]: type === "checkbox" ? checked : value,
    }));
  }

  function handleMeasurementChange(event) {
    const { name, value } = event.target;
    setMeasurements((current) => ({
      ...current,
      [name]: value,
    }));
  }

  function toggleTag(tagName) {
    setSelectedTags((current) =>
      current.includes(tagName)
        ? current.filter((tag) => tag !== tagName)
        : [...current, tagName],
    );
  }

  function handleNewImages(event) {
    setNewImages(Array.from(event.target.files || []).slice(0, 6));
  }

  function toggleImageRemoval(imageId) {
    setDeleteImageIds((current) =>
      current.includes(imageId)
        ? current.filter((id) => id !== imageId)
        : [...current, imageId],
    );
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setSaving(true);
    setMessage("");
    setError("");

    try {
      const payload = new FormData();
      payload.append("title", form.title);
      payload.append("description", form.description);
      payload.append("quantity", form.quantity || "1");
      payload.append("size", form.size);
      payload.append("color", form.color);
      payload.append("condition", form.condition);
      payload.append("category", form.category);
      payload.append("second_hand_price", form.second_hand_price);

      if (form.original_price) {
        payload.append("original_price", form.original_price);
      }

      if (form.useSellerMeasurements) {
        payload.append("use_seller_measurements", "true");
      }

      measurementConfig.forEach(({ key }) => {
        if (measurements[key] !== "") {
          payload.append(key, measurements[key]);
        }
      });

      selectedTags.forEach((tag) => {
        payload.append("tag_names", tag);
      });

      deleteImageIds.forEach((imageId) => {
        payload.append("delete_image_ids", String(imageId));
      });

      newImages.forEach((image) => {
        payload.append("uploaded_images", image);
      });

      const response = await fetch(buildApiUrl(`/products/${productId}/`), {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: payload,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          typeof data === "string" ? data : JSON.stringify(data, null, 2),
        );
      }

      setMessage("Product updated successfully.");
      router.refresh();
    } catch (saveError) {
      setError(saveError.message || "Failed to update product.");
    } finally {
      setSaving(false);
    }
  }

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
                Product Detail
              </p>
              <h1 className="mt-3 text-3xl font-semibold tracking-tight text-slate-950">
                Edit Product
              </h1>
              <p className="mt-2 text-sm text-slate-600">
                Logged in as {currentUser?.email || currentUser?.username || "Admin"}.
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <Link
                href="/products"
                className="inline-flex items-center justify-center rounded-2xl border border-slate-200 bg-white px-5 py-3 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
              >
                Back To Products
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

        {loading ? (
          <div className="mt-8 rounded-[28px] border border-slate-200 bg-white px-6 py-5 text-sm text-slate-600 shadow-[0_10px_30px_rgba(15,23,42,0.06)]">
            Loading product...
          </div>
        ) : null}

        {error ? (
          <div className="mt-8 rounded-[28px] border border-rose-200 bg-rose-50 px-6 py-5 text-sm text-rose-700 whitespace-pre-wrap">
            {error}
          </div>
        ) : null}

        {product ? (
          <form onSubmit={handleSubmit} className="mt-8 space-y-8">
            <section className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-[0_10px_30px_rgba(15,23,42,0.06)]">
              <SectionTitle title="General Information" />
              <div className="mt-6 grid gap-6 md:grid-cols-2">
                <InputField
                  label="Product Name"
                  name="title"
                  value={form.title}
                  onChange={handleFormChange}
                  placeholder="Enter product name"
                />
                <InputField
                  label="Quantity"
                  name="quantity"
                  value={form.quantity}
                  onChange={handleFormChange}
                  placeholder="1"
                  type="number"
                />
              </div>

              <div className="mt-6">
                <label className="block">
                  <div className="mb-3 text-sm font-medium text-slate-700">
                    Description
                  </div>
                  <textarea
                    name="description"
                    rows={6}
                    value={form.description}
                    onChange={handleFormChange}
                    placeholder="Describe the product"
                    className="w-full rounded-2xl border border-slate-200 bg-white px-5 py-4 text-base text-slate-900 shadow-sm outline-none placeholder:text-slate-400"
                  />
                </label>
              </div>
            </section>

            <section className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-[0_10px_30px_rgba(15,23,42,0.06)]">
              <SectionTitle title="Details" />
              <div className="mt-6 grid gap-6 md:grid-cols-2 xl:grid-cols-4">
                <SelectField
                  label="Category"
                  name="category"
                  value={form.category}
                  onChange={handleFormChange}
                  options={categoryOptions}
                />
                <SelectField
                  label="Color"
                  name="color"
                  value={form.color}
                  onChange={handleFormChange}
                  options={catalog.colors}
                />
                <SelectField
                  label="Condition"
                  name="condition"
                  value={form.condition}
                  onChange={handleFormChange}
                  options={catalog.conditions}
                />
                <SelectField
                  label="Size"
                  name="size"
                  value={form.size}
                  onChange={handleFormChange}
                  options={catalog.sizes}
                />
              </div>

              <div className="mt-6 grid gap-6 md:grid-cols-2">
                <InputField
                  label="Original Price"
                  name="original_price"
                  value={form.original_price}
                  onChange={handleFormChange}
                  placeholder="Original price"
                  type="number"
                />
                <InputField
                  label="Second Hand Price"
                  name="second_hand_price"
                  value={form.second_hand_price}
                  onChange={handleFormChange}
                  placeholder="Second hand price"
                  type="number"
                />
              </div>
            </section>

            <section className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-[0_10px_30px_rgba(15,23,42,0.06)]">
              <SectionTitle title="Measurements" />
              <label className="mt-6 flex items-center gap-3 rounded-2xl bg-slate-50 px-4 py-4">
                <input
                  type="checkbox"
                  name="useSellerMeasurements"
                  checked={form.useSellerMeasurements}
                  onChange={handleFormChange}
                  className="h-5 w-5"
                />
                <span className="text-sm text-slate-700">
                  Use seller measurements
                </span>
              </label>

              <div className="mt-6 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
                {measurementConfig.map((field) => (
                  <InputField
                    key={field.key}
                    label={field.label}
                    name={field.key}
                    value={measurements[field.key]}
                    onChange={handleMeasurementChange}
                    placeholder={`Enter ${field.label}`}
                    type="number"
                  />
                ))}
              </div>
            </section>

            <section className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-[0_10px_30px_rgba(15,23,42,0.06)]">
              <SectionTitle title="Images And Tags" />

              <div className="mt-6">
                <p className="text-sm font-medium text-slate-700">Existing Images</p>
                <div className="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                  {(product.images || []).map((image) => (
                    <label
                      key={image.id}
                      className="rounded-2xl border border-slate-200 bg-slate-50 p-4"
                    >
                      <Image
                        src={image.image}
                        alt=""
                        width={640}
                        height={320}
                        unoptimized
                        className="h-40 w-full rounded-xl object-cover"
                      />
                      <div className="mt-3 flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={deleteImageIds.includes(image.id)}
                          onChange={() => toggleImageRemoval(image.id)}
                        />
                        <span className="text-sm text-slate-700">Remove image</span>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              <div className="mt-6">
                <label className="block">
                  <div className="mb-3 text-sm font-medium text-slate-700">
                    Add New Images
                  </div>
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handleNewImages}
                    className="block w-full text-sm text-slate-600"
                  />
                </label>
              </div>

              <div className="mt-6">
                <p className="text-sm font-medium text-slate-700">Tags</p>
                <div className="mt-4 flex flex-wrap gap-3">
                  {catalog.tags.map((tag) => {
                    const active = selectedTags.includes(tag.name);
                    return (
                      <button
                        key={tag.id}
                        type="button"
                        onClick={() => toggleTag(tag.name)}
                        className={`rounded-2xl border px-4 py-2 text-sm transition ${
                          active
                            ? "border-orange-200 bg-orange-50 text-orange-700"
                            : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
                        }`}
                      >
                        {tag.name}
                      </button>
                    );
                  })}
                </div>
              </div>
            </section>

            <div className="flex flex-wrap gap-3">
              <button
                type="submit"
                disabled={saving}
                className="rounded-2xl bg-slate-950 px-6 py-3 text-sm font-medium text-white transition hover:bg-slate-800 disabled:opacity-50"
              >
                {saving ? "Saving..." : "Save Changes"}
              </button>
            </div>

            {message ? (
              <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-5 py-4 text-sm text-emerald-700">
                {message}
              </div>
            ) : null}
          </form>
        ) : null}
      </div>
    </main>
  );
}
