const EXERCISE_NAME_LABELS = {
  "push up": "Flexiones",
  "incline push up": "Flexiones inclinadas",
  "dumbbell bench press": "Press de pecho con mancuernas",
  "barbell bench press": "Press de banca con barra",
  "machine chest press": "Press de pecho en maquina",
  "chest fly": "Aperturas de pecho",
  "dumbbell row": "Remo con mancuerna",
  "lat pulldown": "Jalon al pecho",
  "seated cable row": "Remo sentado en polea",
  "band row": "Remo con banda",
  "pull up": "Dominadas",
  "romanian deadlift": "Peso muerto rumano",
  "squat": "Sentadilla",
  "goblet squat": "Sentadilla goblet",
  "barbell back squat": "Sentadilla trasera con barra",
  "leg press": "Prensa de piernas",
  "walking lunge": "Zancadas caminando",
  "bulgarian split squat": "Sentadilla bulgara",
  "step up": "Subida al cajon",
  "leg extension": "Extension de cuadriceps",
  "dumbbell shoulder press": "Press de hombros con mancuernas",
  "arnold press": "Press Arnold",
  "lateral raise": "Elevaciones laterales",
  "front raise": "Elevaciones frontales",
  "face pull": "Face pull",
  "pike push up": "Flexiones tipo pica",
  "biceps curl": "Curl de biceps",
  "hammer curl": "Curl martillo",
  "triceps pushdown": "Extension de triceps en polea",
  "overhead triceps extension": "Extension de triceps sobre la cabeza",
  "bench dips": "Fondos en banco",
  "band curl": "Curl con banda",
  plank: "Plancha",
  "dead bug": "Dead bug",
  "side plank": "Plancha lateral",
  "russian twist": "Giro ruso",
  "mountain climbers": "Escaladores",
  "hanging knee raise": "Elevacion de rodillas colgado",
  "jumping jacks": "Saltos de tijera",
  "high knees": "Rodillas altas",
  burpees: "Burpees",
  "skater hops": "Saltos de patinador",
  "box step march": "Marcha sobre cajon",
  "battle rope waves": "Ondas con cuerda",
  "hip thrust": "Hip thrust",
  "glute bridge": "Puente de gluteos",
  "cable kickback": "Patada de gluteo en polea",
  "band walk": "Caminata con banda",
  "cat cow": "Gato-vaca",
  "worlds greatest stretch": "Estiramiento del mundo",
  "thoracic rotation": "Rotacion toracica",
  "banded shoulder dislocates": "Dislocaciones de hombro con banda",
  "hamstring sweep": "Barrido de isquiotibiales",
  "90 90 hip switch": "Cambio de cadera 90/90"
};

const ROUTINE_NAME_LABELS = {
  "beginner full body demo": "Cuerpo completo principiante demo",
  "hypertrophy upper lower demo": "Hipertrofia tren superior e inferior demo",
  "weight loss starter demo": "Inicio para perdida de peso demo",
  "home workout demo": "Entrenamiento en casa demo",
  "mobility recovery demo": "Movilidad y recuperacion demo",
  "strength fundamentals demo": "Fundamentos de fuerza demo",
  "women lower body demo": "Tren inferior femenino demo",
  "functional conditioning demo": "Acondicionamiento funcional demo"
};

const CATEGORY_LABELS = {
  strength: "Fuerza",
  hypertrophy: "Hipertrofia",
  mobility: "Movilidad",
  core: "Core",
  cardio: "Cardio"
};

const MUSCLE_GROUP_LABELS = {
  chest: "Pecho",
  back: "Espalda",
  legs: "Piernas",
  shoulders: "Hombros",
  arms: "Brazos",
  core: "Core",
  cardio: "Cardio",
  glutes: "Gluteos",
  mobility: "Movilidad"
};

const EQUIPMENT_LABELS = {
  bodyweight: "Peso corporal",
  dumbbell: "Mancuernas",
  barbell: "Barra",
  machine: "Maquina",
  bands: "Bandas"
};

const DIFFICULTY_LABELS = {
  beginner: "Principiante",
  intermediate: "Intermedio",
  advanced: "Avanzado"
};

const GOAL_LABELS = {
  strength: "Fuerza",
  hypertrophy: "Hipertrofia",
  weight_loss: "Perdida de peso",
  mobility: "Movilidad",
  conditioning: "Acondicionamiento"
};

const LEVEL_LABELS = {
  beginner: "Principiante",
  intermediate: "Intermedio",
  advanced: "Avanzado"
};

const STATUS_LABELS = {
  active: "Activo",
  inactive: "Inactivo",
  paused: "Pausado",
  waiting: "En espera"
};

const SPECIALIZATION_LABELS = {
  "functional training": "Entrenamiento funcional",
  "strength and conditioning": "Fuerza y acondicionamiento"
};

const CLIENT_GOAL_LABELS = {
  "build consistency and improve full-body strength.": "Crear constancia y mejorar la fuerza de todo el cuerpo.",
  "reduce body fat and improve conditioning.": "Reducir grasa corporal y mejorar el acondicionamiento.",
  "acompanamiento general": "Acompanamiento general"
};

function normalizeLookupValue(value) {
  return String(value || "")
    .trim()
    .toLowerCase();
}

export function toTitleLabel(value, fallback = "No definido") {
  if (typeof value !== "string" || value.trim() === "") {
    return fallback;
  }

  return value
    .split("_")
    .join(" ")
    .replace(/\b\w/g, (character) => character.toUpperCase());
}

function localizeFromMap(map, value, fallback = "No definido") {
  if (typeof value !== "string" || value.trim() === "") {
    return fallback;
  }

  return map[normalizeLookupValue(value)] || toTitleLabel(value, fallback);
}

export function localizeExerciseName(value, fallback = "Ejercicio") {
  return localizeFromMap(EXERCISE_NAME_LABELS, value, fallback);
}

export function localizeRoutineName(value, fallback = "Rutina") {
  return localizeFromMap(ROUTINE_NAME_LABELS, value, fallback);
}

export function localizeFitnessCategory(value, fallback = "No definido") {
  return localizeFromMap(CATEGORY_LABELS, value, fallback);
}

export function localizeFitnessMuscleGroup(value, fallback = "No definido") {
  return localizeFromMap(MUSCLE_GROUP_LABELS, value, fallback);
}

export function localizeFitnessEquipment(value, fallback = "No definido") {
  return localizeFromMap(EQUIPMENT_LABELS, value, fallback);
}

export function localizeFitnessDifficulty(value, fallback = "No definido") {
  return localizeFromMap(DIFFICULTY_LABELS, value, fallback);
}

export function localizeFitnessGoal(value, fallback = "No definido") {
  return localizeFromMap(GOAL_LABELS, value, fallback);
}

export function localizeFitnessLevel(value, fallback = "No definido") {
  return localizeFromMap(LEVEL_LABELS, value, fallback);
}

export function localizeFitnessStatus(value, fallback = "Sin estado") {
  return localizeFromMap(STATUS_LABELS, value, fallback);
}

export function localizeTrainerSpecialization(value, fallback = "Especializacion general") {
  return localizeFromMap(SPECIALIZATION_LABELS, value, fallback);
}

export function localizeClientGoal(value, fallback = "Acompanamiento general") {
  return localizeFromMap(CLIENT_GOAL_LABELS, value, fallback);
}

export function localizeRoutineMetricsSearchText(item) {
  return [
    localizeRoutineName(item?.name, ""),
    localizeFitnessGoal(item?.goal, ""),
    localizeFitnessLevel(item?.level, "")
  ]
    .filter(Boolean)
    .join(" ");
}

export function localizeExerciseSearchText(item) {
  return [
    localizeExerciseName(item?.name, ""),
    localizeFitnessCategory(item?.category, ""),
    localizeFitnessMuscleGroup(item?.muscle_group, ""),
    localizeFitnessEquipment(item?.equipment, ""),
    localizeFitnessDifficulty(item?.difficulty, "")
  ]
    .filter(Boolean)
    .join(" ");
}
