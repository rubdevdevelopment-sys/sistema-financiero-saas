import { useContext, useState } from "react";
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
import { FoundationButton } from "../components/FoundationButton.jsx";
import { FoundationCard } from "../components/FoundationCard.jsx";
import { FoundationInput } from "../components/FoundationInput.jsx";
import { FoundationBadge } from "../components/FoundationBadge.jsx";
import { FoundationLoader } from "../components/FoundationLoader.jsx";
import { FoundationEmptyState } from "../components/FoundationEmptyState.jsx";
import { FoundationModal } from "../components/FoundationModal.jsx";
import { FoundationPageLayout } from "../layouts/FoundationPageLayout.jsx";
import { FoundationSection } from "../layouts/FoundationSection.jsx";
import { FoundationGrid } from "../layouts/FoundationGrid.jsx";
import { FoundationPageHeader } from "../layouts/FoundationPageHeader.jsx";
import { FoundationPanel } from "../layouts/FoundationPanel.jsx";
import { formatCurrency } from "../utils/formatCurrency.js";
import { formatDate } from "../utils/formatDate.js";
import { formatNumber } from "../utils/formatNumber.js";
import { formatDateTime } from "../utils/formatDateTime.js";
import { buildFoundationTheme } from "../theme/foundation-theme.js";

function Field({ label, value }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3">
      <p className="text-xs uppercase tracking-[0.18em] text-slate-400">{label}</p>
      <p className="mt-2 text-sm font-medium text-slate-900">{String(value)}</p>
    </div>
  );
}

function SandboxReadout() {
  const [demoInput, setDemoInput] = useState("RubDev SaaS");
  const [demoModalOpen, setDemoModalOpen] = useState(false);
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
  const tokenTheme = buildFoundationTheme(branding);
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

      <section className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
        <article className="rounded-[28px] border border-slate-200 bg-white p-6">
          <h3 className="text-lg font-semibold text-slate-950">Design token preview</h3>
          <div className="mt-5 grid gap-3 md:grid-cols-2">
            <Field label="Token Theme" value={tokenTheme.name} />
            <Field label="Primary 500" value={tokenTheme.colors.primary[500]} />
            <Field label="Neutral 900" value={tokenTheme.colors.neutral[900]} />
            <Field label="Semantic Background" value={tokenTheme.semantic.background} />
            <Field label="Spacing 6" value={tokenTheme.spacing[6]} />
            <Field label="Radius 2xl" value={tokenTheme.radius["2xl"]} />
            <Field label="Title Size" value={tokenTheme.typography.fontSizes["2xl"]} />
            <Field label="Shadow Md" value={tokenTheme.shadows.md} />
          </div>
        </article>

        <article className="rounded-[28px] border border-slate-200 bg-white p-6">
          <h3 className="text-lg font-semibold text-slate-950">Token surfaces</h3>
          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            <div
              className="rounded-[24px] border p-5"
              style={{
                backgroundColor: tokenTheme.semantic.surface,
                borderColor: tokenTheme.semantic.border,
                color: tokenTheme.semantic.text,
                boxShadow: tokenTheme.shadows.md
              }}
            >
              <p className="text-xs uppercase tracking-[0.2em]" style={tokenTheme.typography.textStyles.eyebrow}>
                Foundation
              </p>
              <h4 className="mt-3" style={tokenTheme.typography.textStyles.title}>
                Surface token
              </h4>
              <p className="mt-3" style={tokenTheme.typography.textStyles.body}>
                Tokenized visual primitives can evolve independently from active production pages.
              </p>
            </div>

            <div
              className="rounded-[24px] p-5"
              style={{
                background:
                  tokenTheme.semantic.background ??
                  "linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)",
                color: tokenTheme.branding.text_color,
                boxShadow: tokenTheme.shadows.lg
              }}
            >
              <div className="flex items-center gap-3">
                <span
                  className="inline-flex rounded-full px-3 py-1 text-xs font-semibold"
                  style={{
                    backgroundColor: tokenTheme.branding.primary_color,
                    color: tokenTheme.branding.secondary_color,
                    transition: tokenTheme.transitions.presets.color
                  }}
                >
                  {tokenTheme.name}
                </span>
                <span
                  className="h-3 w-3 rounded-full"
                  style={{ backgroundColor: tokenTheme.branding.accent_color }}
                />
              </div>
              <p className="mt-4 text-sm" style={tokenTheme.typography.textStyles.bodySmall}>
                Future branding can override semantic tokens without forcing a global UI replacement.
              </p>
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

      <section className="space-y-6">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">
            UI Core
          </p>
          <h3 className="mt-2 text-2xl font-semibold text-slate-950">
            Foundation components stay reusable and isolated
          </h3>
        </div>

        <div className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
          <FoundationCard
            eyebrow="Actions"
            title="Foundation buttons, badges and inputs"
            description="This preview uses only the new foundation component layer and theme tokens."
            accent={tokenTheme.semantic.primary}
            footer={
              <div className="flex flex-wrap gap-3">
                <FoundationButton variant="primary">Guardar cambios</FoundationButton>
                <FoundationButton variant="secondary">Vista previa</FoundationButton>
                <FoundationButton variant="ghost">Cancelar</FoundationButton>
                <FoundationButton variant="danger">Desactivar</FoundationButton>
              </div>
            }
          >
            <div className="grid gap-5 md:grid-cols-2">
              <FoundationInput
                label="Workspace"
                value={demoInput}
                onChange={(event) => setDemoInput(event.target.value)}
                hint="Input foundation con defaults seguros y accesibles."
              />
              <FoundationInput
                label="Currency"
                value={runtimeSettings.currency}
                readOnly
                prefix="ISO"
                hint="Resolved from runtime settings."
              />
              <FoundationInput
                label="Summary"
                multiline
                rows={4}
                value="Foundation UI stays disconnected until a later controlled adoption phase."
                readOnly
              />
              <div className="space-y-3">
                <div className="flex flex-wrap gap-2">
                  <FoundationBadge tone="primary">Primary</FoundationBadge>
                  <FoundationBadge tone="success">Ready</FoundationBadge>
                  <FoundationBadge tone="warning">Staging</FoundationBadge>
                  <FoundationBadge tone="danger" outlined>
                    Blocked
                  </FoundationBadge>
                </div>
                <div className="flex flex-wrap gap-3">
                  <FoundationButton variant="primary" onClick={() => setDemoModalOpen(true)}>
                    Open modal
                  </FoundationButton>
                  <FoundationButton variant="secondary" loading>
                    Loading
                  </FoundationButton>
                </div>
              </div>
            </div>
          </FoundationCard>

          <div className="space-y-6">
            <FoundationCard
              eyebrow="Feedback"
              title="Loader"
              description="Loading states remain theme-driven and opt-in."
            >
              <FoundationLoader label="Sincronizando sandbox" />
            </FoundationCard>

            <FoundationEmptyState
              icon="◎"
              title="No active rollout yet"
              description="Foundation UI core exists only for isolated experimentation and future opt-in adoption."
              action={
                <FoundationButton variant="secondary" onClick={() => setDemoModalOpen(true)}>
                  Review component set
                </FoundationButton>
              }
            />
          </div>
        </div>
      </section>

      <FoundationModal
        open={demoModalOpen}
        title="Foundation Modal"
        description="Accessible modal preview using only foundation tokens and isolated state."
        onClose={() => setDemoModalOpen(false)}
        footer={
          <div className="flex flex-wrap justify-end gap-3">
            <FoundationButton variant="ghost" onClick={() => setDemoModalOpen(false)}>
              Close
            </FoundationButton>
            <FoundationButton variant="primary" onClick={() => setDemoModalOpen(false)}>
              Confirm
            </FoundationButton>
          </div>
        }
      >
        <div className="space-y-4">
          <p className="text-sm text-slate-600">
            This modal preview is disconnected from product routes and exists only inside the
            foundation sandbox.
          </p>
          <FoundationBadge tone="info">Runtime-safe preview</FoundationBadge>
        </div>
      </FoundationModal>

      <section className="space-y-6">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">
            Layout Core
          </p>
          <h3 className="mt-2 text-2xl font-semibold text-slate-950">
            Enterprise-ready layout components remain opt-in
          </h3>
        </div>

        <div style={{ overflow: "hidden", borderRadius: tokenTheme.radius["3xl"] }}>
          <FoundationPageLayout
            maxWidth="100%"
            sidebar={
              <FoundationPanel
                title="Sidebar-ready"
                description="This preview shows a future-compatible navigation rail without wiring it globally."
                accent={tokenTheme.semantic.accent}
              >
                <div className="space-y-3">
                  <FoundationBadge tone="primary">Overview</FoundationBadge>
                  <FoundationBadge tone="info" outlined>
                    Analytics
                  </FoundationBadge>
                  <FoundationBadge tone="success" outlined>
                    Foundation
                  </FoundationBadge>
                </div>
              </FoundationPanel>
            }
            style={{
              border: `1px solid ${tokenTheme.semantic.border}`,
              borderRadius: tokenTheme.radius["3xl"]
            }}
          >
            <FoundationPageHeader
              eyebrow="Foundation Layouts"
              title="Composable enterprise shells"
              description="Page, section, grid, panel and header primitives can shape future SaaS experiences without touching current product layouts."
              meta={
                <>
                  <FoundationBadge tone="success">Responsive-ready</FoundationBadge>
                  <FoundationBadge tone="primary">Future-branding-ready</FoundationBadge>
                </>
              }
              actions={
                <>
                  <FoundationButton variant="secondary">Export</FoundationButton>
                  <FoundationButton variant="primary">Create layout</FoundationButton>
                </>
              }
            />

            <FoundationSection
              title="Section composition"
              description="Sections provide predictable spacing, titles and action slots."
              actions={<FoundationButton variant="ghost">See anatomy</FoundationButton>}
            >
              <FoundationGrid autoFit minItemWidth="14rem">
                <FoundationPanel title="Panel A" description="A reusable analytics block.">
                  <p className="text-sm text-slate-600">Content stays decoupled from active dashboards.</p>
                </FoundationPanel>
                <FoundationPanel title="Panel B" description="Token-driven information surface.">
                  <p className="text-sm text-slate-600">Future tenants can override branding later.</p>
                </FoundationPanel>
                <FoundationPanel title="Panel C" description="Future-sidebar-compatible structure.">
                  <p className="text-sm text-slate-600">No production layout replacement occurs here.</p>
                </FoundationPanel>
              </FoundationGrid>
            </FoundationSection>

            <FoundationSection
              title="Grid behavior"
              description="FoundationGrid supports adaptive card groupings with safe defaults."
            >
              <FoundationGrid autoFit minItemWidth="18rem">
                <FoundationCard title="12 active modules" description="Sample metric in a layout shell." />
                <FoundationCard title="4 rollout stages" description="Structured card spacing from tokens." />
                <FoundationCard title="0 global changes" description="This phase stays isolated and opt-in." />
              </FoundationGrid>
            </FoundationSection>
          </FoundationPageLayout>
        </div>
      </section>
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
