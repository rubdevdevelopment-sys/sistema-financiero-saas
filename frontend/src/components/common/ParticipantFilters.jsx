export function ParticipantFilters({ filters, onChange, onReset }) {
  return (
    <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-5">
      <input
        className="input-light xl:col-span-2"
        placeholder="Buscar por nombre, documento o telefono"
        value={filters.search}
        onChange={(event) => onChange("search", event.target.value)}
      />
      <select
        className="input-light"
        value={filters.payment_status}
        onChange={(event) => onChange("payment_status", event.target.value)}
      >
        <option value="">Todos los estados</option>
        <option value="completed">Completos</option>
        <option value="partial">Parciales</option>
        <option value="pending">Pendientes</option>
      </select>
      <select
        className="input-light"
        value={filters.active}
        onChange={(event) => onChange("active", event.target.value)}
      >
        <option value="">Todos</option>
        <option value="true">Activos</option>
        <option value="false">Inactivos</option>
      </select>
      <button className="btn-secondary" type="button" onClick={onReset}>
        Limpiar filtros
      </button>
    </div>
  );
}
