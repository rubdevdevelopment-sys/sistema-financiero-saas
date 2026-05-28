import { useRuntimeSettings } from "../hooks/useRuntimeSettings.js";
import { formatCurrency } from "../utils/formatCurrency.js";
import { formatDate } from "../utils/formatDate.js";
import { formatNumber } from "../utils/formatNumber.js";
import { formatDateTime } from "../utils/formatDateTime.js";

function PreviewRow({ label, value }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3">
      <p className="text-xs uppercase tracking-[0.18em] text-slate-400">{label}</p>
      <p className="mt-2 text-sm font-medium text-slate-900">{String(value)}</p>
    </div>
  );
}

export function FoundationFormatterPreview({
  sampleAmount = 1523450.75,
  sampleNumber = 1234567.89,
  sampleDate = "2026-05-27T15:45:00.000Z"
}) {
  const runtimeSettings = useRuntimeSettings(null, { source: "formatter_preview" });

  return (
    <section className="rounded-[28px] border border-slate-200 bg-slate-50 p-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">
            Formatter Preview
          </p>
          <h3 className="mt-2 text-xl font-semibold text-slate-950">
            Foundation formatters stay isolated from active finance formatting
          </h3>
        </div>
        <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-slate-600">
          Source: {runtimeSettings.source}
        </span>
      </div>

      <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <PreviewRow label="Currency" value={formatCurrency(sampleAmount, runtimeSettings)} />
        <PreviewRow label="Number" value={formatNumber(sampleNumber, runtimeSettings)} />
        <PreviewRow label="Date" value={formatDate(sampleDate, runtimeSettings)} />
        <PreviewRow label="DateTime" value={formatDateTime(sampleDate, runtimeSettings)} />
      </div>
    </section>
  );
}

export default FoundationFormatterPreview;
