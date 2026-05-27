import { useContext } from "react";
import { TenantContext } from "../providers/TenantProvider.jsx";

export function useTenant() {
  return useContext(TenantContext);
}
