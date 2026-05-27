import { query } from "../config/db.js";

const DEFAULT_BRANDING = {
  primary_color: "#14b8a6",
  secondary_color: "#0f172a",
  accent_color: "#38bdf8",
  dark_mode_enabled: false,
  theme_name: "rubdev-default"
};

function normalizeNullableString(value) {
  return typeof value === "string" && value.trim() !== "" ? value.trim() : null;
}

function normalizeNullableBoolean(value) {
  return typeof value === "boolean" ? value : null;
}

function buildBrandingShape(branding, fallback) {
  return {
    id: branding?.id ?? null,
    company_id: branding?.company_id ?? fallback.company_id ?? null,
    logo_url: normalizeNullableString(branding?.logo_url) ?? fallback.logo_url,
    favicon_url: normalizeNullableString(branding?.favicon_url) ?? fallback.favicon_url,
    primary_color: normalizeNullableString(branding?.primary_color) ?? fallback.primary_color,
    secondary_color: normalizeNullableString(branding?.secondary_color) ?? fallback.secondary_color,
    accent_color: normalizeNullableString(branding?.accent_color) ?? fallback.accent_color,
    background_color: normalizeNullableString(branding?.background_color) ?? fallback.background_color,
    text_color: normalizeNullableString(branding?.text_color) ?? fallback.text_color,
    dark_mode_enabled:
      normalizeNullableBoolean(branding?.dark_mode_enabled) ?? fallback.dark_mode_enabled,
    theme_name: normalizeNullableString(branding?.theme_name) ?? fallback.theme_name,
    created_at: branding?.created_at ?? null,
    updated_at: branding?.updated_at ?? null
  };
}

export function buildDefaultBrandingFallback() {
  return {
    id: null,
    company_id: null,
    logo_url: null,
    favicon_url: null,
    primary_color: DEFAULT_BRANDING.primary_color,
    secondary_color: DEFAULT_BRANDING.secondary_color,
    accent_color: DEFAULT_BRANDING.accent_color,
    background_color: null,
    text_color: null,
    dark_mode_enabled: DEFAULT_BRANDING.dark_mode_enabled,
    theme_name: DEFAULT_BRANDING.theme_name,
    created_at: null,
    updated_at: null
  };
}

export async function getCompanyBranding(companyId) {
  if (!companyId) {
    return null;
  }

  const { rows } = await query(
    `
      select *
      from company_branding
      where company_id = $1
      limit 1
    `,
    [companyId]
  );

  return rows[0] ?? null;
}

export async function getCompanyBrandingWithFallback(companyId) {
  if (!companyId) {
    return buildDefaultBrandingFallback();
  }

  const { rows } = await query(
    `
      select *
      from company_branding
      where company_id = $1
      limit 1
    `,
    [companyId]
  );

  const fallback = {
    ...buildDefaultBrandingFallback(),
    company_id: companyId
  };

  return buildBrandingShape(rows[0] ?? null, fallback);
}
