import { useContext } from "react";
import { TenantProvider } from "../providers/TenantProvider.jsx";
import { SettingsProvider } from "../providers/SettingsProvider.jsx";
import { BrandingProvider } from "../providers/BrandingProvider.jsx";
import { FeatureProvider } from "../providers/FeatureProvider.jsx";
import { ThemeContext, ThemeProvider } from "../providers/ThemeProvider.jsx";
import { useTenant } from "../hooks/useTenant.js";
import { useSettings } from "../hooks/useSettings.js";
import { useRuntimeSettings } from "../hooks/useRuntimeSettings.js";
import { useBranding } from "../hooks/useBranding.js";
import { useFeatures } from "../hooks/useFeatures.js";
import { FoundationFormatterPreview } from "./FoundationFormatterPreview.jsx";
import { formatCurrency } from "../utils/formatCurrency.js";
import { formatDate } from "../utils/formatDate.js";
import { formatNumber } from "../utils/formatNumber.js";
import { formatDateTime } from "../utils/formatDateTime.js";

function Field({ label, value }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3">
      <p className="text-xs uppercase tracking-[0.18em] text-slate-400">{label}</p>
      <p className="mt-2 text-sm font-medium text-slate-900">{String(value)}</p>
    </div>
  );
}

function SandboxReadout() {
  const { tenant } = useTenant();
  const { settings } = useSettings();
  const runtimeSettings = useRuntimeSettings(null, { source: "sandbox_context" });
  const missingRuntimeSettings = useRuntimeSettings(
    {
      timezone: null,
      currency: null,
      locale: null,
      language: null,
      date_format: null,
      number_format: null,
      ready: false
    },
    { source: "sandbox_missing_runtime" }
  );
  const { branding } = useBranding();
  const { features, ready, isEnabled } = useFeatures();
  const { theme } = useContext(ThemeContext);
  const sampleAmount = 1523450.75;
  const sampleNumber = 1234567.89;
  const sampleDate = "2026-05-27T15:45:00.000Z";
  const formattedCurrency = formatCurrency(sampleAmount, runtimeSettings);
  const formattedNumber = formatNumber(sampleNumber, runtimeSettings);
  const formattedDate = formatDate(sampleDate, runtimeSettings);
  const formattedDateTime = formatDateTime(sampleDate, runtimeSettings);
  const fallbackCurrency = formatCurrency(null, missingRuntimeSettings);
  const fallbackNumber = formatNumber(null, missingRuntimeSettings);
  const fallbackDate = formatDate(null, missingRuntimeSettings);
  const fallbackDateTime = formatDateTime(null, missingRuntimeSettings);

  return (
    <div className="space-y-6">
      <section className="rounded-[28px] border border-slate-200 bg-slate-50 p-6">
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">
          Foundation Sandbox
        </p>
        <h2 className="mt-3 text-2xl font-semibold text-slate-950">
          Frontend foundation providers render safely in isolation
        </h2>
        <p className="mt-2 max-w-2xl text-sm text-slate-600">
          This sandbox is intentionally disconnected from global runtime. It validates nested
          providers, hooks, theme shaping, feature checks and fallback defaults only.
        </p>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        <Field label="Tenant Ready" value={tenant.ready} />
        <Field label="Tenant Company" value={tenant.company_id ?? "null"} />
        <Field label="Tenant Slug" value={tenant.slug ?? "null"} />
        <Field label="Timezone" value={settings.timezone} />
        <Field label="Currency" value={settings.currency} />
        <Field label="Locale" value={settings.locale ?? "null"} />
        <Field label="Runtime Timezone" value={runtimeSettings.timezone} />
        <Field label="Runtime Currency" value={runtimeSettings.currency} />
        <Field label="Runtime Locale" value={runtimeSettings.locale} />
        <Field label="Runtime Language" value={runtimeSettings.language} />
        <Field label="Theme Name" value={theme.name} />
        <Field label="Dark Mode" value={theme.darkModeEnabled} />
        <Field label="Feature Count" value={features.length} />
        <Field label="Finance Enabled" value={isEnabled("finance", "staging")} />
        <Field label="Fitness Enabled" value={isEnabled("fitness", "staging")} />
        <Field label="Reports Enabled" value={isEnabled("reports", "staging")} />
      </section>

      <section className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
        <article className="rounded-[28px] border border-slate-200 bg-white p-6">
          <h3 className="text-lg font-semibold text-slate-950">Runtime settings resolution</h3>
          <div className="mt-5 grid gap-3">
            <Field label="Source" value={runtimeSettings.source} />
            <Field label="Ready" value={runtimeSettings.ready} />
            <Field label="Date Format" value={runtimeSettings.date_format} />
            <Field label="Number Format" value={runtimeSettings.number_format} />
            <Field label="Fallback Locale" value={missingRuntimeSettings.locale} />
            <Field label="Fallback Language" value={missingRuntimeSettings.language} />
          </div>
        </article>

        <article className="rounded-[28px] border border-slate-200 bg-white p-6">
          <h3 className="text-lg font-semibold text-slate-950">Formatter preview</h3>
          <div className="mt-5 grid gap-3">
            <Field label="Currency" value={formattedCurrency} />
            <Field label="Number" value={formattedNumber} />
            <Field label="Date" value={formattedDate} />
            <Field label="DateTime" value={formattedDateTime} />
            <Field label="Fallback Currency" value={fallbackCurrency} />
            <Field label="Fallback Number" value={fallbackNumber} />
            <Field label="Fallback Date" value={fallbackDate} />
            <Field label="Fallback DateTime" value={fallbackDateTime} />
          </div>
        </article>

        <article className="rounded-[28px] border border-slate-200 bg-white p-6">
          <h3 className="text-lg font-semibold text-slate-950">Branding snapshot</h3>
          <div className="mt-5 grid gap-3">
            <Field label="Primary" value={branding.primary_color} />
            <Field label="Secondary" value={branding.secondary_color} />
            <Field label="Accent" value={branding.accent_color} />
            <Field label="Theme" value={branding.theme_name} />
          </div>
        </article>

        <article className="rounded-[28px] border border-slate-200 bg-white p-6 xl:col-span-2">
          <h3 className="text-lg font-semibold text-slate-950">Theme preview</h3>
          <div
            className="mt-5 rounded-[24px] border p-6"
            style={{
              borderColor: theme.colors.accent,
              background: theme.colors.background ?? "linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)",
              color: theme.colors.text ?? theme.colors.secondary
            }}
          >
            <div
              className="inline-flex rounded-full px-3 py-1 text-xs font-semibold"
              style={{
                backgroundColor: theme.colors.primary,
                color: theme.colors.secondary
              }}
            >
              {theme.name}
            </div>
            <h4 className="mt-4 text-xl font-semibold">Preview card</h4>
            <p className="mt-2 text-sm">
              This sample card uses only provider-derived values and safe defaults.
            </p>
            <div className="mt-5 flex gap-3">
              <button
                type="button"
                className="rounded-2xl px-4 py-3 text-sm font-semibold"
                style={{
                  backgroundColor: theme.colors.primary,
                  color: theme.colors.secondary
                }}
              >
                Primary action
              </button>
              <button
                type="button"
                className="rounded-2xl border px-4 py-3 text-sm font-semibold"
                style={{
                  borderColor: theme.colors.accent,
                  color: theme.colors.secondary
                }}
              >
                Secondary action
              </button>
            </div>
          </div>
        </article>
      </section>

      <section className="rounded-[28px] border border-slate-200 bg-white p-6">
        <div className="flex items-center justify-between gap-4">
          <h3 className="text-lg font-semibold text-slate-950">Feature rows</h3>
          <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
            Ready: {String(ready)}
          </span>
        </div>
        <div className="mt-5 space-y-3">
          {features.map((feature) => (
            <div
              key={`${feature.feature_key}-${feature.environment ?? "global"}`}
              className="grid gap-2 rounded-2xl border border-slate-100 bg-slate-50 px-4 py-3 md:grid-cols-4"
            >
              <p className="font-medium text-slate-950">{feature.feature_key}</p>
              <p className="text-sm text-slate-600">{feature.environment ?? "global"}</p>
              <p className="text-sm text-slate-600">{String(Boolean(feature.enabled))}</p>
              <p className="text-sm text-slate-500">
                {feature.metadata ? JSON.stringify(feature.metadata) : "null"}
              </p>
            </div>
          ))}
        </div>
      </section>

      <FoundationFormatterPreview
        sampleAmount={sampleAmount}
        sampleNumber={sampleNumber}
        sampleDate={sampleDate}
      />
    </div>
  );
}

const demoTenant = {
  company_id: "demo-company-id",
  slug: "rubdev-demo-company",
  source: "sandbox"
};

const demoSettings = {
  timezone: "America/Bogota",
  locale: "es-CO",
  language: "es",
  currency: "COP",
  date_format: "DD/MM/YYYY",
  number_format: "1.234,56"
};

const demoBranding = {
  primary_color: "#14b8a6",
  secondary_color: "#0f172a",
  accent_color: "#38bdf8",
  background_color: "#f8fafc",
  text_color: "#0f172a",
  dark_mode_enabled: false,
  theme_name: "rubdev-demo"
};

const demoFeatures = [
  { feature_key: "finance", enabled: true, environment: "staging", metadata: { source: "sandbox" } },
  { feature_key: "fitness", enabled: true, environment: "staging", metadata: { source: "sandbox" } },
  { feature_key: "reports", enabled: false, environment: "staging", metadata: { source: "sandbox" } },
  { feature_key: "ai", enabled: false, environment: "staging", metadata: { source: "sandbox" } }
];

export function FoundationRuntimeSandbox({
  initialTenant = demoTenant,
  initialSettings = demoSettings,
  initialBranding = demoBranding,
  initialFeatures = demoFeatures
}) {
  return (
    <TenantProvider initialTenant={initialTenant}>
      <SettingsProvider initialSettings={initialSettings}>
        <BrandingProvider initialBranding={initialBranding}>
          <FeatureProvider initialFeatures={initialFeatures}>
            <ThemeProvider>
              <SandboxReadout />
            </ThemeProvider>
          </FeatureProvider>
        </BrandingProvider>
      </SettingsProvider>
    </TenantProvider>
  );
}

export default FoundationRuntimeSandbox;
