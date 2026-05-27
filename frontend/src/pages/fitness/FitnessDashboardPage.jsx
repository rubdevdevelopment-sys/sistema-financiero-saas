import { useEffect, useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
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

import { Modal } from "../../components/common/Modal.jsx";
import { PageHeader } from "../../components/common/PageHeader.jsx";
import { StatCard } from "../../components/common/StatCard.jsx";
import { useActiveCompany } from "../../context/ActiveCompanyContext.jsx";
import { useAuth } from "../../context/AuthContext.jsx";
import {
  createFitnessClient,
  createFitnessExercise,
  createFitnessProgram,
  createWorkoutLog,
  deleteFitnessClient,
  deleteFitnessExercise,
  deleteFitnessProgram,
  deleteWorkoutLog,
  getFitnessClient,
  getFitnessClients,
  getFitnessDashboard,
  getFitnessExercises,
  getFitnessProgram,
  getFitnessPrograms,
  getWorkoutLogs,
  updateFitnessClient,
  updateFitnessExercise,
  updateFitnessProgram,
  updateWorkoutLog
} from "../../services/fitness.service.js";
import { getApiErrorMessage } from "../../utils/api.js";
import { formatDate, integer } from "../../utils/format.js";

const today = new Date().toISOString().slice(0, 10);
const membershipOptions = [
  { value: "daily", label: "Diaria" },
  { value: "weekly", label: "Semanal" },
  { value: "monthly", label: "Mensual" },
  { value: "quarterly", label: "Trimestral" },
  { value: "semiannual", label: "Semestral" },
  { value: "annual", label: "Anual" },
  { value: "custom", label: "Personalizada" }
];
const difficultyOptions = [
  { value: "beginner", label: "Principiante" },
  { value: "intermediate", label: "Intermedio" },
  { value: "advanced", label: "Avanzado" }
];
const exerciseCategories = ["pecho", "espalda", "pierna", "cardio", "hombro", "gluteo", "abdomen", "movilidad"];
const genderOptions = [
  { value: "female", label: "Femenino" },
  { value: "male", label: "Masculino" },
  { value: "non_binary", label: "No binario" },
  { value: "prefer_not_to_say", label: "Prefiero no decir" },
  { value: "other", label: "Otro" }
];
const tabs = [
  { key: "overview", label: "Dashboard" },
  { key: "clients", label: "Clientes" },
  { key: "exercises", label: "Ejercicios" },
  { key: "programs", label: "Rutinas" },
  { key: "logs", label: "Registro e historial" }
];

const emptyClient = {
  full_name: "",
  email: "",
  phone: "",
  avatar_url: "",
  weight_kg: "",
  height_cm: "",
  goal: "",
  experience_level: "beginner",
  injuries: "",
  status: "active",
  notes: "",
  membership_type: "monthly",
  custom_membership_label: "",
  membership_starts_on: today,
  membership_ends_on: "",
  birth_date: "",
  gender: "",
  body_fat_percentage: "",
  muscle_mass_kg: "",
  bmi: "",
  medical_notes: "",
  fitness_objectives: ""
};

const emptyExercise = {
  name: "",
  muscle_group: "",
  category: "pecho",
  difficulty: "intermediate",
  equipment: "",
  instructions: "",
  video_url: "",
  thumbnail_url: "",
  active: true
};

const emptyLog = {
  fitness_client_id: "",
  exercise_id: "",
  program_id: "",
  workout_day_id: "",
  workout_day_exercise_id: "",
  performed_on: today,
  status: "completed",
  sets_completed: 3,
  reps_completed: 10,
  weight_used: "",
  rir: "",
  rpe: "",
  progress_photo_url: "",
  observations: ""
};

function buildProgramTemplate(clientId = "") {
  return {
    name: "",
    fitness_client_id: clientId,
    objective: "",
    status: "active",
    starts_on: today,
    ends_on: "",
    weeks: [
      {
        week_number: 1,
        focus: "Base de fuerza",
        notes: "",
        days: [
          {
            day_number: 1,
            name: "Dia 1",
            notes: "",
            exercises: []
          }
        ]
      }
    ]
  };
}

function companyParams(activeCompany) {
  return activeCompany?.id ? { company_id: activeCompany.id } : {};
}

function toNullableNumber(value) {
  return value === "" || value === null || value === undefined ? null : Number(value);
}

function toNullableText(value) {
  return value?.trim?.() ? value.trim() : null;
}

function shellClass(active) {
  return active
    ? "rounded-full bg-slate-950 px-4 py-2 text-sm font-semibold text-white"
    : "rounded-full px-4 py-2 text-sm font-semibold text-slate-500 transition hover:bg-slate-100";
}

function SectionCard({ title, subtitle, action, children, className = "" }) {
  return (
    <section className={`rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm lg:p-6 ${className}`}>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h3 className="text-lg font-semibold text-slate-950">{title}</h3>
          {subtitle ? <p className="mt-1 text-sm text-slate-500">{subtitle}</p> : null}
        </div>
        {action}
      </div>
      <div className="mt-5">{children}</div>
    </section>
  );
}

function EmptyState({ label }) {
  return (
    <div className="rounded-[24px] border border-dashed border-slate-200 bg-slate-50 px-4 py-10 text-center text-sm text-slate-500">
      {label}
    </div>
  );
}

function MetricPill({ label, value, tone = "slate" }) {
  const tones = {
    slate: "bg-slate-100 text-slate-700",
    lime: "bg-lime-100 text-lime-700",
    cyan: "bg-cyan-100 text-cyan-700",
    rose: "bg-rose-100 text-rose-700",
    amber: "bg-amber-100 text-amber-700"
  };

  return (
    <div className={`rounded-2xl px-3 py-2 ${tones[tone] ?? tones.slate}`}>
      <p className="text-[11px] uppercase tracking-[0.22em] opacity-70">{label}</p>
      <p className="mt-1 text-sm font-semibold">{value}</p>
    </div>
  );
}

function ClientSummaryCard({ client, onOpen, onEdit, onDelete }) {
  return (
    <article className="rounded-[26px] border border-slate-200 bg-[linear-gradient(180deg,#ffffff_0%,#f8fafc_100%)] p-4 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-950 text-sm font-semibold text-white">
            {client.avatar_url ? <img alt={client.full_name} className="h-12 w-12 rounded-2xl object-cover" src={client.avatar_url} /> : client.full_name.slice(0, 2).toUpperCase()}
          </div>
          <div>
            <p className="font-semibold text-slate-950">{client.full_name}</p>
            <p className="text-sm text-slate-500">{client.membership_label || "Sin membresia"}</p>
          </div>
        </div>
        <span className={`status-badge ${client.membership_expired ? "status-danger-soft" : client.status === "active" ? "status-ok" : "status-muted"}`}>
          {client.membership_expired ? "Vencida" : client.status}
        </span>
      </div>
      <div className="mt-4 grid grid-cols-2 gap-2">
        <MetricPill label="Plan" value={client.membership_ends_on ? formatDate(client.membership_ends_on) : "Abierto"} tone={client.membership_expired ? "rose" : "cyan"} />
        <MetricPill label="Ultimo entreno" value={client.last_workout_on ? formatDate(client.last_workout_on) : "Sin registro"} tone="slate" />
      </div>
      <p className="mt-4 text-sm text-slate-600">{client.goal || client.fitness_objectives || "Sin objetivo definido"}</p>
      <div className="mt-4 flex flex-wrap gap-2">
        <button className="btn-secondary" type="button" onClick={() => onOpen(client)}>
          Ver detalle
        </button>
        <button className="btn-secondary" type="button" onClick={() => onEdit(client)}>
          Editar
        </button>
        <button className="btn-danger" type="button" onClick={() => onDelete(client)}>
          Desactivar
        </button>
      </div>
    </article>
  );
}

function ProgramDayBuilder({ day, exercises, onChange, onAddExercise, onRemoveExercise }) {
  return (
    <div className="rounded-3xl border border-slate-200 bg-slate-50 p-4">
      <div className="grid gap-3 lg:grid-cols-[120px_1fr]">
        <input className="input-light" type="number" min="1" max="7" value={day.day_number} onChange={(event) => onChange({ ...day, day_number: Number(event.target.value) })} />
        <input
  className="input-light"
  value={day.name || `Dia ${day.day_number}`}
  onChange={(event) =>
    updateDay(weekIndex, dayIndex, {
      name: event.target.value
    })
  }
  placeholder="Nombre del día"
/>
      </div>
      <textarea className="input-light mt-3 min-h-20" value={day.notes} onChange={(event) => onChange({ ...day, notes: event.target.value })} placeholder="Notas del entrenador" />
      <div className="mt-4 space-y-3">
        {day.exercises.map((exerciseItem, index) => (
          <div key={`${exerciseItem.exercise_id}-${index}`} className="rounded-[24px] border border-slate-200 bg-white p-4">
            <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
              <select className="input-light" value={exerciseItem.exercise_id} onChange={(event) => onChange({ ...day, exercises: day.exercises.map((entry, entryIndex) => entryIndex === index ? { ...entry, exercise_id: event.target.value } : entry) })}>
                <option value="">Ejercicio</option>
                {exercises.map((exercise) => <option key={exercise.id} value={exercise.id}>{exercise.name}</option>)}
              </select>
              <input className="input-light" value={exerciseItem.block_name || ""} onChange={(event) => onChange({ ...day, exercises: day.exercises.map((entry, entryIndex) => entryIndex === index ? { ...entry, block_name: event.target.value } : entry) })} placeholder="Bloque / superserie" />
              <select className="input-light" value={exerciseItem.block_type} onChange={(event) => onChange({ ...day, exercises: day.exercises.map((entry, entryIndex) => entryIndex === index ? { ...entry, block_type: event.target.value } : entry) })}>
                <option value="straight">Serie directa</option>
                <option value="superset">Superserie</option>
                <option value="circuit">Circuito</option>
                <option value="finisher">Finisher</option>
                <option value="mobility">Movilidad</option>
              </select>
              <input className="input-light" value={exerciseItem.superset_group || ""} onChange={(event) => onChange({ ...day, exercises: day.exercises.map((entry, entryIndex) => entryIndex === index ? { ...entry, superset_group: event.target.value } : entry) })} placeholder="Grupo SS (A1, A2)" />
            </div>
            <div className="mt-3 grid gap-3 md:grid-cols-2 xl:grid-cols-5">
              <input className="input-light" type="number" min="1" value={exerciseItem.planned_sets} onChange={(event) => onChange({ ...day, exercises: day.exercises.map((entry, entryIndex) => entryIndex === index ? { ...entry, planned_sets: Number(event.target.value) } : entry) })} placeholder="Series" />
              <input className="input-light" value={exerciseItem.planned_reps} onChange={(event) => onChange({ ...day, exercises: day.exercises.map((entry, entryIndex) => entryIndex === index ? { ...entry, planned_reps: event.target.value } : entry) })} placeholder="Reps" />
              <input className="input-light" type="number" min="0" value={exerciseItem.rest_seconds || ""} onChange={(event) => onChange({ ...day, exercises: day.exercises.map((entry, entryIndex) => entryIndex === index ? { ...entry, rest_seconds: event.target.value === "" ? "" : Number(event.target.value) } : entry) })} placeholder="Descanso" />
              <input className="input-light" type="number" min="0" value={exerciseItem.target_rir || ""} onChange={(event) => onChange({ ...day, exercises: day.exercises.map((entry, entryIndex) => entryIndex === index ? { ...entry, target_rir: event.target.value === "" ? "" : Number(event.target.value) } : entry) })} placeholder="RIR" />
              <input className="input-light" type="number" min="1" max="10" value={exerciseItem.target_rpe || ""} onChange={(event) => onChange({ ...day, exercises: day.exercises.map((entry, entryIndex) => entryIndex === index ? { ...entry, target_rpe: event.target.value === "" ? "" : Number(event.target.value) } : entry) })} placeholder="RPE" />
            </div>
            <div className="mt-3 flex justify-end">
              <button className="btn-danger" type="button" onClick={() => onRemoveExercise(index)}>Quitar ejercicio</button>
            </div>
          </div>
        ))}
      </div>
      <div className="mt-4">
        <button className="btn-secondary" type="button" onClick={onAddExercise}>Agregar ejercicio</button>
      </div>
    </div>
  );
}

export function FitnessDashboardPage() {
  const { user } = useAuth();
  const { activeCompany } = useActiveCompany();
  const queryClient = useQueryClient();
  const isClient = user?.role === "client";
  const params = useMemo(() => companyParams(activeCompany), [activeCompany]);
  const [activeTab, setActiveTab] = useState("overview");
  const [clientFilters, setClientFilters] = useState({ search: "", membership_type: "", status: "" });
  const [exerciseFilters, setExerciseFilters] = useState({ search: "", category: "", difficulty: "" });
  const [logFilters, setLogFilters] = useState({ date_from: "", date_to: "" });
  const [clientForm, setClientForm] = useState(emptyClient);
  const [exerciseForm, setExerciseForm] = useState(emptyExercise);
  const [logForm, setLogForm] = useState(emptyLog);
  const [programForm, setProgramForm] = useState(buildProgramTemplate());
  const [editingClient, setEditingClient] = useState(null);
  const [editingExercise, setEditingExercise] = useState(null);
  const [editingLog, setEditingLog] = useState(null);
  const [editingProgram, setEditingProgram] = useState(null);
  const [detailClientId, setDetailClientId] = useState(null);
  const [previewProgramId, setPreviewProgramId] = useState(null);
  const [openClientModal, setOpenClientModal] = useState(false);
  const [openExerciseModal, setOpenExerciseModal] = useState(false);
  const [openProgramModal, setOpenProgramModal] = useState(false);
  const [openLogModal, setOpenLogModal] = useState(false);

  const visibleTabs = isClient ? tabs.filter((tab) => ["overview", "programs", "logs"].includes(tab.key)) : tabs;

  const dashboardQuery = useQuery({
    queryKey: ["fitness-dashboard", params.company_id],
    queryFn: () => getFitnessDashboard(params),
    enabled: Boolean(activeCompany?.id)
  });
  const clientsQuery = useQuery({
    queryKey: ["fitness-clients", params.company_id, clientFilters],
    queryFn: () => getFitnessClients({ ...params, ...clientFilters }),
    enabled: Boolean(activeCompany?.id)
  });
  const exercisesQuery = useQuery({
    queryKey: ["fitness-exercises", params.company_id, exerciseFilters],
    queryFn: () => getFitnessExercises({ ...params, ...exerciseFilters }),
    enabled: Boolean(activeCompany?.id)
  });
  const programsQuery = useQuery({
    queryKey: ["fitness-programs", params.company_id],
    queryFn: () => getFitnessPrograms(params),
    enabled: Boolean(activeCompany?.id)
  });
  const logsQuery = useQuery({
    queryKey: ["fitness-logs", params.company_id, logFilters],
    queryFn: () => getWorkoutLogs({ ...params, ...logFilters }),
    enabled: Boolean(activeCompany?.id)
  });
  const clientDetailQuery = useQuery({
    queryKey: ["fitness-client-detail", detailClientId],
    queryFn: () => getFitnessClient(detailClientId, params),
    enabled: Boolean(detailClientId)
  });
  const programPreviewQuery = useQuery({
    queryKey: ["fitness-program", previewProgramId],
    queryFn: () => getFitnessProgram(previewProgramId, params),
    enabled: Boolean(previewProgramId)
  });

  const clients = clientsQuery.data?.items ?? [];
  const exercises = exercisesQuery.data?.items ?? [];
  const programs = programsQuery.data?.items ?? [];
  const logs = logsQuery.data?.items ?? [];
  const dashboard = dashboardQuery.data;
  const profile = dashboard?.profile;
  const activeProgram = dashboard?.activeProgram || programs.find((program) => program.status === "active");

  function invalidateFitness() {
    queryClient.invalidateQueries({ queryKey: ["fitness-dashboard"] });
    queryClient.invalidateQueries({ queryKey: ["fitness-clients"] });
    queryClient.invalidateQueries({ queryKey: ["fitness-exercises"] });
    queryClient.invalidateQueries({ queryKey: ["fitness-programs"] });
    queryClient.invalidateQueries({ queryKey: ["fitness-logs"] });
  }

  function success(message) {
    toast.success(message);
    invalidateFitness();
  }

  const clientMutation = useMutation({
    mutationFn: (payload) => editingClient ? updateFitnessClient(editingClient.id, payload) : createFitnessClient(payload),
    onSuccess: () => {
      success(editingClient ? "Cliente actualizado" : "Cliente creado");
      setOpenClientModal(false);
      setEditingClient(null);
      setClientForm(emptyClient);
    },
    onError: (error) => toast.error(getApiErrorMessage(error, "No fue posible guardar el cliente"))
  });
  const exerciseMutation = useMutation({
    mutationFn: (payload) => editingExercise ? updateFitnessExercise(editingExercise.id, payload) : createFitnessExercise(payload),
    onSuccess: () => {
      success(editingExercise ? "Ejercicio actualizado" : "Ejercicio creado");
      setOpenExerciseModal(false);
      setEditingExercise(null);
      setExerciseForm(emptyExercise);
    },
    onError: (error) => toast.error(getApiErrorMessage(error, "No fue posible guardar el ejercicio"))
  });

const normalizedProgram = {
  ...programForm,

  starts_on: programForm.starts_on
    ? programForm.starts_on.split("T")[0]
    : null,

  ends_on: programForm.ends_on
    ? programForm.ends_on.split("T")[0]
    : null,

  weeks: (programForm.weeks || []).map((week) => ({
    ...week,

    title: week.title || `Semana ${week.week_number}`,

    days: (week.days || []).map((day) => ({
      ...day,

      name: day.name || `Dia ${day.day_number}`,

      exercises: (day.exercises || []).map((exercise) => ({
        ...exercise,

        sets: Number(exercise.sets || 0),
        rest_seconds: Number(exercise.rest_seconds || 0),

        rir:
          exercise.rir === "" ||
          exercise.rir === null ||
          exercise.rir === undefined
            ? null
            : Number(exercise.rir)
      }))
    }))
  }))
};

  const programMutation = useMutation({
    mutationFn: (payload) => editingProgram ? updateFitnessProgram(editingProgram.id, payload) : createFitnessProgram(payload),
    onSuccess: () => {
      success(editingProgram ? "Rutina actualizada" : "Rutina creada");
      setOpenProgramModal(false);
      setEditingProgram(null);
      setProgramForm(buildProgramTemplate());
    },
    onError: (error) => toast.error(getApiErrorMessage(error, "No fue posible guardar la rutina"))
  });
  const logMutation = useMutation({
    mutationFn: (payload) => editingLog ? updateWorkoutLog(editingLog.id, payload) : createWorkoutLog(payload),
    onSuccess: () => {
      success(editingLog ? "Registro actualizado" : "Entrenamiento registrado");
      setOpenLogModal(false);
      setEditingLog(null);
      setLogForm(emptyLog);
    },
    onError: (error) => toast.error(getApiErrorMessage(error, "No fue posible guardar el registro"))
  });

  const deleteClientMutation = useMutation({
    mutationFn: (id) => deleteFitnessClient(id),
    onSuccess: () => success("Cliente desactivado"),
    onError: (error) => toast.error(getApiErrorMessage(error, "No fue posible desactivar el cliente"))
  });
  const deleteExerciseMutation = useMutation({
    mutationFn: (id) => deleteFitnessExercise(id),
    onSuccess: () => success("Ejercicio desactivado"),
    onError: (error) => toast.error(getApiErrorMessage(error, "No fue posible desactivar el ejercicio"))
  });
  const deleteProgramMutation = useMutation({
    mutationFn: (id) => deleteFitnessProgram(id),
    onSuccess: () => success("Rutina archivada"),
    onError: (error) => toast.error(getApiErrorMessage(error, "No fue posible archivar la rutina"))
  });
  const deleteLogMutation = useMutation({
    mutationFn: (id) => deleteWorkoutLog(id),
    onSuccess: () => success("Registro eliminado"),
    onError: (error) => toast.error(getApiErrorMessage(error, "No fue posible eliminar el registro"))
  });

  useEffect(() => {
    if (isClient && profile?.id) {
      setLogForm((current) => ({ ...current, fitness_client_id: profile.id }));
    }
  }, [isClient, profile?.id]);

  function resetClientModal(client = null) {
    setEditingClient(client);
    setClientForm(client ? {
      full_name: client.full_name || "",
      email: client.email || "",
      phone: client.phone || "",
      avatar_url: client.avatar_url || "",
      weight_kg: client.weight_kg || "",
      height_cm: client.height_cm || "",
      goal: client.goal || "",
      experience_level: client.experience_level || "beginner",
      injuries: client.injuries || "",
      status: client.status || "active",
      notes: client.notes || "",
      membership_type: client.membership_type || "monthly",
      custom_membership_label: client.custom_membership_label || "",
      membership_starts_on: client.membership_starts_on || today,
      membership_ends_on: client.membership_ends_on || "",
      birth_date: client.birth_date || "",
      gender: client.gender || "",
      body_fat_percentage: client.body_fat_percentage || "",
      muscle_mass_kg: client.muscle_mass_kg || "",
      bmi: client.bmi || "",
      medical_notes: client.medical_notes || "",
      fitness_objectives: client.fitness_objectives || ""
    } : emptyClient);
    setOpenClientModal(true);
  }

  function resetExerciseModal(exercise = null) {
    setEditingExercise(exercise);
    setExerciseForm(exercise ? {
      name: exercise.name || "",
      muscle_group: exercise.muscle_group || "",
      category: exercise.category || "pecho",
      difficulty: exercise.difficulty || "intermediate",
      equipment: exercise.equipment || "",
      instructions: exercise.instructions || "",
      video_url: exercise.video_url || "",
      thumbnail_url: exercise.thumbnail_url || "",
      active: exercise.active ?? true
    } : emptyExercise);
    setOpenExerciseModal(true);
  }

  async function resetProgramModal(program = null) {
    if (!program) {
      setEditingProgram(null);
      setProgramForm(buildProgramTemplate());
      setOpenProgramModal(true);
      return;
    }

    const fullProgram = await getFitnessProgram(program.id, params);
    setEditingProgram(program);
    setProgramForm({
      name: fullProgram.name || "",
      fitness_client_id: fullProgram.fitness_client_id || "",
      objective: fullProgram.objective || "",
      status: fullProgram.status || "active",
      starts_on: fullProgram.starts_on || today,
      ends_on: fullProgram.ends_on || "",
      weeks: (fullProgram.structure || []).map((week) => ({
        week_number: week.week_number,
        focus: week.focus || "",
        notes: week.notes || "",
        days: week.days.map((day) => ({
          day_number: day.day_number,
          name: day.name || "",
          notes: day.notes || "",
          exercises: day.exercises.map((exercise) => ({
            exercise_id: exercise.exercise?.id || "",
            exercise_order: exercise.exercise_order,
            block_name: exercise.block_name || "",
            block_type: exercise.block_type || "straight",
            superset_group: exercise.superset_group || "",
            planned_sets: exercise.planned_sets || 3,
            planned_reps: exercise.planned_reps || "8-12",
            planned_weight: exercise.planned_weight || "",
            target_rir: exercise.target_rir || "",
            target_rpe: exercise.target_rpe || "",
            rest_seconds: exercise.rest_seconds || "",
            notes: exercise.notes || ""
          }))
        }))
      }))
    });
    setOpenProgramModal(true);
  }

  function resetLogModal(log = null) {
    setEditingLog(log);
    setLogForm(log ? {
      fitness_client_id: log.fitness_client_id || "",
      exercise_id: log.exercise_id || "",
      program_id: log.program_id || "",
      workout_day_id: log.workout_day_id || "",
      workout_day_exercise_id: log.workout_day_exercise_id || "",
      performed_on: log.performed_on || today,
      status: log.status || "completed",
      sets_completed: log.sets_completed || 0,
      reps_completed: log.reps_completed || 0,
      weight_used: log.weight_used || "",
      rir: log.rir || "",
      rpe: log.rpe || "",
      progress_photo_url: log.progress_photo_url || "",
      observations: log.observations || ""
    } : { ...emptyLog, fitness_client_id: isClient ? profile?.id || "" : "" });
    setOpenLogModal(true);
  }

  function submitClient(event) {
    event.preventDefault();
    clientMutation.mutate({
      ...params,
      ...clientForm,
      weight_kg: toNullableNumber(clientForm.weight_kg),
      height_cm: toNullableNumber(clientForm.height_cm),
      body_fat_percentage: toNullableNumber(clientForm.body_fat_percentage),
      muscle_mass_kg: toNullableNumber(clientForm.muscle_mass_kg),
      bmi: toNullableNumber(clientForm.bmi),
      custom_membership_label: toNullableText(clientForm.custom_membership_label),
      membership_ends_on: clientForm.membership_ends_on || null,
      birth_date: clientForm.birth_date || null,
      gender: clientForm.gender || null,
      avatar_url: toNullableText(clientForm.avatar_url)
    });
  }

  function submitExercise(event) {
    event.preventDefault();
    exerciseMutation.mutate({ ...params, ...exerciseForm });
  }

function submitProgram(event) {
  event.preventDefault();

  programMutation.mutate({
    ...params,
    ...normalizedProgram,
    fitness_client_id: programForm.fitness_client_id || null,
    starts_on: normalizedProgram.starts_on,
    ends_on: normalizedProgram.ends_on,
    weeks: programForm.weeks.map((week) => ({
      ...week,
      days: week.days.map((day) => ({
  ...day,

  name:
    day.name && day.name.trim() !== ""
      ? day.name
      : `Dia ${day.day_number}`,

  exercises: day.exercises
          .filter((item) => item.exercise_id)
          .map((item, index) => ({
            ...item,
            exercise_order: index + 1,
            planned_weight: toNullableNumber(item.planned_weight),
            target_rir: toNullableNumber(item.target_rir),
            target_rpe: toNullableNumber(item.target_rpe),
            rest_seconds: toNullableNumber(item.rest_seconds),
            block_name: toNullableText(item.block_name),
            superset_group: toNullableText(item.superset_group),
            notes: toNullableText(item.notes)
          }))
      }))
    }))
  });
}

  function submitLog(event) {
    event.preventDefault();
    logMutation.mutate({
      ...params,
      ...logForm,
      fitness_client_id: isClient ? profile?.id : logForm.fitness_client_id,
      exercise_id: logForm.exercise_id || null,
      program_id: logForm.program_id || null,
      workout_day_id: logForm.workout_day_id || null,
      workout_day_exercise_id: logForm.workout_day_exercise_id || null,
      sets_completed: Number(logForm.sets_completed) || 0,
      reps_completed: Number(logForm.reps_completed) || 0,
      weight_used: toNullableNumber(logForm.weight_used),
      rir: toNullableNumber(logForm.rir),
      rpe: toNullableNumber(logForm.rpe),
      progress_photo_url: toNullableText(logForm.progress_photo_url)
    });
  }

  function updateWeek(nextWeek, weekIndex) {
    setProgramForm((current) => ({
      ...current,
      weeks: current.weeks.map((week, index) => index === weekIndex ? nextWeek : week)
    }));
  }

  const visibleError = dashboardQuery.error || clientsQuery.error || exercisesQuery.error || programsQuery.error || logsQuery.error;

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="RubDev Fitness"
        title={isClient ? `Hola, ${profile?.full_name?.split(" ")[0] || "atleta"}` : "Centro de rendimiento premium"}
        description={isClient ? "Tu espacio privado para revisar rutina activa, cumplimiento y progreso personal." : "Gestiona clientes, rutinas, adherencia, membresias y progreso por empresa con una experiencia deportiva moderna."}
      />

      {visibleError ? <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">{getApiErrorMessage(visibleError, "No fue posible cargar el modulo fitness")}</div> : null}

      <div className="overflow-x-auto rounded-[28px] border border-slate-200 bg-white p-2 shadow-sm">
        <div className="flex min-w-max gap-2">
          {visibleTabs.map((tab) => <button key={tab.key} className={shellClass(activeTab === tab.key)} type="button" onClick={() => setActiveTab(tab.key)}>{tab.label}</button>)}
        </div>
      </div>

      {activeTab === "overview" ? (
        <div className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <StatCard label={isClient ? "Mi progreso semanal" : "Clientes activos"} value={isClient ? `${dashboard?.cards?.completion ?? 0}%` : dashboard?.cards?.activeClients ?? 0} accent="bg-lime-500" formatter={(value) => value} />
            <StatCard label={isClient ? "Mi rutina activa" : "Rutinas activas"} value={dashboard?.cards?.activePrograms ?? 0} accent="bg-slate-950" formatter={integer} />
            <StatCard label="Entrenos 30 dias" value={dashboard?.cards?.workouts30d ?? 0} accent="bg-cyan-500" formatter={integer} />
            <StatCard label="Carga total 30 dias" value={`${dashboard?.cards?.totalLoad30d ?? 0} kg`} accent="bg-fuchsia-500" formatter={(value) => value} />
          </div>

          <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
            <SectionCard title={isClient ? "Rutina del dia" : "Ritmo semanal"} subtitle={isClient ? "Solo ves tu plan activo y tus proximos bloques." : "Adherencia real durante la ultima semana."}>
              {isClient && activeProgram ? (
                <div className="rounded-[28px] bg-[linear-gradient(145deg,#0f172a_0%,#112938_44%,#1f2937_100%)] p-5 text-white">
                  <p className="text-[11px] uppercase tracking-[0.3em] text-lime-300">Plan activo</p>
                  <h3 className="mt-3 text-2xl font-semibold">{activeProgram.name}</h3>
                  <p className="mt-2 text-sm text-slate-300">{activeProgram.objective || "Entrenamiento personalizado asignado por tu coach."}</p>
                  <div className="mt-5 grid gap-3 md:grid-cols-2">
                    {(activeProgram.structure?.[0]?.days ?? []).map((day) => (
                      <div key={day.id} className="rounded-3xl border border-white/10 bg-white/10 p-4">
                        <p className="text-sm font-semibold">{day.name}</p>
                        <p className="mt-1 text-xs uppercase tracking-[0.2em] text-slate-300">Dia {day.day_number}</p>
                        <p className="mt-3 text-sm text-slate-200">{day.exercises.length} ejercicios programados</p>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="h-72">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={dashboard?.weeklyCompliance ?? []}>
                      <defs>
                        <linearGradient id="fitnessPulse" x1="0" x2="0" y1="0" y2="1">
                          <stop offset="5%" stopColor="#84cc16" stopOpacity={0.45} />
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
              )}
            </SectionCard>

            <SectionCard title={isClient ? "Resumen personal" : "Alertas fitness"} subtitle={isClient ? "Cumplimiento, estado del plan y records personales." : "Clientes inactivos y vencimientos proximos."}>
              {isClient ? (
                <div className="grid gap-3">
                  <MetricPill label="Membresia" value={profile?.membership_label || "Sin plan"} tone={profile?.membership_expired ? "rose" : "lime"} />
                  <MetricPill label="Fin del plan" value={profile?.membership_ends_on ? formatDate(profile.membership_ends_on) : "Sin fecha"} tone="cyan" />
                  <MetricPill label="Cumplimiento" value={`${dashboard?.cards?.completion ?? 0}%`} tone="amber" />
                </div>
              ) : (
                <div className="space-y-3">
                  {(dashboard?.expiringMemberships ?? []).map((client) => (
                    <div key={client.id} className="rounded-3xl border border-amber-200 bg-amber-50 px-4 py-3">
                      <p className="font-semibold text-amber-900">{client.full_name}</p>
                      <p className="text-sm text-amber-700">Vence {client.membership_ends_on ? formatDate(client.membership_ends_on) : "sin fecha"}</p>
                    </div>
                  ))}
                  {(dashboard?.inactiveClients ?? []).map((client) => (
                    <div key={client.id} className="rounded-3xl border border-rose-200 bg-rose-50 px-4 py-3">
                      <p className="font-semibold text-rose-900">{client.full_name}</p>
                      <p className="text-sm text-rose-700">{client.membership_expired ? "Membresia vencida" : "Sin actividad reciente"}</p>
                    </div>
                  ))}
                  {(dashboard?.expiringMemberships?.length || 0) + (dashboard?.inactiveClients?.length || 0) === 0 ? <EmptyState label="Todo va al dia. No hay alertas criticas en este momento." /> : null}
                </div>
              )}
            </SectionCard>
          </div>

          <div className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
            <SectionCard title="Records personales" subtitle={isClient ? "Tus mejores cargas registradas." : "PRs consolidados del panel activo."}>
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
            </SectionCard>
            <SectionCard title={isClient ? "Ultimos entrenamientos" : "Entrenamientos recientes"} subtitle="Registro real con fecha, carga y estado.">
              <div className="space-y-3">
                {(dashboard?.recentLogs ?? []).map((log) => (
                  <div key={log.id} className="rounded-[24px] border border-slate-200 p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="font-semibold text-slate-950">{isClient ? log.exercise_name || "Sesion registrada" : log.client_name}</p>
                        <p className="text-sm text-slate-500">{isClient ? formatDate(log.performed_on) : log.exercise_name || "Sesion general"}</p>
                      </div>
                      <span className={`status-badge ${log.status === "completed" ? "status-ok" : log.status === "partial" ? "status-warn" : "status-danger-soft"}`}>{log.status}</span>
                    </div>
                    <p className="mt-3 text-sm text-slate-600">{log.sets_completed} series | {log.reps_completed} reps | {log.weight_used ?? 0} kg | RPE {log.rpe ?? "-"}</p>
                  </div>
                ))}
                {(dashboard?.recentLogs ?? []).length === 0 ? <EmptyState label="Aun no hay entrenamientos registrados." /> : null}
              </div>
            </SectionCard>
          </div>
        </div>
      ) : null}

      {activeTab === "clients" && !isClient ? (
        <div className="space-y-6">
          <SectionCard
            title="Clientes fitness"
            subtitle="Busqueda, membresias, detalle clinico-deportivo e historico."
            action={<button className="btn-primary" type="button" onClick={() => resetClientModal()}>Nuevo cliente</button>}
          >
            <div className="grid gap-3 md:grid-cols-3">
              <input className="input-light" placeholder="Buscar cliente" value={clientFilters.search} onChange={(event) => setClientFilters((current) => ({ ...current, search: event.target.value }))} />
              <select className="input-light" value={clientFilters.membership_type} onChange={(event) => setClientFilters((current) => ({ ...current, membership_type: event.target.value }))}>
                <option value="">Todas las membresias</option>
                {membershipOptions.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
              </select>
              <select className="input-light" value={clientFilters.status} onChange={(event) => setClientFilters((current) => ({ ...current, status: event.target.value }))}>
                <option value="">Todos los estados</option>
                <option value="active">Activo</option>
                <option value="paused">Pausado</option>
                <option value="inactive">Inactivo</option>
              </select>
            </div>
          </SectionCard>
          <div className="grid gap-4 lg:grid-cols-2 2xl:grid-cols-3">
            {clients.map((client) => <ClientSummaryCard key={client.id} client={client} onOpen={(item) => setDetailClientId(item.id)} onEdit={resetClientModal} onDelete={(item) => deleteClientMutation.mutate(item.id)} />)}
            {clients.length === 0 ? <EmptyState label="No hay clientes que coincidan con los filtros." /> : null}
          </div>
        </div>
      ) : null}

      {activeTab === "exercises" && !isClient ? (
        <div className="space-y-6">
          <SectionCard title="Biblioteca de ejercicios" subtitle="Catalogo filtrable por categoria, dificultad y multimedia." action={<button className="btn-primary" type="button" onClick={() => resetExerciseModal()}>Nuevo ejercicio</button>}>
            <div className="grid gap-3 md:grid-cols-3">
              <input className="input-light" placeholder="Buscar ejercicio" value={exerciseFilters.search} onChange={(event) => setExerciseFilters((current) => ({ ...current, search: event.target.value }))} />
              <select className="input-light" value={exerciseFilters.category} onChange={(event) => setExerciseFilters((current) => ({ ...current, category: event.target.value }))}>
                <option value="">Todas las categorias</option>
                {exerciseCategories.map((category) => <option key={category} value={category}>{category}</option>)}
              </select>
              <select className="input-light" value={exerciseFilters.difficulty} onChange={(event) => setExerciseFilters((current) => ({ ...current, difficulty: event.target.value }))}>
                <option value="">Todas las dificultades</option>
                {difficultyOptions.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
              </select>
            </div>
          </SectionCard>
          <div className="grid gap-4 lg:grid-cols-2 2xl:grid-cols-3">
            {exercises.map((exercise) => (
              <article key={exercise.id} className="rounded-[26px] border border-slate-200 bg-white p-4 shadow-sm">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-semibold text-slate-950">{exercise.name}</p>
                    <p className="text-sm text-slate-500">{exercise.category} · {exercise.muscle_group}</p>
                  </div>
                  <span className="status-badge status-ok">{exercise.difficulty}</span>
                </div>
                <p className="mt-3 text-sm text-slate-600">{exercise.instructions || "Sin instrucciones"}</p>
                <div className="mt-4 flex flex-wrap gap-2">
                  <button className="btn-secondary" type="button" onClick={() => resetExerciseModal(exercise)}>Editar</button>
                  <button className="btn-danger" type="button" onClick={() => deleteExerciseMutation.mutate(exercise.id)}>Desactivar</button>
                </div>
              </article>
            ))}
            {exercises.length === 0 ? <EmptyState label="Aun no hay ejercicios registrados." /> : null}
          </div>
        </div>
      ) : null}

      {activeTab === "programs" ? (
        <div className="space-y-6">
          {!isClient ? (
            <SectionCard title="Constructor visual de rutinas" subtitle="Programa por semanas, dias, bloques y superseries." action={<button className="btn-primary" type="button" onClick={() => resetProgramModal()}>Nueva rutina</button>}>
              <p className="text-sm text-slate-500">Cada rutina puede asignarse a un cliente y editarse despues sin perder el control por empresa.</p>
            </SectionCard>
          ) : null}

          <div className="grid gap-4 lg:grid-cols-2">
            {programs.map((program) => (
              <article key={program.id} className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-semibold text-slate-950">{program.name}</p>
                    <p className="text-sm text-slate-500">{program.client_name || "Sin cliente asignado"}</p>
                  </div>
                  <span className="status-badge status-ok">{program.status}</span>
                </div>
                <div className="mt-4 grid grid-cols-3 gap-2">
                  <MetricPill label="Semanas" value={program.weeks_count} tone="lime" />
                  <MetricPill label="Dias" value={program.days_count} tone="cyan" />
                  <MetricPill label="Ejercicios" value={program.exercises_count} tone="amber" />
                </div>
                <p className="mt-4 text-sm text-slate-600">{program.objective || "Sin objetivo definido"}</p>
                <div className="mt-4 flex flex-wrap gap-2">
                  <button className="btn-secondary" type="button" onClick={() => setPreviewProgramId(program.id)}>Vista previa</button>
                  {!isClient ? <button className="btn-secondary" type="button" onClick={() => resetProgramModal(program)}>Editar</button> : null}
                  {!isClient ? <button className="btn-danger" type="button" onClick={() => deleteProgramMutation.mutate(program.id)}>Archivar</button> : null}
                </div>
              </article>
            ))}
            {programs.length === 0 ? <EmptyState label={isClient ? "Todavia no tienes una rutina activa asignada." : "Aun no has creado rutinas."} /> : null}
          </div>
        </div>
      ) : null}

      {activeTab === "logs" ? (
        <div className="space-y-6">
          <SectionCard title={isClient ? "Mi registro de entrenamiento" : "Registro e historial"} subtitle={isClient ? "Marca tus ejercicios, carga, RPE/RIR y progreso fotografico." : "Historial filtrable por fecha, cliente y rendimiento."} action={<button className="btn-primary" type="button" onClick={() => resetLogModal()}>Registrar entrenamiento</button>}>
            <div className="grid gap-3 md:grid-cols-2">
              <input className="input-light" type="date" value={logFilters.date_from} onChange={(event) => setLogFilters((current) => ({ ...current, date_from: event.target.value }))} />
              <input className="input-light" type="date" value={logFilters.date_to} onChange={(event) => setLogFilters((current) => ({ ...current, date_to: event.target.value }))} />
            </div>
          </SectionCard>
          <div className="grid gap-4 lg:grid-cols-2">
            {logs.map((log) => (
              <article key={log.id} className="rounded-[26px] border border-slate-200 bg-white p-4 shadow-sm">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-semibold text-slate-950">{isClient ? log.exercise_name || "Sesion general" : log.client_name}</p>
                    <p className="text-sm text-slate-500">{formatDate(log.performed_on)}</p>
                  </div>
                  <span className={`status-badge ${log.status === "completed" ? "status-ok" : log.status === "partial" ? "status-warn" : "status-danger-soft"}`}>{log.status}</span>
                </div>
                <p className="mt-3 text-sm text-slate-600">{log.sets_completed} series · {log.reps_completed} reps · {log.weight_used ?? 0} kg · RPE {log.rpe ?? "-"} · RIR {log.rir ?? "-"}</p>
                <p className="mt-2 text-sm text-slate-500">{log.observations || "Sin observaciones"}</p>
                <div className="mt-4 flex flex-wrap gap-2">
                  <button className="btn-secondary" type="button" onClick={() => resetLogModal(log)}>Editar</button>
                  <button className="btn-danger" type="button" onClick={() => deleteLogMutation.mutate(log.id)}>Eliminar</button>
                </div>
              </article>
            ))}
            {logs.length === 0 ? <EmptyState label="No hay registros en el rango seleccionado." /> : null}
          </div>
        </div>
      ) : null}

      <Modal open={openClientModal} title={editingClient ? "Editar cliente" : "Nuevo cliente"} onClose={() => setOpenClientModal(false)}>
        <form className="grid gap-3" onSubmit={submitClient}>
          <div className="grid gap-3 md:grid-cols-2">
            <input className="input-light" placeholder="Nombre completo" value={clientForm.full_name} onChange={(event) => setClientForm((current) => ({ ...current, full_name: event.target.value }))} required />
            <input className="input-light" placeholder="Avatar URL" value={clientForm.avatar_url} onChange={(event) => setClientForm((current) => ({ ...current, avatar_url: event.target.value }))} />
            <input className="input-light" placeholder="Correo" value={clientForm.email} onChange={(event) => setClientForm((current) => ({ ...current, email: event.target.value }))} />
            <input className="input-light" placeholder="Telefono" value={clientForm.phone} onChange={(event) => setClientForm((current) => ({ ...current, phone: event.target.value }))} />
            <select className="input-light" value={clientForm.membership_type} onChange={(event) => setClientForm((current) => ({ ...current, membership_type: event.target.value }))}>
              {membershipOptions.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
            </select>
            <input className="input-light" placeholder="Etiqueta personalizada" value={clientForm.custom_membership_label} onChange={(event) => setClientForm((current) => ({ ...current, custom_membership_label: event.target.value }))} />
            <input className="input-light" type="date" value={clientForm.membership_starts_on} onChange={(event) => setClientForm((current) => ({ ...current, membership_starts_on: event.target.value }))} />
            <input className="input-light" type="date" value={clientForm.membership_ends_on} onChange={(event) => setClientForm((current) => ({ ...current, membership_ends_on: event.target.value }))} />
            <input className="input-light" type="date" value={clientForm.birth_date} onChange={(event) => setClientForm((current) => ({ ...current, birth_date: event.target.value }))} />
            <select className="input-light" value={clientForm.gender} onChange={(event) => setClientForm((current) => ({ ...current, gender: event.target.value }))}>
              <option value="">Genero</option>
              {genderOptions.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
            </select>
            <input className="input-light" type="number" placeholder="Peso kg" value={clientForm.weight_kg} onChange={(event) => setClientForm((current) => ({ ...current, weight_kg: event.target.value }))} />
            <input className="input-light" type="number" placeholder="Altura cm" value={clientForm.height_cm} onChange={(event) => setClientForm((current) => ({ ...current, height_cm: event.target.value }))} />
            <input className="input-light" type="number" placeholder="Grasa corporal %" value={clientForm.body_fat_percentage} onChange={(event) => setClientForm((current) => ({ ...current, body_fat_percentage: event.target.value }))} />
            <input className="input-light" type="number" placeholder="Masa muscular kg" value={clientForm.muscle_mass_kg} onChange={(event) => setClientForm((current) => ({ ...current, muscle_mass_kg: event.target.value }))} />
            <input className="input-light" type="number" placeholder="IMC" value={clientForm.bmi} onChange={(event) => setClientForm((current) => ({ ...current, bmi: event.target.value }))} />
            <select className="input-light" value={clientForm.experience_level} onChange={(event) => setClientForm((current) => ({ ...current, experience_level: event.target.value }))}>
              {difficultyOptions.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
            </select>
          </div>
          <textarea className="input-light min-h-24" placeholder="Objetivo principal" value={clientForm.goal} onChange={(event) => setClientForm((current) => ({ ...current, goal: event.target.value }))} />
          <textarea className="input-light min-h-24" placeholder="Objetivos fitness" value={clientForm.fitness_objectives} onChange={(event) => setClientForm((current) => ({ ...current, fitness_objectives: event.target.value }))} />
          <textarea className="input-light min-h-20" placeholder="Observaciones medicas" value={clientForm.medical_notes} onChange={(event) => setClientForm((current) => ({ ...current, medical_notes: event.target.value }))} />
          <textarea className="input-light min-h-20" placeholder="Lesiones o restricciones" value={clientForm.injuries} onChange={(event) => setClientForm((current) => ({ ...current, injuries: event.target.value }))} />
          <textarea className="input-light min-h-20" placeholder="Notas internas" value={clientForm.notes} onChange={(event) => setClientForm((current) => ({ ...current, notes: event.target.value }))} />
          <button className="btn-primary" disabled={clientMutation.isPending} type="submit">{clientMutation.isPending ? "Guardando..." : editingClient ? "Actualizar cliente" : "Crear cliente"}</button>
        </form>
      </Modal>

      <Modal open={Boolean(detailClientId)} title={clientDetailQuery.data?.client?.full_name || "Detalle cliente"} onClose={() => setDetailClientId(null)}>
        {clientDetailQuery.isLoading ? <div className="text-sm text-slate-500">Cargando ficha del cliente...</div> : null}
        {clientDetailQuery.data ? (
          <div className="space-y-5">
            <div className="grid gap-3 md:grid-cols-3">
              <MetricPill label="Membresia" value={clientDetailQuery.data.client.membership_label} tone={clientDetailQuery.data.client.membership_expired ? "rose" : "lime"} />
              <MetricPill label="Cumplidos" value={clientDetailQuery.data.progress.stats.completed_logs} tone="cyan" />
              <MetricPill label="Carga total" value={`${clientDetailQuery.data.progress.stats.total_load} kg`} tone="amber" />
            </div>
            <SectionCard title="Progreso historico">
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={(clientDetailQuery.data.progress.history || []).slice().reverse()}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                    <XAxis dataKey="performed_on" hide />
                    <YAxis />
                    <Tooltip />
                    <Area type="monotone" dataKey="total_weight" stroke="#0f172a" fill="#bef264" fillOpacity={0.28} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </SectionCard>
          </div>
        ) : null}
      </Modal>

      <Modal open={openExerciseModal} title={editingExercise ? "Editar ejercicio" : "Nuevo ejercicio"} onClose={() => setOpenExerciseModal(false)}>
        <form className="grid gap-3" onSubmit={submitExercise}>
          <div className="grid gap-3 md:grid-cols-2">
            <input className="input-light" placeholder="Nombre" value={exerciseForm.name} onChange={(event) => setExerciseForm((current) => ({ ...current, name: event.target.value }))} required />
            <input className="input-light" placeholder="Grupo muscular" value={exerciseForm.muscle_group} onChange={(event) => setExerciseForm((current) => ({ ...current, muscle_group: event.target.value }))} required />
            <select className="input-light" value={exerciseForm.category} onChange={(event) => setExerciseForm((current) => ({ ...current, category: event.target.value }))}>
              {exerciseCategories.map((category) => <option key={category} value={category}>{category}</option>)}
            </select>
            <select className="input-light" value={exerciseForm.difficulty} onChange={(event) => setExerciseForm((current) => ({ ...current, difficulty: event.target.value }))}>
              {difficultyOptions.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
            </select>
            <input className="input-light" placeholder="Equipo" value={exerciseForm.equipment} onChange={(event) => setExerciseForm((current) => ({ ...current, equipment: event.target.value }))} />
            <input className="input-light" placeholder="Video URL" value={exerciseForm.video_url} onChange={(event) => setExerciseForm((current) => ({ ...current, video_url: event.target.value }))} />
            <input className="input-light md:col-span-2" placeholder="Thumbnail URL" value={exerciseForm.thumbnail_url} onChange={(event) => setExerciseForm((current) => ({ ...current, thumbnail_url: event.target.value }))} />
          </div>
          <textarea className="input-light min-h-28" placeholder="Instrucciones" value={exerciseForm.instructions} onChange={(event) => setExerciseForm((current) => ({ ...current, instructions: event.target.value }))} />
          <button className="btn-primary" disabled={exerciseMutation.isPending} type="submit">{exerciseMutation.isPending ? "Guardando..." : editingExercise ? "Actualizar ejercicio" : "Crear ejercicio"}</button>
        </form>
      </Modal>

      <Modal open={openProgramModal} title={editingProgram ? "Editar rutina" : "Nueva rutina"} onClose={() => setOpenProgramModal(false)}>
        <form className="grid gap-4" onSubmit={submitProgram}>
          <div className="grid gap-3 md:grid-cols-2">
            <input className="input-light" placeholder="Nombre del programa" value={programForm.name} onChange={(event) => setProgramForm((current) => ({ ...current, name: event.target.value }))} required />
            <select className="input-light" value={programForm.fitness_client_id} onChange={(event) => setProgramForm((current) => ({ ...current, fitness_client_id: event.target.value }))}>
              <option value="">Sin asignar</option>
              {clients.map((client) => <option key={client.id} value={client.id}>{client.full_name}</option>)}
            </select>
            <input className="input-light" type="date" value={programForm.starts_on} onChange={(event) => setProgramForm((current) => ({ ...current, starts_on: event.target.value }))} />
            <input className="input-light" type="date" value={programForm.ends_on} onChange={(event) => setProgramForm((current) => ({ ...current, ends_on: event.target.value }))} />
          </div>
          <textarea className="input-light min-h-24" placeholder="Objetivo de la rutina" value={programForm.objective} onChange={(event) => setProgramForm((current) => ({ ...current, objective: event.target.value }))} />
          <div className="space-y-4">
            {programForm.weeks.map((week, weekIndex) => (
              <div key={weekIndex} className="rounded-[28px] border border-slate-200 p-4">
                <div className="grid gap-3 md:grid-cols-[120px_1fr]">
                  <input className="input-light" type="number" min="1" value={week.week_number} onChange={(event) => updateWeek({ ...week, week_number: Number(event.target.value) }, weekIndex)} />
                  <input className="input-light" value={week.focus} onChange={(event) => updateWeek({ ...week, focus: event.target.value }, weekIndex)} placeholder="Enfoque de la semana" />
                </div>
                <textarea className="input-light mt-3 min-h-20" value={week.notes} onChange={(event) => updateWeek({ ...week, notes: event.target.value }, weekIndex)} placeholder="Notas semanales" />
                <div className="mt-4 space-y-4">
                  {week.days.map((day, dayIndex) => (
                    <ProgramDayBuilder
                      key={dayIndex}
                      day={day}
                      exercises={exercises}
                      onChange={(nextDay) =>
  updateWeek(
    {
      ...week,
      days: week.days.map((entry, index) =>
        index === dayIndex
          ? {
              ...nextDay,
              name:
                nextDay.name?.trim() ||
                `Dia ${nextDay.day_number || index + 1}`
            }
          : entry
      )
    },
    weekIndex
  )
}
                      onAddExercise={() => updateWeek({ ...week, days: week.days.map((entry, index) => index === dayIndex ? { ...entry, exercises: [...entry.exercises, { exercise_id: "", exercise_order: entry.exercises.length + 1, block_name: "", block_type: "straight", superset_group: "", planned_sets: 3, planned_reps: "8-12", planned_weight: "", target_rir: "", target_rpe: "", rest_seconds: "", notes: "" }] } : entry) }, weekIndex)}
                      onRemoveExercise={(exerciseIndex) => updateWeek({ ...week, days: week.days.map((entry, index) => index === dayIndex ? { ...entry, exercises: entry.exercises.filter((_, itemIndex) => itemIndex !== exerciseIndex) } : entry) }, weekIndex)}
                    />
                  ))}
                </div>
                <div className="mt-4 flex gap-2">
                  <button className="btn-secondary" type="button" onClick={() => updateWeek({ ...week, days: [...week.days, { day_number: week.days.length + 1, name: `Dia ${week.days.length + 1}`, notes: "", exercises: [] }] }, weekIndex)}>Agregar dia</button>
                </div>
              </div>
            ))}
          </div>
          <div className="flex gap-2">
            <button className="btn-secondary" type="button" onClick={() => setProgramForm((current) => ({ ...current, weeks: [...current.weeks, { week_number: current.weeks.length + 1, focus: "", notes: "", days: [{ day_number: 1, name: "Dia 1", notes: "", exercises: [] }] }] }))}>Agregar semana</button>
            <button className="btn-primary" disabled={programMutation.isPending} type="submit">{programMutation.isPending ? "Guardando..." : editingProgram ? "Actualizar rutina" : "Crear rutina"}</button>
          </div>
        </form>
      </Modal>

      <Modal open={Boolean(previewProgramId)} title={programPreviewQuery.data?.name || "Vista previa de rutina"} onClose={() => setPreviewProgramId(null)}>
        {programPreviewQuery.isLoading ? <div className="text-sm text-slate-500">Cargando estructura...</div> : null}
        {programPreviewQuery.data ? (
          <div className="space-y-4">
            {(programPreviewQuery.data.structure || []).map((week) => (
              <div key={week.id} className="rounded-[26px] border border-slate-200 p-4">
                <p className="text-sm uppercase tracking-[0.22em] text-slate-500">Semana {week.week_number}</p>
                <h4 className="mt-2 text-lg font-semibold text-slate-950">{week.focus || "Sin foco definido"}</h4>
                <div className="mt-4 space-y-3">
                  {week.days.map((day) => (
                    <div key={day.id} className="rounded-3xl bg-slate-50 p-4">
                      <p className="font-semibold text-slate-950">{day.name}</p>
                      <div className="mt-3 space-y-2">
                        {(day.exercises || day.workout_day_exercises || []).map((exercise) => (
                          <div key={exercise.id} className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-600">
                            {exercise.exercise?.name} · {exercise.planned_sets} x {exercise.planned_reps} · descanso {exercise.rest_seconds ?? 0}s
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : null}
      </Modal>

      <Modal open={openLogModal} title={editingLog ? "Editar registro" : "Registrar entrenamiento"} onClose={() => setOpenLogModal(false)}>
        <form className="grid gap-3" onSubmit={submitLog}>
          {!isClient ? (
            <select className="input-light" value={logForm.fitness_client_id} onChange={(event) => setLogForm((current) => ({ ...current, fitness_client_id: event.target.value }))} required>
              <option value="">Cliente</option>
              {clients.map((client) => <option key={client.id} value={client.id}>{client.full_name}</option>)}
            </select>
          ) : null}
          <div className="grid gap-3 md:grid-cols-2">
            <select className="input-light" value={logForm.program_id} onChange={(event) => setLogForm((current) => ({ ...current, program_id: event.target.value }))}>
              <option value="">Rutina opcional</option>
              {programs.map((program) => <option key={program.id} value={program.id}>{program.name}</option>)}
            </select>
            <select className="input-light" value={logForm.exercise_id} onChange={(event) => setLogForm((current) => ({ ...current, exercise_id: event.target.value }))}>
              <option value="">Ejercicio</option>
              {exercises.map((exercise) => <option key={exercise.id} value={exercise.id}>{exercise.name}</option>)}
            </select>
            <input className="input-light" type="date" value={logForm.performed_on} onChange={(event) => setLogForm((current) => ({ ...current, performed_on: event.target.value }))} />
            <select className="input-light" value={logForm.status} onChange={(event) => setLogForm((current) => ({ ...current, status: event.target.value }))}>
              <option value="completed">Completado</option>
              <option value="partial">Parcial</option>
              <option value="skipped">Omitido</option>
            </select>
            <input className="input-light" type="number" placeholder="Series" value={logForm.sets_completed} onChange={(event) => setLogForm((current) => ({ ...current, sets_completed: event.target.value }))} />
            <input className="input-light" type="number" placeholder="Reps" value={logForm.reps_completed} onChange={(event) => setLogForm((current) => ({ ...current, reps_completed: event.target.value }))} />
            <input className="input-light" type="number" placeholder="Peso kg" value={logForm.weight_used} onChange={(event) => setLogForm((current) => ({ ...current, weight_used: event.target.value }))} />
            <input className="input-light" type="number" placeholder="RIR" value={logForm.rir} onChange={(event) => setLogForm((current) => ({ ...current, rir: event.target.value }))} />
            <input className="input-light" type="number" placeholder="RPE" value={logForm.rpe} onChange={(event) => setLogForm((current) => ({ ...current, rpe: event.target.value }))} />
            <input className="input-light" placeholder="Foto progreso URL" value={logForm.progress_photo_url} onChange={(event) => setLogForm((current) => ({ ...current, progress_photo_url: event.target.value }))} />
          </div>
          <textarea className="input-light min-h-24" placeholder="Observaciones" value={logForm.observations} onChange={(event) => setLogForm((current) => ({ ...current, observations: event.target.value }))} />
          <button className="btn-primary" disabled={logMutation.isPending} type="submit">{logMutation.isPending ? "Guardando..." : editingLog ? "Actualizar registro" : "Registrar entrenamiento"}</button>
        </form>
      </Modal>
    </div>
  );
}

export default FitnessDashboardPage;
