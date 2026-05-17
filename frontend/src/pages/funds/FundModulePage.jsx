import { PageHeader } from "../../components/common/PageHeader.jsx";

const moduleConfig = {
  shares: {
    eyebrow: "Fondos",
    title: "Gestion de cupos",
    description: "Base para asignar uno o varios cupos por miembro y calcular aportes mensuales.",
    items: ["Cupos por ciclo", "Valor historico del cupo", "Aporte mensual por cupo", "Estado activo o cerrado"]
  },
  loans: {
    eyebrow: "Fondos",
    title: "Prestamos internos",
    description: "Base para cuentas de prestamo, saldos, intereses y plan de cuotas.",
    items: ["Capital prestado", "Saldo pendiente", "Interes mensual", "Cuotas programadas"]
  },
  penalties: {
    eyebrow: "Fondos",
    title: "Multas y mora",
    description: "Base para mora, multas fijas, porcentuales e intereses por atraso.",
    items: ["Multa fija", "Multa porcentual", "Interes mora", "Estado de pago"]
  },
  settlement: {
    eyebrow: "Cierre anual",
    title: "Liquidacion del fondo",
    description: "Base para capital total, utilidad, gastos, cartera, caja y aprobacion de cierre.",
    items: ["Capital colectivo", "Utilidades e intereses", "Gastos", "Cartera activa", "Caja disponible"]
  },
  distributions: {
    eyebrow: "Cierre anual",
    title: "Simulador de reparto",
    description: "Base para distribuir proporcionalmente segun cantidad de cupos del participante.",
    items: ["Total cupos", "Cupos del miembro", "Porcentaje de participacion", "Valor a distribuir"]
  }
};

export function FundModulePage({ type }) {
  const config = moduleConfig[type] ?? moduleConfig.shares;

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow={config.eyebrow}
        title={config.title}
        description={config.description}
      />

      <section className="panel-soft p-6">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <h3 className="text-lg font-semibold text-slate-950">Modulo preparado</h3>
            <p className="mt-1 text-sm text-slate-500">
              La entidad y la navegacion ya existen; la logica financiera se incorporara por fases.
            </p>
          </div>
          <span className="status-badge">Arquitectura lista</span>
        </div>

        <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {config.items.map((item) => (
            <article key={item} className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
              <p className="text-sm font-semibold text-slate-900">{item}</p>
              <p className="mt-2 text-sm text-slate-500">
                Preparado para reglas configurables por empresa y ciclo.
              </p>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}

export default FundModulePage;
