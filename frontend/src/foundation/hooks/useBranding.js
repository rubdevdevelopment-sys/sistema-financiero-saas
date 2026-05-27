import { useContext } from "react";
import { BrandingContext } from "../providers/BrandingProvider.jsx";

export function useBranding() {
  return useContext(BrandingContext);
}
