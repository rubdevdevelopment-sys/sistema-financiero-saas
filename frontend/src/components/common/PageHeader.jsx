export function PageHeader({ eyebrow, title, description, action }) {
  return (
    <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.25em] text-brand-600">
          {eyebrow}
        </p>
        <h1 className="mt-2 text-3xl font-semibold text-slate-950">{title}</h1>
        <p className="mt-2 max-w-2xl text-sm text-slate-500">{description}</p>
      </div>
      {action}
    </div>
  );
}

export default PageHeader;