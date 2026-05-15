export function getApiErrorMessage(error, fallback = "Ocurrio un error inesperado") {
  return (
    error?.response?.data?.message ??
    error?.response?.data?.errors?.formErrors?.[0] ??
    error?.message ??
    fallback
  );
}
