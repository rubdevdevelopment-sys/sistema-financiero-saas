import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from "recharts";

import { PageHeader } from "../../components/common/PageHeader.jsx";
import { StatCard } from "../../components/common/StatCard.jsx";
import { useActiveCompany } from "../../context/ActiveCompanyContext.jsx";
import { useAuth } from "../../context/AuthContext.jsx";
import {
  createFitnessClient,
  createFitnessExercise,
  createFitnessProgram,
  createWorkoutLog,
  getFitnessClients,
  getFitnessDashboard,
  getFitnessExercises,
  getFitnessPrograms,
  getWorkoutLogs
} from "../../services/fitness.service.js";
import { getApiErrorMessage } from "../../utils/api.js";
import { formatDate, integer } from "../../utils/format.js";

const today = new Date().toISOString().slice(0, 10);

const tabs = [
  { key: "overview", label: "Dashboard" },
  { key: "clients", label: "Clientes" },
  { key: "exercises", label: "Ejercicios" },
  { key: "programs", label: "Rutinas" },
  { key: "logs", label: "Registro" }
];

const emptyClient = {
  full_name: "",
  email: "",
  phone: "",
  weight_kg: "",
  height_cm: "",
  goal: "",
  experience_level: "beginner",
  injuries: "",
  status: "active"
};

const emptyExercise = {
  name: "",
  muscle_group: "",
  equipment: "",
  instructions: "",
  video_url: "",
  active: true
};

const emptyProgram = {
  name: "",
  fitness_client_id: "",
  objective: "",
  status: "active",
  starts_on: today
};

const emptyLog = {
  fitness_client_id: "",
  exercise_id: "",
  performed_on: today,
  status: "completed",
  sets_completed: 3,
  reps_completed: 10,
  weight_used: "",
  rir: "",
  rpe: "",
  observations: ""
};

function companyParams(activeCompany) {
  return activeCompany?.id ? { company_id: activeCompany.id } : {};
}

function toNullableNumber(value) {
  return value === "" || value === null || value === undefined ? null : Number(value);
}

function FitnessCard({ title, children, action }) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h3 className="text-base font-semibold text-slate-950">{title}</h3>
        {action}
      </div>
      <div className="mt-5">{children}</div>
    </section>
  );
}

function EmptyState({ label }) {
  return (
    <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-4 py-8 text-center text-sm text-slate-500">
      {label}
    </div>
  );
}

export function FitnessDashboardPage() {
  const { user } = useAuth();
  const { activeCompany } = useActiveCompany();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState("overview");
  const [clientForm, setClientForm] = useState(emptyClient);
  const [exerciseForm, setExerciseForm] = useState(emptyExercise);
  const [programForm, setProgramForm] = useState(emptyProgram);
  const [logForm, setLogForm] = useState(emptyLog);

  const params = useMemo(() => companyParams(activeCompany), [activeCompany]);

  const dashboardQuery = useQuery({
    queryKey: ["fitness-dashboard", params.company_id],
    queryFn: () => getFitnessDashboard(params),
    enabled: Boolean(activeCompany?.id)
  });

  const clientsQuery = useQuery({
    queryKey: ["fitness-clients", params.company_id],
    queryFn: () => getFitnessClients(params),
    enabled: Boolean(activeCompany?.id)
  });

  const exercisesQuery = useQuery({
    queryKey: ["fitness-exercises", params.company_id],
    queryFn: () => getFitnessExercises(params),
    enabled: Boolean(activeCompany?.id)
  });

  const programsQuery = useQuery({
    queryKey: ["fitness-programs", params.company_id],
    queryFn: () => getFitnessPrograms(params),
    enabled: Boolean(activeCompany?.id)
  });

  const logsQuery = useQuery({
    queryKey: ["fitness-logs", params.company_id],
    queryFn: () => getWorkoutLogs(params),
    enabled: Boolean(activeCompany?.id)
  });

  const invalidateFitness = () => {
    queryClient.invalidateQueries({ queryKey: ["fitness-dashboard"] });
    queryClient.invalidateQueries({ queryKey: ["fitness-clients"] });
    queryClient.invalidateQueries({ queryKey: ["fitness-exercises"] });
    queryClient.invalidateQueries({ queryKey: ["fitness-programs"] });
    queryClient.invalidateQueries({ queryKey: ["fitness-logs"] });
  };

  const clientMutation = useMutation({
    mutationFn: createFitnessClient,
    onSuccess: () => {
      setClientForm(emptyClient);
      invalidateFitness();
    }
  });

  const exerciseMutation = useMutation({
    mutationFn: createFitnessExercise,
    onSuccess: () => {
      setExerciseForm(emptyExercise);
      invalidateFitness();
    }
  });

  const programMutation = useMutation({
    mutationFn: createFitnessProgram,
    onSuccess: () => {
      setProgramForm(emptyProgram);
      invalidateFitness();
    }
  });

  const logMutation = useMutation({
    mutationFn: createWorkoutLog,
    onSuccess: () => {
      setLogForm(emptyLog);
      invalidateFitness();
    }
  });

  const dashboard = dashboardQuery.data;
  const clients = clientsQuery.data?.items ?? [];
  const exercises = exercisesQuery.data?.items ?? [];
  const programs = programsQuery.data?.items ?? [];
  const logs = logsQuery.data?.items ?? [];
  const isClient = user?.role === "client";
  const visibleTabs = isClient
    ? tabs.filter((tab) => ["overview", "programs", "logs"].includes(tab.key))
    : tabs;
  const currentProgram = programs.find((program) => program.status === "active") ?? programs[0];
  const visibleError =
    dashboardQuery.error ||
    clientsQuery.error ||
    exercisesQuery.error ||
    programsQuery.error ||
    logsQuery.error ||
    clientMutation.error ||
    exerciseMutation.error ||
    programMutation.error ||
    logMutation.error;

  function handleClientSubmit(event) {
    event.preventDefault();
    clientMutation.mutate({
      ...params,
      ...clientForm,
      weight_kg: toNullableNumber(clientForm.weight_kg),
      height_cm: toNullableNumber(clientForm.height_cm)
    });
  }

  function handleExerciseSubmit(event) {
    event.preventDefault();
    exerciseMutation.mutate({ ...params, ...exerciseForm });
  }

  function handleProgramSubmit(event) {
    event.preventDefault();
    programMutation.mutate({
      ...params,
      ...programForm,
      fitness_client_id: programForm.fitness_client_id || null,
      weeks: [
        {
          week_number: 1,
          focus: programForm.objective || "Base de fuerza",
          days: [
            {
              day_number: 1,
              name: "Dia 1",
              exercises: exercises.slice(0, 3).map((exercise, index) => ({
                exercise_id: exercise.id,
                exercise_order: index + 1,
                planned_sets: 3,
                planned_reps: "8-12",
                target_rir: 2,
                rest_seconds: 90
              }))
            }
          ]
        }
      ]
    });
  }

  function handleLogSubmit(event) {
    event.preventDefault();
    logMutation.mutate({
      ...params,
      ...logForm,
      sets_completed: Number(logForm.sets_completed) || 0,
      reps_completed: Number(logForm.reps_completed) || 0,
      weight_used: toNullableNumber(logForm.weight_used),
      rir: toNullableNumber(logForm.rir),
      rpe: toNullableNumber(logForm.rpe),
      exercise_id: logForm.exercise_id || null
    });
  }

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Fitness"
        title={isClient ? "Mi progreso deportivo" : "Centro de rendimiento"}
        description={
          isClient
            ? "Consulta tu rutina actual, cumplimiento semanal, entrenamientos recientes y records personales."
            : "Gestiona clientes, rutinas, ejercicios y progreso con una vista deportiva multiempresa."
        }
      />

      {visibleError ? (
        <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
          {getApiErrorMessage(visibleError, "No fue posible completar la operacion fitness")}
        </div>
      ) : null}

      <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white p-2 shadow-sm">
        <div className="flex min-w-max gap-2">
          {visibleTabs.map((tab) => (
            <button
              key={tab.key}
              type="button"
              className={`rounded-xl px-4 py-2 text-sm font-semibold transition ${
                activeTab === tab.key
                  ? "bg-slate-950 text-white"
                  : "text-slate-600 hover:bg-slate-100"
              }`}
              onClick={() => setActiveTab(tab.key)}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {activeTab === "overview" ? (
        <div className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <StatCard label="Clientes activos" value={dashboard?.cards?.activeClients ?? 0} accent="bg-lime-500" formatter={integer} />
            <StatCard label="Rutinas activas" value={dashboard?.cards?.activePrograms ?? 0} accent="bg-slate-950" formatter={integer} />
            <StatCard label="Entrenos 30 dias" value={dashboard?.cards?.workouts30d ?? 0} accent="bg-cyan-500" formatter={integer} />
            <StatCard label="Cumplimiento" value={`${dashboard?.cards?.completion ?? 0}%`} accent="bg-fuchsia-500" formatter={(value) => value} />
          </div>

          <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
            {isClient ? (
              <FitnessCard title="Rutina actual">
                {currentProgram ? (
                  <div className="rounded-2xl bg-slate-950 p-5 text-white">
                    <p className="text-xs uppercase tracking-[0.25em] text-lime-300">Plan activo</p>
                    <h3 className="mt-3 text-2xl font-semibold">{currentProgram.name}</h3>
                    <p className="mt-2 text-sm text-slate-300">
                      {currentProgram.objective || "Rutina asignada por tu entrenador"}
                    </p>
                    <div className="mt-5 grid grid-cols-2 gap-3 text-sm">
                      <div className="rounded-2xl bg-white/10 p-4">
                        <p className="text-slate-300">Semanas</p>
                        <p className="mt-1 text-2xl font-semibold">{currentProgram.weeks_count}</p>
                      </div>
                      <div className="rounded-2xl bg-white/10 p-4">
                        <p className="text-slate-300">Dias</p>
                        <p className="mt-1 text-2xl font-semibold">{currentProgram.days_count}</p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <EmptyState label="Aun no tienes una rutina activa asignada." />
                )}
              </FitnessCard>
            ) : null}

            <FitnessCard title="Ritmo semanal">
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={dashboard?.weeklyCompliance ?? []}>
                    <defs>
                      <linearGradient id="fitnessPulse" x1="0" x2="0" y1="0" y2="1">
                        <stop offset="5%" stopColor="#84cc16" stopOpacity={0.5} />
                        <stop offset="95%" stopColor="#06b6d4" stopOpacity={0.06} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                    <XAxis dataKey="label" />
                    <YAxis allowDecimals={false} />
                    <Tooltip />
                    <Area type="monotone" dataKey="workouts" stroke="#0f172a" fill="url(#fitnessPulse)" strokeWidth={2} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </FitnessCard>

            <FitnessCard title="Records personales">
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={dashboard?.personalRecords ?? []}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                    <XAxis dataKey="exercise_name" hide />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="max_weight" fill="#06b6d4" radius={[8, 8, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </FitnessCard>
          </div>

          <FitnessCard title={isClient ? "Mis entrenamientos recientes" : "Entrenamientos recientes"}>
            <div className="grid gap-3 md:grid-cols-2">
              {(dashboard?.recentLogs ?? []).map((item) => (
                <div key={item.id} className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-semibold text-slate-950">{item.client_name}</p>
                      <p className="text-sm text-slate-500">{item.exercise_name || "Sesion registrada"}</p>
                    </div>
                    <span className="rounded-full bg-lime-100 px-3 py-1 text-xs font-semibold text-lime-700">{item.status}</span>
                  </div>
                  <p className="mt-3 text-sm text-slate-600">
                    {item.sets_completed} series | {item.reps_completed} reps | {item.weight_used ?? 0} kg
                  </p>
                </div>
              ))}
              {(dashboard?.recentLogs ?? []).length === 0 ? <EmptyState label="Aun no hay entrenamientos registrados." /> : null}
            </div>
          </FitnessCard>
        </div>
      ) : null}

      {activeTab === "clients" ? (
        <div className="grid gap-6 xl:grid-cols-[0.85fr_1.15fr]">
          <FitnessCard title="Nuevo cliente">
            <form className="grid gap-3" onSubmit={handleClientSubmit}>
              <input className="input-light" placeholder="Nombre completo" value={clientForm.full_name} onChange={(e) => setClientForm({ ...clientForm, full_name: e.target.value })} required />
              <div className="grid gap-3 sm:grid-cols-2">
                <input className="input-light" placeholder="Correo" value={clientForm.email} onChange={(e) => setClientForm({ ...clientForm, email: e.target.value })} />
                <input className="input-light" placeholder="Telefono" value={clientForm.phone} onChange={(e) => setClientForm({ ...clientForm, phone: e.target.value })} />
                <input className="input-light" type="number" placeholder="Peso kg" value={clientForm.weight_kg} onChange={(e) => setClientForm({ ...clientForm, weight_kg: e.target.value })} />
                <input className="input-light" type="number" placeholder="Altura cm" value={clientForm.height_cm} onChange={(e) => setClientForm({ ...clientForm, height_cm: e.target.value })} />
              </div>
              <textarea className="input-light min-h-24" placeholder="Objetivo" value={clientForm.goal} onChange={(e) => setClientForm({ ...clientForm, goal: e.target.value })} />
              <textarea className="input-light min-h-20" placeholder="Lesiones o restricciones" value={clientForm.injuries} onChange={(e) => setClientForm({ ...clientForm, injuries: e.target.value })} />
              <select className="input-light" value={clientForm.experience_level} onChange={(e) => setClientForm({ ...clientForm, experience_level: e.target.value })}>
                <option value="beginner">Principiante</option>
                <option value="intermediate">Intermedio</option>
                <option value="advanced">Avanzado</option>
              </select>
              <button className="btn-primary" type="submit" disabled={clientMutation.isPending}>Crear cliente</button>
            </form>
          </FitnessCard>

          <FitnessCard title="Clientes activos">
            <div className="grid gap-3 md:grid-cols-2">
              {clients.map((client) => (
                <div key={client.id} className="rounded-2xl border border-slate-100 p-4">
                  <p className="font-semibold text-slate-950">{client.full_name}</p>
                  <p className="mt-1 text-sm text-slate-500">{client.goal || "Sin objetivo definido"}</p>
                  <div className="mt-3 flex flex-wrap gap-2 text-xs font-semibold">
                    <span className="rounded-full bg-slate-100 px-3 py-1 text-slate-700">{client.experience_level}</span>
                    <span className="rounded-full bg-lime-100 px-3 py-1 text-lime-700">{client.status}</span>
                  </div>
                </div>
              ))}
              {clients.length === 0 ? <EmptyState label="Crea el primer cliente fitness." /> : null}
            </div>
          </FitnessCard>
        </div>
      ) : null}

      {activeTab === "exercises" ? (
        <div className="grid gap-6 xl:grid-cols-[0.85fr_1.15fr]">
          <FitnessCard title="Nuevo ejercicio">
            <form className="grid gap-3" onSubmit={handleExerciseSubmit}>
              <input className="input-light" placeholder="Nombre" value={exerciseForm.name} onChange={(e) => setExerciseForm({ ...exerciseForm, name: e.target.value })} required />
              <div className="grid gap-3 sm:grid-cols-2">
                <input className="input-light" placeholder="Grupo muscular" value={exerciseForm.muscle_group} onChange={(e) => setExerciseForm({ ...exerciseForm, muscle_group: e.target.value })} required />
                <input className="input-light" placeholder="Equipo" value={exerciseForm.equipment} onChange={(e) => setExerciseForm({ ...exerciseForm, equipment: e.target.value })} />
              </div>
              <input className="input-light" placeholder="Video URL opcional" value={exerciseForm.video_url} onChange={(e) => setExerciseForm({ ...exerciseForm, video_url: e.target.value })} />
              <textarea className="input-light min-h-28" placeholder="Instrucciones" value={exerciseForm.instructions} onChange={(e) => setExerciseForm({ ...exerciseForm, instructions: e.target.value })} />
              <button className="btn-primary" type="submit" disabled={exerciseMutation.isPending}>Crear ejercicio</button>
            </form>
          </FitnessCard>

          <FitnessCard title="Catalogo">
            <div className="grid gap-3 md:grid-cols-2">
              {exercises.map((exercise) => (
                <div key={exercise.id} className="rounded-2xl border border-slate-100 p-4">
                  <p className="font-semibold text-slate-950">{exercise.name}</p>
                  <p className="text-sm text-slate-500">{exercise.muscle_group} | {exercise.equipment || "Sin equipo"}</p>
                  <p className="mt-3 line-clamp-2 text-sm text-slate-600">{exercise.instructions || "Sin instrucciones"}</p>
                </div>
              ))}
              {exercises.length === 0 ? <EmptyState label="Agrega ejercicios para construir rutinas." /> : null}
            </div>
          </FitnessCard>
        </div>
      ) : null}

      {activeTab === "programs" ? (
        <div className="grid gap-6 xl:grid-cols-[0.85fr_1.15fr]">
          {!isClient ? (
          <FitnessCard title="Nueva rutina">
            <form className="grid gap-3" onSubmit={handleProgramSubmit}>
              <input className="input-light" placeholder="Nombre del programa" value={programForm.name} onChange={(e) => setProgramForm({ ...programForm, name: e.target.value })} required />
              <select className="input-light" value={programForm.fitness_client_id} onChange={(e) => setProgramForm({ ...programForm, fitness_client_id: e.target.value })}>
                <option value="">Sin asignar</option>
                {clients.map((client) => <option key={client.id} value={client.id}>{client.full_name}</option>)}
              </select>
              <textarea className="input-light min-h-24" placeholder="Objetivo de entrenamiento" value={programForm.objective} onChange={(e) => setProgramForm({ ...programForm, objective: e.target.value })} />
              <input className="input-light" type="date" value={programForm.starts_on} onChange={(e) => setProgramForm({ ...programForm, starts_on: e.target.value })} />
              <button className="btn-primary" type="submit" disabled={programMutation.isPending || exercises.length === 0}>Crear rutina base</button>
            </form>
          </FitnessCard>
          ) : null}

          <FitnessCard title="Rutinas">
            <div className="space-y-3">
              {programs.map((program) => (
                <div key={program.id} className="rounded-2xl border border-slate-100 p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-semibold text-slate-950">{program.name}</p>
                      <p className="text-sm text-slate-500">{program.client_name || "Sin cliente asignado"}</p>
                    </div>
                    <span className="rounded-full bg-cyan-100 px-3 py-1 text-xs font-semibold text-cyan-700">{program.status}</span>
                  </div>
                  <p className="mt-3 text-sm text-slate-600">{program.weeks_count} semanas | {program.days_count} dias</p>
                </div>
              ))}
              {programs.length === 0 ? (
                <EmptyState label={isClient ? "Tu entrenador aun no ha asignado rutinas." : "Crea rutinas reutilizables para tus clientes."} />
              ) : null}
            </div>
          </FitnessCard>
        </div>
      ) : null}

      {activeTab === "logs" ? (
        <div className="grid gap-6 xl:grid-cols-[0.85fr_1.15fr]">
          <FitnessCard title="Registrar entrenamiento">
            <form className="grid gap-3" onSubmit={handleLogSubmit}>
              <select className="input-light" value={logForm.fitness_client_id} onChange={(e) => setLogForm({ ...logForm, fitness_client_id: e.target.value })} required>
                <option value="">Cliente</option>
                {clients.map((client) => <option key={client.id} value={client.id}>{client.full_name}</option>)}
              </select>
              <select className="input-light" value={logForm.exercise_id} onChange={(e) => setLogForm({ ...logForm, exercise_id: e.target.value })}>
                <option value="">Ejercicio opcional</option>
                {exercises.map((exercise) => <option key={exercise.id} value={exercise.id}>{exercise.name}</option>)}
              </select>
              <div className="grid gap-3 sm:grid-cols-3">
                <input className="input-light" type="date" value={logForm.performed_on} onChange={(e) => setLogForm({ ...logForm, performed_on: e.target.value })} />
                <input className="input-light" type="number" placeholder="Series" value={logForm.sets_completed} onChange={(e) => setLogForm({ ...logForm, sets_completed: e.target.value })} />
                <input className="input-light" type="number" placeholder="Reps" value={logForm.reps_completed} onChange={(e) => setLogForm({ ...logForm, reps_completed: e.target.value })} />
              </div>
              <div className="grid gap-3 sm:grid-cols-3">
                <input className="input-light" type="number" placeholder="Peso kg" value={logForm.weight_used} onChange={(e) => setLogForm({ ...logForm, weight_used: e.target.value })} />
                <input className="input-light" type="number" placeholder="RIR" value={logForm.rir} onChange={(e) => setLogForm({ ...logForm, rir: e.target.value })} />
                <input className="input-light" type="number" placeholder="RPE" value={logForm.rpe} onChange={(e) => setLogForm({ ...logForm, rpe: e.target.value })} />
              </div>
              <select className="input-light" value={logForm.status} onChange={(e) => setLogForm({ ...logForm, status: e.target.value })}>
                <option value="completed">Completado</option>
                <option value="partial">Parcial</option>
                <option value="skipped">Saltado</option>
              </select>
              <textarea className="input-light min-h-20" placeholder="Observaciones" value={logForm.observations} onChange={(e) => setLogForm({ ...logForm, observations: e.target.value })} />
              <button className="btn-primary" type="submit" disabled={logMutation.isPending}>Guardar registro</button>
            </form>
          </FitnessCard>

          <FitnessCard title="Historial">
            <div className="space-y-3">
              {logs.map((log) => (
                <div key={log.id} className="rounded-2xl border border-slate-100 p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-semibold text-slate-950">{log.client_name}</p>
                      <p className="text-sm text-slate-500">{log.exercise_name || "Sesion general"}</p>
                    </div>
                    <p className="text-sm font-semibold text-slate-600">{formatDate(log.performed_on)}</p>
                  </div>
                  <p className="mt-3 text-sm text-slate-600">
                    {log.sets_completed} series | {log.reps_completed} reps | {log.weight_used ?? 0} kg | RPE {log.rpe ?? "-"}
                  </p>
                </div>
              ))}
              {logs.length === 0 ? <EmptyState label="Registra entrenamientos para alimentar el progreso." /> : null}
            </div>
          </FitnessCard>
        </div>
      ) : null}
    </div>
  );
}

export default FitnessDashboardPage;
