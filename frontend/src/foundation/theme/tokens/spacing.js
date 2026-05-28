export const spacingScale = {
  0: "0",
  1: "0.25rem",
  2: "0.5rem",
  3: "0.75rem",
  4: "1rem",
  5: "1.25rem",
  6: "1.5rem",
  8: "2rem",
  10: "2.5rem",
  12: "3rem",
  16: "4rem",
  20: "5rem",
  24: "6rem"
};

export const layoutSpacing = {
  sectionGap: spacingScale[8],
  cardPadding: spacingScale[6],
  compactCardPadding: spacingScale[4],
  pagePadding: spacingScale[10],
  stackGap: spacingScale[4]
};

export default {
  spacingScale,
  layoutSpacing
};
