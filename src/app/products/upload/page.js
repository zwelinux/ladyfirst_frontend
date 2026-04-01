"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
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
  sellerId: "",
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
  customTag: "",
};

const defaultMeasurements = measurementConfig.reduce((acc, item) => {
  acc[item.key] = "";
  return acc;
}, {});

function SectionTitle({ icon, title }) {
  return (
    <div className="flex items-center gap-3">
      <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-slate-100 text-xl">
        {icon}
      </div>
      <h2 className="text-2xl font-semibold text-slate-950">{title}</h2>
    </div>
  );
}

function InputField({
  label,
  name,
  value,
  onChange,
  placeholder,
  required = false,
  type = "text",
  disabled = false,
}) {
  return (
    <label className="block">
      <div className="mb-3 text-sm font-medium text-slate-700">
        {label}
        {required ? <span className="text-orange-500"> *</span> : null}
      </div>
      <input
        name={name}
        type={type}
        value={value}
        onChange={onChange}
        disabled={disabled}
        placeholder={placeholder}
        className="h-14 w-full rounded-2xl border border-slate-200 bg-white px-5 text-base text-slate-900 shadow-sm outline-none transition placeholder:text-slate-400 focus:border-slate-300 disabled:bg-slate-100 disabled:text-slate-400"
      />
    </label>
  );
}

function SelectField({
  label,
  name,
  value,
  onChange,
  options,
  required = false,
}) {
  return (
    <label className="block">
      <div className="mb-3 text-sm font-medium text-slate-700">
        {label}
        {required ? <span className="text-orange-500"> *</span> : null}
      </div>
      <div className="relative">
        <select
          name={name}
          value={value}
          onChange={onChange}
          className="h-14 w-full appearance-none rounded-2xl border border-slate-200 bg-white px-5 pr-12 text-base text-slate-700 shadow-sm outline-none transition focus:border-slate-300"
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

function buildApiUrl(path) {
  return `${API_BASE_URL.replace(/\/$/, "")}/${path.replace(/^\//, "")}`;
}

export default function ProductUploadPage() {
  const router = useRouter();
  const { token, user: currentUser } = useAuthSession();
  const [form, setForm] = useState(defaultForm);
  const [measurements, setMeasurements] = useState(defaultMeasurements);
  const [images, setImages] = useState([]);
  const [selectedTags, setSelectedTags] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [catalog, setCatalog] = useState({
    sellers: [],
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
    if (!token) {
      return;
    }

    let active = true;

    async function loadCatalog() {
      setLoading(true);
      setError("");

      try {
        const [
          sellersResponse,
          categoriesResponse,
          tagsResponse,
          sizesResponse,
          colorsResponse,
          conditionsResponse,
        ] = await Promise.all([
          fetch(buildApiUrl("/users/")),
          fetch(buildApiUrl("/categories/")),
          fetch(buildApiUrl("/tags/")),
          fetch(buildApiUrl("/sizes/")),
          fetch(buildApiUrl("/colors/")),
          fetch(buildApiUrl("/conditions/")),
        ]);

        if (
          !sellersResponse.ok ||
          !categoriesResponse.ok ||
          !tagsResponse.ok ||
          !sizesResponse.ok ||
          !colorsResponse.ok ||
          !conditionsResponse.ok
        ) {
          throw new Error("Failed to load backend form data.");
        }

        const [
          sellers,
          categories,
          tags,
          sizes,
          colors,
          conditions,
        ] = await Promise.all([
          sellersResponse.json(),
          categoriesResponse.json(),
          tagsResponse.json(),
          sizesResponse.json(),
          colorsResponse.json(),
          conditionsResponse.json(),
        ]);

        if (!active) {
          return;
        }

        setCatalog({
          sellers,
          categories,
          tags,
          sizes: sizes.map((item) => ({
            value: item.size,
            label: item.size,
          })),
          colors: colors.map((item) => ({
            value: item.color,
            label: item.color,
          })),
          conditions: conditions.map((item) => ({
            value: item.condition,
            label: item.condition,
          })),
        });
      } catch (loadError) {
        if (active) {
          setError(loadError.message || "Unable to load backend data.");
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    loadCatalog();

    return () => {
      active = false;
    };
  }, [token]);

  const sellerOptions = useMemo(
    () =>
      catalog.sellers.map((seller) => ({
        value: String(seller.id),
        label: seller.email || seller.username || `User ${seller.id}`,
      })),
    [catalog.sellers],
  );

  const categoryOptions = useMemo(
    () =>
      catalog.categories.map((category) => ({
        value: String(category.id),
        label: category.title,
      })),
    [catalog.categories],
  );

  const selectedSeller = useMemo(
    () =>
      catalog.sellers.find((seller) => String(seller.id) === form.sellerId) || null,
    [catalog.sellers, form.sellerId],
  );

  useEffect(() => {
    if (!form.useSellerMeasurements || !selectedSeller) {
      return;
    }

    setMeasurements((current) => ({
      ...current,
      chest_bust: selectedSeller.chest_bust ? String(selectedSeller.chest_bust) : "",
      waist: selectedSeller.waist ? String(selectedSeller.waist) : "",
      hip: selectedSeller.hip ? String(selectedSeller.hip) : "",
      inseam: selectedSeller.inseam ? String(selectedSeller.inseam) : "",
      foot_size_us: selectedSeller.foot_size_us
        ? String(selectedSeller.foot_size_us)
        : "",
    }));
  }, [form.useSellerMeasurements, selectedSeller]);

  function handleFormChange(event) {
    const { name, value, type, checked } = event.target;
    const nextValue = type === "checkbox" ? checked : value;

    setForm((current) => ({
      ...current,
      [name]: nextValue,
    }));
  }

  function handleMeasurementChange(event) {
    const { name, value } = event.target;
    setMeasurements((current) => ({
      ...current,
      [name]: value,
    }));
  }

  function handleImageChange(event) {
    const nextFiles = Array.from(event.target.files || []).slice(0, 6);
    setImages(nextFiles);
  }

  function handleSizeSelect(size) {
    setForm((current) => ({
      ...current,
      size,
    }));
  }

  function toggleTag(tagName) {
    setSelectedTags((current) =>
      current.includes(tagName)
        ? current.filter((tag) => tag !== tagName)
        : [...current, tagName],
    );
  }

  function addCustomTag() {
    const nextTag = form.customTag.trim().toLowerCase();
    if (!nextTag) {
      return;
    }

    setSelectedTags((current) =>
      current.includes(nextTag) ? current : [...current, nextTag],
    );
    setForm((current) => ({
      ...current,
      customTag: "",
    }));
  }

  function clearForm() {
    setForm(defaultForm);
    setMeasurements(defaultMeasurements);
    setImages([]);
    setSelectedTags([]);
    setMessage("");
    setError("");
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setSubmitting(true);
    setMessage("");
    setError("");

    try {
      if (!token) {
        throw new Error("JWT access token is required to call the upload endpoint.");
      }

      const payload = new FormData();
      payload.append("seller_id", form.sellerId);
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

      payload.append(
        "use_seller_measurements",
        form.useSellerMeasurements ? "true" : "false",
      );

      measurementConfig.forEach(({ key }) => {
        if (measurements[key]) {
          payload.append(key, measurements[key]);
        }
      });

      selectedTags.forEach((tag) => {
        payload.append("tag_names", tag);
      });

      images.forEach((image) => {
        payload.append("uploaded_images", image);
      });

      const response = await fetch(buildApiUrl("/products/upload/"), {
        method: "POST",
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

      setMessage(
        `Product created successfully${data.id ? ` with id ${data.id}` : ""}.`,
      );
      clearForm();
    } catch (submitError) {
      setError(submitError.message || "Product upload failed.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="min-h-screen bg-[#f5f7fb] text-slate-900">
      <div className="mx-auto max-w-[1600px] px-5 py-8 lg:px-8">
        <header className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-sm font-medium uppercase tracking-[0.24em] text-orange-500">
              Admin Product Upload
            </p>
            <h1 className="mt-3 text-4xl font-semibold tracking-tight text-slate-950">
              Create Product
            </h1>
            {currentUser ? (
              <p className="mt-3 text-sm text-slate-600">
                Logged in as {currentUser.email || currentUser.username}
              </p>
            ) : null}
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Link
              href="/products"
              className="inline-flex h-14 items-center justify-center rounded-2xl border border-slate-200 bg-white px-6 text-lg font-medium text-slate-700 transition hover:bg-slate-50"
            >
              Products
            </Link>
            <Link
              href="/"
              className="inline-flex h-14 items-center justify-center rounded-2xl px-6 text-lg font-medium text-slate-900 transition hover:bg-slate-100"
            >
              Cancel
            </Link>
            <button
              type="button"
              onClick={clearForm}
              className="h-14 rounded-2xl border border-slate-200 bg-white px-8 text-lg font-medium text-slate-900 shadow-sm transition hover:bg-slate-50"
            >
              Clear
            </button>
            <button
              form="product-upload-form"
              type="submit"
              disabled={submitting || loading}
              className="h-14 rounded-2xl bg-orange-500 px-10 text-lg font-medium text-white transition hover:bg-orange-600 disabled:cursor-not-allowed disabled:bg-orange-300"
            >
              {submitting ? "Creating..." : "Create Product"}
            </button>
          </div>
        </header>

        <form
          id="product-upload-form"
          onSubmit={handleSubmit}
          className="mt-8 grid gap-8 xl:grid-cols-[1.85fr_0.85fr]"
        >
          <section className="space-y-8">
            <div className="rounded-[30px] border border-slate-200 bg-white p-8 shadow-[0_10px_30px_rgba(15,23,42,0.06)]">
              <SectionTitle icon="🧾" title="General Information" />

              <div className="mt-10 space-y-8">
                <SelectField
                  label="Seller"
                  name="sellerId"
                  value={form.sellerId}
                  onChange={handleFormChange}
                  options={sellerOptions}
                  required
                />

                <InputField
                  label="Product Name"
                  name="title"
                  value={form.title}
                  onChange={handleFormChange}
                  placeholder="Enter Product Name"
                />

                <label className="block">
                  <div className="mb-3 text-sm font-medium text-slate-700">
                    Description <span className="text-orange-500">*</span>
                  </div>
                  <textarea
                    name="description"
                    rows={6}
                    value={form.description}
                    onChange={handleFormChange}
                    placeholder="Describe the product"
                    className="w-full rounded-2xl border border-slate-200 bg-white px-5 py-4 text-base text-slate-900 shadow-sm outline-none transition placeholder:text-slate-400 focus:border-slate-300"
                  />
                </label>

                <InputField
                  label="Quantity"
                  name="quantity"
                  value={form.quantity}
                  onChange={handleFormChange}
                  placeholder="1"
                  type="number"
                />
              </div>
            </div>

            <div className="rounded-[30px] border border-slate-200 bg-white p-8 shadow-[0_10px_30px_rgba(15,23,42,0.06)]">
              <SectionTitle icon="👕" title="Sizes & Details" />

              <div className="mt-10 space-y-8">
                <div>
                  <div className="mb-3 text-sm font-medium text-slate-700">
                    Size
                  </div>
                  <div className="flex flex-wrap gap-3">
                    {catalog.sizes.map((sizeOption) => (
                      <button
                        key={sizeOption.value}
                        type="button"
                        onClick={() => handleSizeSelect(sizeOption.value)}
                        className={`min-w-14 rounded-2xl border px-5 py-3 text-lg font-medium transition ${
                          form.size === sizeOption.value
                            ? "border-slate-900 bg-slate-900 text-white"
                            : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
                        }`}
                      >
                        {sizeOption.label}
                      </button>
                    ))}
                  </div>
                </div>

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
              </div>
            </div>

            <div className="rounded-[30px] border border-slate-200 bg-white p-8 shadow-[0_10px_30px_rgba(15,23,42,0.06)]">
              <SectionTitle icon="💲" title="Pricing & Stocks" />

              <div className="mt-10 grid gap-8">
                <InputField
                  label="Original Price"
                  name="original_price"
                  value={form.original_price}
                  onChange={handleFormChange}
                  placeholder="Enter Original Price"
                  type="number"
                />
                <InputField
                  label="Second Hand Price"
                  name="second_hand_price"
                  value={form.second_hand_price}
                  onChange={handleFormChange}
                  placeholder="Enter Second Hand Price"
                  type="number"
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
            </div>

            <div className="rounded-[30px] border border-slate-200 bg-white p-8 shadow-[0_10px_30px_rgba(15,23,42,0.06)]">
              <SectionTitle icon="📏" title="Measurements (cm)" />

              <label className="mt-8 flex items-center gap-4 rounded-2xl bg-slate-50 px-4 py-4">
                <input
                  type="checkbox"
                  name="useSellerMeasurements"
                  checked={form.useSellerMeasurements}
                  onChange={handleFormChange}
                  className="h-6 w-6 rounded border-slate-300"
                />
                <div>
                  <p className="text-base font-medium text-slate-900">
                    Use seller measurements
                  </p>
                  <p className="text-sm text-slate-500">
                    Auto-fill body measurement fields from the selected seller.
                  </p>
                </div>
              </label>

              <div className="mt-10 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
                {measurementConfig.map((field) => {
                  const bodyMeasurementKeys = [
                    "chest_bust",
                    "waist",
                    "hip",
                    "inseam",
                    "foot_size_us",
                  ];
                  const disabled =
                    form.useSellerMeasurements &&
                    bodyMeasurementKeys.includes(field.key);

                  return (
                    <InputField
                      key={field.key}
                      label={field.label}
                      name={field.key}
                      value={measurements[field.key]}
                      onChange={handleMeasurementChange}
                      placeholder={`Enter ${field.label}`}
                      type="number"
                      disabled={disabled}
                    />
                  );
                })}
              </div>
            </div>
          </section>

          <aside className="space-y-8">
            <div className="rounded-[30px] border border-slate-200 bg-white p-8 shadow-[0_10px_30px_rgba(15,23,42,0.06)]">
              <SectionTitle icon="🖼️" title="Upload Images" />

              <div className="mt-10">
                <div className="mb-3 text-sm font-medium text-slate-700">
                  Product Images (Up to 6 images)
                </div>
                <label className="block rounded-[28px] border-2 border-dashed border-slate-300 bg-slate-50 p-8 text-center">
                  <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-white text-4xl text-slate-400 shadow-sm">
                    ↑
                  </div>
                  <p className="mt-6 text-2xl font-medium text-slate-700">
                    Upload main image
                  </p>
                  <p className="mt-2 text-lg text-slate-500">
                    Drag & drop or click to browse
                  </p>
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handleImageChange}
                    className="hidden"
                  />
                </label>

                <ul className="mt-6 space-y-2 text-sm leading-6 text-slate-500">
                  <li>• First image will be the main product image</li>
                  <li>• Upload up to 6 images for one product</li>
                  <li>• Supported formats: JPG, PNG, GIF, WebP</li>
                  <li>• Maximum file size depends on backend/media settings</li>
                </ul>

                {images.length > 0 ? (
                  <div className="mt-6 grid grid-cols-2 gap-3">
                    {images.map((image) => (
                      <div
                        key={`${image.name}-${image.lastModified}`}
                        className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700"
                      >
                        {image.name}
                      </div>
                    ))}
                  </div>
                ) : null}

                <p className="mt-6 text-2xl font-semibold text-slate-700">
                  {images.length} / 6 images ready
                </p>
              </div>
            </div>

            <div className="rounded-[30px] border border-slate-200 bg-white p-8 shadow-[0_10px_30px_rgba(15,23,42,0.06)]">
              <SectionTitle icon="📦" title="Category" />

              <div className="mt-10">
                <SelectField
                  label="Product Category"
                  name="category"
                  value={form.category}
                  onChange={handleFormChange}
                  options={categoryOptions}
                />
              </div>
            </div>

            <div className="rounded-[30px] border border-slate-200 bg-white p-8 shadow-[0_10px_30px_rgba(15,23,42,0.06)]">
              <SectionTitle icon="🏷️" title="Tags" />

              <div className="mt-10">
                <p className="text-lg font-medium text-slate-900">
                  Select relevant tags for your product
                </p>
                <p className="mt-4 text-base text-slate-600">Available Tags:</p>

                <div className="mt-4 flex flex-wrap gap-3">
                  {catalog.tags.map((tag) => {
                    const active = selectedTags.includes(tag.name);
                    return (
                      <button
                        key={tag.id}
                        type="button"
                        onClick={() => toggleTag(tag.name)}
                        className={`rounded-2xl border px-5 py-3 text-lg transition ${
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

                <div className="mt-8 border-t border-slate-200 pt-8">
                  <p className="text-lg font-medium text-slate-900">
                    Create Custom Tag:
                  </p>
                  <div className="mt-4 flex gap-3">
                    <input
                      type="text"
                      value={form.customTag}
                      onChange={(event) =>
                        setForm((current) => ({
                          ...current,
                          customTag: event.target.value,
                        }))
                      }
                      placeholder="Enter custom tag name"
                      className="h-14 flex-1 rounded-2xl border border-slate-200 bg-white px-5 text-base text-slate-900 shadow-sm outline-none transition placeholder:text-slate-400 focus:border-slate-300"
                    />
                    <button
                      type="button"
                      onClick={addCustomTag}
                      className="rounded-2xl border border-orange-200 px-6 text-lg font-medium text-orange-500 transition hover:bg-orange-50"
                    >
                      + Add
                    </button>
                  </div>
                  <p className="mt-3 text-sm text-slate-500">
                    Custom tags will be created if they do not exist.
                  </p>
                </div>

                {selectedTags.length > 0 ? (
                  <div className="mt-6 rounded-2xl bg-slate-50 p-4">
                    <p className="text-sm font-medium text-slate-700">
                      Selected Tags
                    </p>
                    <div className="mt-3 flex flex-wrap gap-2">
                      {selectedTags.map((tag) => (
                        <span
                          key={tag}
                          className="rounded-full bg-slate-900 px-3 py-1 text-sm text-white"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                ) : null}
              </div>
            </div>

            <div className="rounded-[30px] border border-slate-900 bg-slate-950 p-8 text-white shadow-[0_16px_40px_rgba(15,23,42,0.18)]">
              <p className="text-sm font-medium uppercase tracking-[0.24em] text-orange-300">
                Backend Mapping
              </p>
              <div className="mt-6 space-y-3 text-sm text-slate-300">
                <p>API base: `{API_BASE_URL}`</p>
                <p>Seller dropdown maps to `seller_id` for staff uploads.</p>
                <p>Tags map to repeated `tag_names` fields.</p>
                <p>Images map to repeated `uploaded_images` files.</p>
                <p>Body measurements use the selected seller, not the admin.</p>
              </div>
            </div>
          </aside>
        </form>

        {!token ? (
          <div className="mt-6 rounded-2xl border border-slate-200 bg-white px-5 py-4 text-sm text-slate-600">
            Checking session...
          </div>
        ) : null}

        {loading && token ? (
          <div className="mt-6 rounded-2xl border border-slate-200 bg-white px-5 py-4 text-sm text-slate-600">
            Loading sellers, categories, tags, sizes, colors, and conditions from
            the backend...
          </div>
        ) : null}

        {message ? (
          <div className="mt-6 rounded-2xl border border-emerald-200 bg-emerald-50 px-5 py-4 text-sm text-emerald-700">
            {message}
          </div>
        ) : null}

        {error ? (
          <div className="mt-6 rounded-2xl border border-rose-200 bg-rose-50 px-5 py-4 text-sm text-rose-700 whitespace-pre-wrap">
            {error}
          </div>
        ) : null}
      </div>
    </main>
  );
}
