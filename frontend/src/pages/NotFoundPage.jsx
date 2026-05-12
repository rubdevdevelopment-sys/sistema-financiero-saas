import { Link } from "react-router-dom";

export function NotFoundPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-100 p-6">
      <div className="panel-soft max-w-lg p-8 text-center">
        <h1 className="text-3xl font-semibold text-slate-950">Ruta no encontrada</h1>
        <p className="mt-3 text-sm text-slate-500">
          La pagina que buscas no existe o aun no esta implementada.
        </p>
        <Link className="btn-primary mt-6" to="/dashboard">
          Volver al dashboard
        </Link>
      </div>
    </div>
  );
}
