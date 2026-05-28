import { buildFoundationTheme } from "../theme/foundation-theme.js";

const theme = buildFoundationTheme();

export function FoundationPageLayout({
  children,
  sidebar = null,
  sidebarWidth = "18rem",
  maxWidth = "88rem",
  centered = true,
  style = {},
  contentStyle = {},
  sidebarStyle = {},
  ...props
}) {
  return (
    <div
      style={{
        minHeight: "100%",
        width: "100%",
        background: `linear-gradient(180deg, ${theme.semantic.background} 0%, ${theme.colors.neutral[100]} 100%)`,
        color: theme.semantic.text,
        ...style
      }}
      {...props}
    >
      <div
        style={{
          width: "100%",
          maxWidth: centered ? maxWidth : "100%",
          margin: centered ? "0 auto" : 0,
          padding: `${theme.layoutSpacing.pagePadding} ${theme.spacing[5]}`,
          display: "grid",
          gap: theme.layoutSpacing.sectionGap,
          gridTemplateColumns: sidebar ? `minmax(0, ${sidebarWidth}) minmax(0, 1fr)` : "minmax(0, 1fr)"
        }}
      >
        {sidebar ? (
          <aside
            style={{
              alignSelf: "start",
              position: "relative",
              ...sidebarStyle
            }}
          >
            {sidebar}
          </aside>
        ) : null}
        <main
          style={{
            minWidth: 0,
            display: "grid",
            gap: theme.layoutSpacing.sectionGap,
            ...contentStyle
          }}
        >
          {children}
        </main>
      </div>
    </div>
  );
}

export default FoundationPageLayout;
