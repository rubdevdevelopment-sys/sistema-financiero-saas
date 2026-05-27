import { useContext } from "react";
import { FeatureContext } from "../providers/FeatureProvider.jsx";

export function useFeatures() {
  return useContext(FeatureContext);
}
