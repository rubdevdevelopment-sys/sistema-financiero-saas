import { currency } from "../../utils/format.js";

export function StatCard({ label, value, accent = "bg-slate-900" }) {
  return (
    <article className="panel-soft p-5">
      <div className={`h-2 w-16 rounded-full ${accent}`} />
      <p className="mt-4 text-sm text-slate-500">{label}</p>
      <p className="mt-2 text-3xl font-semibold text-slate-950">{currency(value)}</p>
    </article>
  );
}
