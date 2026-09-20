import type { Dict } from "@/lib/i18n";

export function SearchForm({
  t,
  defaults = {},
}: {
  t: Dict;
  defaults?: { q?: string; kind?: string; type?: string };
}) {
  return (
    <form action="/listings" method="get" className="search" role="search">
      <input
        name="q"
        type="search"
        defaultValue={defaults.q}
        placeholder={t.searchPlaceholder}
        aria-label={t.search}
        className="search-input"
      />
      <select name="kind" defaultValue={defaults.kind ?? ""} aria-label={t.allKinds} className="search-select">
        <option value="">{t.allKinds}</option>
        {Object.entries(t.kind).map(([value, label]) => (
          <option key={value} value={value}>
            {label}
          </option>
        ))}
      </select>
      <select name="type" defaultValue={defaults.type ?? ""} aria-label={t.type.sale} className="search-select">
        <option value="">{t.type.sale} / {t.type.rent}</option>
        <option value="sale">{t.type.sale}</option>
        <option value="rent">{t.type.rent}</option>
      </select>
      <button type="submit" className="btn btn-primary">
        {t.search}
      </button>
    </form>
  );
}
