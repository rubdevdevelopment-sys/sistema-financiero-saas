import { useId } from "react";
import { buildFoundationTheme } from "../theme/foundation-theme.js";

const theme = buildFoundationTheme();

export function FoundationInput({
  id,
  label,
  hint,
  error,
  value,
  onChange,
  prefix = null,
  suffix = null,
  multiline = false,
  rows = 4,
  style = {},
  inputStyle = {},
  ...props
}) {
  const generatedId = useId();
  const inputId = id ?? generatedId;
  const hintId = hint ? `${inputId}-hint` : undefined;
  const errorId = error ? `${inputId}-error` : undefined;
  const describedBy = [hintId, errorId].filter(Boolean).join(" ") || undefined;
  const sharedInputStyles = {
    width: "100%",
    border: "none",
    outline: "none",
    background: "transparent",
    color: theme.semantic.text,
    fontFamily: theme.typography.fontFamilies.sans,
    fontSize: theme.typography.fontSizes.base,
    lineHeight: theme.typography.lineHeights.normal
  };

  const InputTag = multiline ? "textarea" : "input";

  return (
    <label
      htmlFor={inputId}
      style={{
        display: "grid",
        gap: theme.spacing[2],
        width: "100%",
        ...style
      }}
    >
      {label ? (
        <span
          style={{
            ...theme.typography.textStyles.bodySmall,
            color: theme.semantic.text,
            fontWeight: theme.typography.fontWeights.semibold
          }}
        >
          {label}
        </span>
      ) : null}
      <span
        style={{
          display: "flex",
          alignItems: multiline ? "flex-start" : "center",
          gap: theme.spacing[3],
          border: `1px solid ${error ? theme.semantic.danger : theme.semantic.border}`,
          borderRadius: theme.radius.xl,
          backgroundColor: theme.semantic.surface,
          padding: `${theme.spacing[3]} ${theme.spacing[4]}`,
          boxShadow: theme.shadows.sm
        }}
      >
        {prefix ? <span style={{ color: theme.semantic.textMuted }}>{prefix}</span> : null}
        <InputTag
          id={inputId}
          value={value}
          onChange={onChange}
          rows={multiline ? rows : undefined}
          aria-invalid={Boolean(error)}
          aria-describedby={describedBy}
          style={{
            ...sharedInputStyles,
            resize: multiline ? "vertical" : undefined,
            minHeight: multiline ? "6rem" : undefined,
            ...inputStyle
          }}
          {...props}
        />
        {suffix ? <span style={{ color: theme.semantic.textMuted }}>{suffix}</span> : null}
      </span>
      {hint ? (
        <span
          id={hintId}
          style={{
            ...theme.typography.textStyles.bodySmall,
            color: theme.semantic.textMuted
          }}
        >
          {hint}
        </span>
      ) : null}
      {error ? (
        <span
          id={errorId}
          style={{
            ...theme.typography.textStyles.bodySmall,
            color: theme.semantic.danger
          }}
        >
          {error}
        </span>
      ) : null}
    </label>
  );
}

export default FoundationInput;
