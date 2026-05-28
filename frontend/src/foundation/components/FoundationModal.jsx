import { useEffect, useId } from "react";
import { buildFoundationTheme } from "../theme/foundation-theme.js";

const theme = buildFoundationTheme();

export function FoundationModal({
  open,
  title,
  description,
  children,
  footer = null,
  onClose,
  closeOnBackdrop = true
}) {
  const titleId = useId();
  const descriptionId = useId();

  useEffect(() => {
    if (!open) {
      return undefined;
    }

    function handleKeyDown(event) {
      if (event.key === "Escape") {
        onClose?.();
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [open, onClose]);

  if (!open) {
    return null;
  }

  return (
    <div
      role="presentation"
      onClick={closeOnBackdrop ? onClose : undefined}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 60,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: theme.spacing[4],
        backgroundColor: "rgba(15, 23, 42, 0.56)",
        backdropFilter: "blur(10px)"
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={description ? descriptionId : undefined}
        onClick={(event) => event.stopPropagation()}
        style={{
          width: "100%",
          maxWidth: "42rem",
          border: `1px solid ${theme.semantic.border}`,
          borderRadius: theme.radius["3xl"],
          backgroundColor: theme.semantic.surface,
          boxShadow: theme.shadows.xl,
          overflow: "hidden"
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "start",
            justifyContent: "space-between",
            gap: theme.spacing[4],
            padding: theme.layoutSpacing.cardPadding,
            borderBottom: `1px solid ${theme.semantic.border}`
          }}
        >
          <div>
            <h3 id={titleId} style={{ ...theme.typography.textStyles.title, color: theme.semantic.text }}>
              {title}
            </h3>
            {description ? (
              <p
                id={descriptionId}
                style={{
                  ...theme.typography.textStyles.bodySmall,
                  color: theme.semantic.textMuted,
                  marginTop: theme.spacing[2]
                }}
              >
                {description}
              </p>
            ) : null}
          </div>
          <button
            type="button"
            aria-label="Cerrar modal"
            onClick={onClose}
            style={{
              border: `1px solid ${theme.semantic.border}`,
              borderRadius: theme.radius.pill,
              backgroundColor: theme.semantic.surface,
              color: theme.semantic.text,
              padding: `${theme.spacing[2]} ${theme.spacing[3]}`,
              cursor: "pointer"
            }}
          >
            Cerrar
          </button>
        </div>
        <div style={{ padding: theme.layoutSpacing.cardPadding }}>{children}</div>
        {footer ? (
          <div
            style={{
              padding: theme.layoutSpacing.cardPadding,
              borderTop: `1px solid ${theme.semantic.border}`
            }}
          >
            {footer}
          </div>
        ) : null}
      </div>
    </div>
  );
}

export default FoundationModal;
