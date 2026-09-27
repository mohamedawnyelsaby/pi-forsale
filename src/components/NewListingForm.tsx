"use client";

import { useState } from "react";
import { COUNTRIES, CURRENCIES, KINDS, TYPES } from "@/lib/constants";
import { resizeImageFile } from "@/lib/image-resize";
import type { Dict, Locale } from "@/lib/i18n";

type Status = "idle" | "busy" | "done" | "limit" | "auth" | "error";
const MAX_PHOTOS = 6;

export function NewListingForm({ t, locale }: { t: Dict; locale: Locale }) {
  const [status, setStatus] = useState<Status>("idle");
  const f = t.form;
  const countries = new Intl.DisplayNames([locale], { type: "region" });

  const [photoFiles, setPhotoFiles] = useState<File[]>([]);

  function onPhotosChange(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []).filter((f) => f.type.startsWith("image/"));
    setPhotoFiles(files.slice(0, MAX_PHOTOS));
  }

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const data = new FormData(form);
    const text = (k: string) => String(data.get(k) ?? "").trim();

    setStatus("busy");
    try {
      const body = new FormData();
      for (const k of ["type", "kind", "title", "description", "price", "currency", "areaSqm", "bedrooms", "country", "city", "district"]) {
        const v = text(k);
        if (v) body.append(k, v);
      }
      for (const file of photoFiles) {
        try {
          const resized = await resizeImageFile(file);
          body.append("photos", resized, "photo.jpg");
        } catch {
          // If resizing fails in this browser, skip that photo rather than fail the whole listing.
        }
      }

      const res = await fetch("/api/listings", { method: "POST", body });
      if (res.ok) {
        form.reset();
        setPhotoFiles([]);
        setStatus("done");
      } else {
        setStatus(res.status === 429 ? "limit" : res.status === 401 ? "auth" : "error");
      }
    } catch {
      setStatus("error");
    }
  }

  if (status === "done") {
    return (
      <div className="panel" role="status">
        <p>{f.success}</p>
        <button type="button" className="btn btn-primary" onClick={() => setStatus("idle")}>
          {f.another}
        </button>
      </div>
    );
  }

  const error =
    status === "limit" ? f.errorLimit : status === "auth" ? f.errorAuth : status === "error" ? f.errorGeneric : "";

  return (
    <form onSubmit={onSubmit} className="form">
      <label className="field">
        <span>{f.title}</span>
        <input name="title" required minLength={5} maxLength={120} />
      </label>

      <div className="field-row">
        <label className="field">
          <span>{f.type}</span>
          <select name="type" defaultValue="sale">
            {TYPES.map((v) => (
              <option key={v} value={v}>
                {t.type[v]}
              </option>
            ))}
          </select>
        </label>
        <label className="field">
          <span>{f.kind}</span>
          <select name="kind" defaultValue="apartment">
            {KINDS.map((v) => (
              <option key={v} value={v}>
                {t.kind[v]}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div className="field-row">
        <label className="field">
          <span>{f.price}</span>
          <input name="price" type="number" inputMode="decimal" min="1" step="any" required />
        </label>
        <label className="field">
          <span>{f.currency}</span>
          <select name="currency" defaultValue="EGP">
            {CURRENCIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div className="field-row">
        <label className="field">
          <span>
            {f.area} ({f.optional})
          </span>
          <input name="areaSqm" type="number" inputMode="decimal" min="1" step="any" />
        </label>
        <label className="field">
          <span>
            {f.bedrooms} ({f.optional})
          </span>
          <input name="bedrooms" type="number" inputMode="numeric" min="0" max="50" step="1" />
        </label>
      </div>

      <div className="field-row">
        <label className="field">
          <span>{f.country}</span>
          <select name="country" defaultValue="EG">
            {COUNTRIES.map((c) => (
              <option key={c} value={c}>
                {countries.of(c) ?? c}
              </option>
            ))}
          </select>
        </label>
        <label className="field">
          <span>{f.city}</span>
          <input name="city" required minLength={2} maxLength={80} />
        </label>
      </div>

      <label className="field">
        <span>
          {f.district} ({f.optional})
        </span>
        <input name="district" maxLength={80} />
      </label>

      <label className="field">
        <span>
          {f.description} ({f.optional})
        </span>
        <textarea name="description" rows={5} maxLength={4000} />
      </label>

      <label className="field">
        <span>
          {f.photos} ({f.optional})
        </span>
        <input type="file" accept="image/*" multiple onChange={onPhotosChange} />
        {photoFiles.length > 0 && <span className="hint">{f.photosCount.replace("{n}", String(photoFiles.length))}</span>}
      </label>

      {error && (
        <p className="form-error" role="alert">
          {error}
        </p>
      )}
      <button type="submit" className="btn btn-primary" disabled={status === "busy"}>
        {status === "busy" ? f.submitting : f.submit}
      </button>
    </form>
  );
}
