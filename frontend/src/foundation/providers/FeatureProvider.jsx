import { createContext, useMemo, useState } from "react";

function buildDefaultFeaturesState(initialFeatures = null) {
  return Array.isArray(initialFeatures) ? initialFeatures : [];
}

const defaultFeaturesState = buildDefaultFeaturesState();

export const FeatureContext = createContext({
  features: defaultFeaturesState,
  ready: false,
  setFeatures: () => {},
  resetFeatures: () => {},
  isEnabled: () => false
});

export function FeatureProvider({ children, initialFeatures = null }) {
  const [features, setFeaturesState] = useState(() =>
    buildDefaultFeaturesState(initialFeatures)
  );

  function setFeatures(nextFeatures) {
    setFeaturesState(buildDefaultFeaturesState(nextFeatures));
  }

  function resetFeatures() {
    setFeaturesState(buildDefaultFeaturesState());
  }

  function isEnabled(featureKey, environment = null) {
    return features.some(
      (feature) =>
        feature?.feature_key === featureKey &&
        Boolean(feature?.enabled) &&
        (environment ? feature?.environment === environment : true)
    );
  }

  const value = useMemo(
    () => ({
      features,
      ready: features.length > 0,
      setFeatures,
      resetFeatures,
      isEnabled
    }),
    [features]
  );

  return <FeatureContext.Provider value={value}>{children}</FeatureContext.Provider>;
}
