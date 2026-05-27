import { useContext } from "react";
import { SettingsContext } from "../providers/SettingsProvider.jsx";

export function useSettings() {
  return useContext(SettingsContext);
}
