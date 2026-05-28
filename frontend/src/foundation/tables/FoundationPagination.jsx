import { buildFoundationTheme } from "../theme/foundation-theme.js";
import { FoundationButton } from "../components/FoundationButton.jsx";

const theme = buildFoundationTheme();

export function FoundationPagination({
  page = 1,
  totalPages = 1,
  totalItems = 0,
  pageSize = 10,
  onPageChange = () => {},
  style = {}
}) {
  const safePage = Math.max(1, page);
  const safeTotalPages = Math.max(1, totalPages);
  const startItem = totalItems === 0 ? 0 : (safePage - 1) * pageSize + 1;
  const endItem = totalItems === 0 ? 0 : Math.min(totalItems, safePage * pageSize);

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: theme.spacing[4],
        flexWrap: "wrap",
        ...style
      }}
    >
      <p
        style={{
          ...theme.typography.textStyles.bodySmall,
          color: theme.semantic.textMuted
        }}
      >
        {totalItems === 0
          ? "No hay resultados"
          : `Mostrando ${startItem}-${endItem} de ${totalItems}`}
      </p>

      <div style={{ display: "flex", alignItems: "center", gap: theme.spacing[3], flexWrap: "wrap" }}>
        <FoundationButton
          variant="secondary"
          size="sm"
          disabled={safePage <= 1}
          onClick={() => onPageChange(safePage - 1)}
        >
          Anterior
        </FoundationButton>
        <span
          style={{
            ...theme.typography.textStyles.bodySmall,
            color: theme.semantic.text
          }}
        >
          Página {safePage} de {safeTotalPages}
        </span>
        <FoundationButton
          variant="secondary"
          size="sm"
          disabled={safePage >= safeTotalPages}
          onClick={() => onPageChange(safePage + 1)}
        >
          Siguiente
        </FoundationButton>
      </div>
    </div>
  );
}

export default FoundationPagination;
