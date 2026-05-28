export const transitionDurations = {
  fast: "120ms",
  normal: "180ms",
  slow: "260ms"
};

export const transitionEasings = {
  standard: "cubic-bezier(0.2, 0, 0, 1)",
  emphasize: "cubic-bezier(0.2, 0.8, 0.2, 1)",
  exit: "cubic-bezier(0.4, 0, 1, 1)"
};

export const transitionPresets = {
  color: `color ${transitionDurations.normal} ${transitionEasings.standard}, background-color ${transitionDurations.normal} ${transitionEasings.standard}, border-color ${transitionDurations.normal} ${transitionEasings.standard}`,
  transform: `transform ${transitionDurations.normal} ${transitionEasings.emphasize}`,
  shadow: `box-shadow ${transitionDurations.normal} ${transitionEasings.standard}`,
  interactive: `transform ${transitionDurations.fast} ${transitionEasings.emphasize}, box-shadow ${transitionDurations.normal} ${transitionEasings.standard}, background-color ${transitionDurations.normal} ${transitionEasings.standard}`
};

export default {
  transitionDurations,
  transitionEasings,
  transitionPresets
};
