import { FoundationEmptyState } from "../components/FoundationEmptyState.jsx";

export function FoundationTableEmptyState({
  title = "No hay resultados",
  description = "Aun no existen filas para mostrar en esta vista foundation.",
  action = null,
  icon = "▦",
  style = {}
}) {
  return (
    <FoundationEmptyState
      title={title}
      description={description}
      action={action}
      icon={icon}
      style={style}
    />
  );
}

export default FoundationTableEmptyState;
