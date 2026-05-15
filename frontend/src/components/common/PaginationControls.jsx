export function PaginationControls({ page, totalPages, total, pageSize, onPageChange }) {
  return (
    <div className="flex flex-col gap-3 border-t border-slate-200 px-4 py-4 md:flex-row md:items-center md:justify-between">
      <p className="text-sm text-slate-500">
        {total} registros, {pageSize} por pagina
      </p>
      <div className="flex items-center gap-2">
        <button
          type="button"
          className="btn-secondary"
          onClick={() => onPageChange(page - 1)}
          disabled={page <= 1}
        >
          Anterior
        </button>
        <span className="rounded-2xl border border-slate-200 px-4 py-3 text-sm font-medium text-slate-700">
          Pagina {page} de {totalPages}
        </span>
        <button
          type="button"
          className="btn-secondary"
          onClick={() => onPageChange(page + 1)}
          disabled={page >= totalPages}
        >
          Siguiente
        </button>
      </div>
    </div>
  );
}

export default PaginationControls;