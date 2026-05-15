export function FinanceFilters({
  filters,
  categories,
  participants = [],
  showParticipantFilter = false,
  showIncomeTypeFilter = false,
  onChange,
  onReset,
  searchPlaceholder = "Buscar por titulo o descripcion"
}) {
  return (
    <div className={`grid gap-3 md:grid-cols-2 ${showParticipantFilter && showIncomeTypeFilter ? "xl:grid-cols-8" : showParticipantFilter || showIncomeTypeFilter ? "xl:grid-cols-7" : "xl:grid-cols-6"}`}>
      <input
        className="input-light xl:col-span-2"
        placeholder={searchPlaceholder}
        value={filters.search}
        onChange={(event) => onChange("search", event.target.value)}
      />
      <select
        className="input-light"
        value={filters.status}
        onChange={(event) => onChange("status", event.target.value)}
      >
        <option value="">Todos los estados</option>
        <option value="completed">Completados</option>
        <option value="pending">Pendientes</option>
        <option value="cancelled">Cancelados</option>
      </select>
      <select
        className="input-light"
        value={filters.category_id}
        onChange={(event) => onChange("category_id", event.target.value)}
      >
        <option value="">Todas las categorias</option>
        {categories.map((category) => (
          <option key={category.id} value={category.id}>
            {category.name}
          </option>
        ))}
      </select>
      {showIncomeTypeFilter ? (
        <select
          className="input-light"
          value={filters.income_type}
          onChange={(event) => onChange("income_type", event.target.value)}
        >
          <option value="">Todos los tipos</option>
          <option value="participant_payment">Aporte participante</option>
          <option value="donation">Donacion</option>
          <option value="sponsorship">Patrocinio</option>
          <option value="event_income">Ingreso de evento</option>
          <option value="other">Otro ingreso</option>
        </select>
      ) : null}
      {showParticipantFilter ? (
        <select
          className="input-light"
          value={filters.participant_id}
          onChange={(event) => onChange("participant_id", event.target.value)}
        >
          <option value="">Todos los participantes</option>
          {participants.map((participant) => (
            <option key={participant.id} value={participant.id}>
              {participant.full_name}
            </option>
          ))}
        </select>
      ) : null}
      <input
        className="input-light"
        type="date"
        value={filters.date_from}
        onChange={(event) => onChange("date_from", event.target.value)}
      />
      <input
        className="input-light"
        type="date"
        value={filters.date_to}
        onChange={(event) => onChange("date_to", event.target.value)}
      />
      <button className="btn-secondary" type="button" onClick={onReset}>
        Limpiar filtros
      </button>
    </div>
  );
}


export default FinanceFilters;