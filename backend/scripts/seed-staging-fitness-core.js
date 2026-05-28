import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { Client } from "pg";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const BACKEND_ROOT = path.resolve(__dirname, "..");

const DEMO_COMPANY_SLUG = "rubdev-demo-company";
const DEMO_USER_EMAIL = "demo@rubdev.test";

const DEMO_TRAINERS = [
  {
    name: "Laura Fitness Demo",
    email: "laura.fitness.demo@rubdev.test",
    phone: "+57 310 000 1001",
    specialization: "Functional Training",
    status: "active"
  },
  {
    name: "Carlos Strength Demo",
    email: "carlos.strength.demo@rubdev.test",
    phone: "+57 310 000 1002",
    specialization: "Strength and Conditioning",
    status: "active"
  }
];

const DEMO_CLIENTS = [
  {
    name: "Ana Client Demo",
    email: "ana.client.demo@rubdev.test",
    phone: "+57 320 000 2001",
    goal: "Build consistency and improve full-body strength.",
    status: "active",
    assignedTrainerEmail: "laura.fitness.demo@rubdev.test"
  },
  {
    name: "Mateo Client Demo",
    email: "mateo.client.demo@rubdev.test",
    phone: "+57 320 000 2002",
    goal: "Reduce body fat and improve conditioning.",
    status: "active",
    assignedTrainerEmail: "carlos.strength.demo@rubdev.test"
  }
];

function buildExercise({
  name,
  description,
  category,
  muscle_group,
  equipment,
  difficulty
}) {
  const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

  return {
    name,
    description,
    category,
    muscle_group,
    equipment,
    difficulty,
    video_url: `https://example.com/demo/fitness/${slug}`,
    image_url: `https://example.com/demo/fitness/${slug}.jpg`,
    is_active: true
  };
}

const DEMO_EXERCISES = [
  buildExercise({ name: "Push Up", description: "Bodyweight pressing exercise for chest and triceps.", category: "strength", muscle_group: "chest", equipment: "bodyweight", difficulty: "beginner" }),
  buildExercise({ name: "Incline Push Up", description: "Regression pressing variation with elevated hands.", category: "strength", muscle_group: "chest", equipment: "bodyweight", difficulty: "beginner" }),
  buildExercise({ name: "Dumbbell Bench Press", description: "Horizontal press for chest hypertrophy and control.", category: "strength", muscle_group: "chest", equipment: "dumbbell", difficulty: "intermediate" }),
  buildExercise({ name: "Barbell Bench Press", description: "Classic barbell chest strength movement.", category: "strength", muscle_group: "chest", equipment: "barbell", difficulty: "advanced" }),
  buildExercise({ name: "Machine Chest Press", description: "Stable machine-based pressing pattern.", category: "strength", muscle_group: "chest", equipment: "machine", difficulty: "beginner" }),
  buildExercise({ name: "Chest Fly", description: "Isolation movement focused on chest squeeze.", category: "hypertrophy", muscle_group: "chest", equipment: "dumbbell", difficulty: "intermediate" }),

  buildExercise({ name: "Dumbbell Row", description: "Unilateral rowing movement for upper-back strength.", category: "strength", muscle_group: "back", equipment: "dumbbell", difficulty: "intermediate" }),
  buildExercise({ name: "Lat Pulldown", description: "Vertical pulling movement for lats and upper back.", category: "strength", muscle_group: "back", equipment: "machine", difficulty: "beginner" }),
  buildExercise({ name: "Seated Cable Row", description: "Horizontal pulling exercise for scapular control.", category: "strength", muscle_group: "back", equipment: "machine", difficulty: "beginner" }),
  buildExercise({ name: "Band Row", description: "Portable row variation using elastic resistance.", category: "strength", muscle_group: "back", equipment: "bands", difficulty: "beginner" }),
  buildExercise({ name: "Pull Up", description: "Advanced bodyweight pull for upper body strength.", category: "strength", muscle_group: "back", equipment: "bodyweight", difficulty: "advanced" }),
  buildExercise({ name: "Romanian Deadlift", description: "Hip hinge movement for posterior chain and back tension.", category: "strength", muscle_group: "back", equipment: "barbell", difficulty: "intermediate" }),

  buildExercise({ name: "Squat", description: "Basic lower-body squat pattern for strength and control.", category: "strength", muscle_group: "legs", equipment: "bodyweight", difficulty: "beginner" }),
  buildExercise({ name: "Goblet Squat", description: "Loaded squat with front-held dumbbell.", category: "strength", muscle_group: "legs", equipment: "dumbbell", difficulty: "beginner" }),
  buildExercise({ name: "Barbell Back Squat", description: "Foundational barbell squat for strength.", category: "strength", muscle_group: "legs", equipment: "barbell", difficulty: "advanced" }),
  buildExercise({ name: "Leg Press", description: "Machine-based lower body strength pattern.", category: "strength", muscle_group: "legs", equipment: "machine", difficulty: "beginner" }),
  buildExercise({ name: "Walking Lunge", description: "Dynamic unilateral leg exercise for balance and control.", category: "strength", muscle_group: "legs", equipment: "bodyweight", difficulty: "intermediate" }),
  buildExercise({ name: "Bulgarian Split Squat", description: "Unilateral lower-body challenge for strength and stability.", category: "strength", muscle_group: "legs", equipment: "dumbbell", difficulty: "advanced" }),
  buildExercise({ name: "Step Up", description: "Single-leg pattern to build lower-body control.", category: "strength", muscle_group: "legs", equipment: "dumbbell", difficulty: "beginner" }),
  buildExercise({ name: "Leg Extension", description: "Quad-focused isolation movement.", category: "hypertrophy", muscle_group: "legs", equipment: "machine", difficulty: "beginner" }),

  buildExercise({ name: "Dumbbell Shoulder Press", description: "Overhead pressing movement for shoulders.", category: "strength", muscle_group: "shoulders", equipment: "dumbbell", difficulty: "intermediate" }),
  buildExercise({ name: "Arnold Press", description: "Rotational dumbbell shoulder press variation.", category: "hypertrophy", muscle_group: "shoulders", equipment: "dumbbell", difficulty: "intermediate" }),
  buildExercise({ name: "Lateral Raise", description: "Isolation exercise for side delts.", category: "hypertrophy", muscle_group: "shoulders", equipment: "dumbbell", difficulty: "beginner" }),
  buildExercise({ name: "Front Raise", description: "Anterior delt isolation exercise.", category: "hypertrophy", muscle_group: "shoulders", equipment: "dumbbell", difficulty: "beginner" }),
  buildExercise({ name: "Face Pull", description: "Upper back and rear delt stability movement.", category: "mobility", muscle_group: "shoulders", equipment: "bands", difficulty: "beginner" }),
  buildExercise({ name: "Pike Push Up", description: "Bodyweight overhead pushing progression.", category: "strength", muscle_group: "shoulders", equipment: "bodyweight", difficulty: "advanced" }),

  buildExercise({ name: "Biceps Curl", description: "Classic elbow flexion movement for biceps.", category: "hypertrophy", muscle_group: "arms", equipment: "dumbbell", difficulty: "beginner" }),
  buildExercise({ name: "Hammer Curl", description: "Neutral-grip curl for brachialis and forearms.", category: "hypertrophy", muscle_group: "arms", equipment: "dumbbell", difficulty: "beginner" }),
  buildExercise({ name: "Triceps Pushdown", description: "Cable-style extension pattern for triceps.", category: "hypertrophy", muscle_group: "arms", equipment: "machine", difficulty: "beginner" }),
  buildExercise({ name: "Overhead Triceps Extension", description: "Long-head triceps focused extension.", category: "hypertrophy", muscle_group: "arms", equipment: "dumbbell", difficulty: "intermediate" }),
  buildExercise({ name: "Bench Dips", description: "Bodyweight triceps emphasis using bench support.", category: "strength", muscle_group: "arms", equipment: "bodyweight", difficulty: "intermediate" }),
  buildExercise({ name: "Band Curl", description: "Portable biceps curl using bands.", category: "hypertrophy", muscle_group: "arms", equipment: "bands", difficulty: "beginner" }),

  buildExercise({ name: "Plank", description: "Core stability hold that reinforces trunk control.", category: "core", muscle_group: "core", equipment: "bodyweight", difficulty: "beginner" }),
  buildExercise({ name: "Dead Bug", description: "Bracing and coordination drill for trunk control.", category: "core", muscle_group: "core", equipment: "bodyweight", difficulty: "beginner" }),
  buildExercise({ name: "Side Plank", description: "Anti-lateral flexion core stability hold.", category: "core", muscle_group: "core", equipment: "bodyweight", difficulty: "intermediate" }),
  buildExercise({ name: "Russian Twist", description: "Rotational core exercise for obliques.", category: "core", muscle_group: "core", equipment: "bodyweight", difficulty: "intermediate" }),
  buildExercise({ name: "Mountain Climbers", description: "Dynamic core and conditioning drill.", category: "core", muscle_group: "core", equipment: "bodyweight", difficulty: "intermediate" }),
  buildExercise({ name: "Hanging Knee Raise", description: "Advanced anterior core exercise.", category: "core", muscle_group: "core", equipment: "bodyweight", difficulty: "advanced" }),

  buildExercise({ name: "Jumping Jacks", description: "Low-complexity cardio movement for warm-up and conditioning.", category: "cardio", muscle_group: "cardio", equipment: "bodyweight", difficulty: "beginner" }),
  buildExercise({ name: "High Knees", description: "Fast cardio drill to raise heart rate quickly.", category: "cardio", muscle_group: "cardio", equipment: "bodyweight", difficulty: "beginner" }),
  buildExercise({ name: "Burpees", description: "Full-body conditioning drill with floor transition.", category: "cardio", muscle_group: "cardio", equipment: "bodyweight", difficulty: "advanced" }),
  buildExercise({ name: "Skater Hops", description: "Lateral power and conditioning drill.", category: "cardio", muscle_group: "cardio", equipment: "bodyweight", difficulty: "intermediate" }),
  buildExercise({ name: "Box Step March", description: "Low-impact cardiovascular movement using a platform.", category: "cardio", muscle_group: "cardio", equipment: "bodyweight", difficulty: "beginner" }),
  buildExercise({ name: "Battle Rope Waves", description: "Upper-body conditioning with repeated rope waves.", category: "cardio", muscle_group: "cardio", equipment: "machine", difficulty: "intermediate" }),

  buildExercise({ name: "Hip Thrust", description: "Glute-focused hinge movement for posterior chain strength.", category: "strength", muscle_group: "glutes", equipment: "barbell", difficulty: "intermediate" }),
  buildExercise({ name: "Glute Bridge", description: "Foundational glute activation movement.", category: "strength", muscle_group: "glutes", equipment: "bodyweight", difficulty: "beginner" }),
  buildExercise({ name: "Cable Kickback", description: "Isolation movement for glute contraction.", category: "hypertrophy", muscle_group: "glutes", equipment: "machine", difficulty: "beginner" }),
  buildExercise({ name: "Band Walk", description: "Lateral glute activation drill with mini-band.", category: "mobility", muscle_group: "glutes", equipment: "bands", difficulty: "beginner" }),

  buildExercise({ name: "Cat Cow", description: "Spinal mobility drill for warm-up and recovery.", category: "mobility", muscle_group: "mobility", equipment: "bodyweight", difficulty: "beginner" }),
  buildExercise({ name: "Worlds Greatest Stretch", description: "Multi-segment dynamic mobility pattern.", category: "mobility", muscle_group: "mobility", equipment: "bodyweight", difficulty: "intermediate" }),
  buildExercise({ name: "Thoracic Rotation", description: "Upper-spine mobility drill for rotation.", category: "mobility", muscle_group: "mobility", equipment: "bodyweight", difficulty: "beginner" }),
  buildExercise({ name: "Banded Shoulder Dislocates", description: "Shoulder range of motion drill with light band.", category: "mobility", muscle_group: "mobility", equipment: "bands", difficulty: "beginner" }),
  buildExercise({ name: "Hamstring Sweep", description: "Dynamic hamstring mobility exercise.", category: "mobility", muscle_group: "mobility", equipment: "bodyweight", difficulty: "beginner" }),
  buildExercise({ name: "90 90 Hip Switch", description: "Hip rotation drill for mobility and control.", category: "mobility", muscle_group: "mobility", equipment: "bodyweight", difficulty: "intermediate" })
];

function buildTemplateWeek(week_number, name, description, days) {
  return { week_number, name, description, days };
}

function buildTemplateDay(day_number, name, description, exercises) {
  return { day_number, name, description, exercises };
}

function buildTemplateExercise(exerciseName, sort_order, sets, reps, rest_seconds, notes) {
  return { exerciseName, sort_order, sets, reps, rest_seconds, notes };
}

function buildRoutineTemplate({ name, description, level, goal, duration_weeks, weeks }) {
  return {
    name,
    description,
    level,
    goal,
    duration_weeks,
    is_active: true,
    weeks
  };
}

const DEMO_ROUTINE_TEMPLATES = [
  buildRoutineTemplate({
    name: "Beginner Full Body Demo",
    description: "Plantilla introductoria full body para construir tecnica, ritmo y adherencia.",
    level: "beginner",
    goal: "strength",
    duration_weeks: 4,
    weeks: [
      buildTemplateWeek(1, "Base Week 1", "Fundamentos de movimiento y control.", [
        buildTemplateDay(1, "Full Body A", "Patrones base de empuje y sentadilla.", [
          buildTemplateExercise("Goblet Squat", 1, 3, "10", 60, "Priorizar tecnica."),
          buildTemplateExercise("Incline Push Up", 2, 3, "10", 60, "Escala amigable para inicio."),
          buildTemplateExercise("Band Row", 3, 3, "12", 45, "Enfatizar escapulas."),
          buildTemplateExercise("Plank", 4, 3, "30s", 30, "Respiracion estable.")
        ]),
        buildTemplateDay(3, "Full Body B", "Patrones de bisagra, tiron y cardio.", [
          buildTemplateExercise("Glute Bridge", 1, 3, "12", 45, "Pausa arriba."),
          buildTemplateExercise("Lat Pulldown", 2, 3, "10", 60, "Recorrido completo."),
          buildTemplateExercise("Step Up", 3, 3, "10/side", 45, "Control unilateral."),
          buildTemplateExercise("Jumping Jacks", 4, 3, "30s", 20, "Ritmo comodo.")
        ])
      ]),
      buildTemplateWeek(2, "Base Week 2", "Ligera progresion de volumen.", [
        buildTemplateDay(1, "Full Body A+", "Mismo esquema con algo mas de trabajo.", [
          buildTemplateExercise("Goblet Squat", 1, 4, "10", 60, "Mantener profundidad controlada."),
          buildTemplateExercise("Push Up", 2, 3, "8-10", 60, "Version completa si es posible."),
          buildTemplateExercise("Seated Cable Row", 3, 3, "12", 45, "Tirar al ombligo."),
          buildTemplateExercise("Dead Bug", 4, 3, "10/side", 30, "Core estable.")
        ]),
        buildTemplateDay(3, "Full Body B+", "Gluteos, espalda y acondicionamiento.", [
          buildTemplateExercise("Hip Thrust", 1, 3, "10", 75, "Pausa en extension."),
          buildTemplateExercise("Dumbbell Row", 2, 3, "10/side", 60, "Controlar torsion."),
          buildTemplateExercise("Walking Lunge", 3, 3, "10/side", 45, "Pasos cortos y firmes."),
          buildTemplateExercise("High Knees", 4, 3, "25s", 20, "Respirar por nariz si es posible.")
        ])
      ])
    ]
  }),
  buildRoutineTemplate({
    name: "Hypertrophy Upper Lower Demo",
    description: "Division upper lower enfocada en hipertrofia general.",
    level: "intermediate",
    goal: "hypertrophy",
    duration_weeks: 6,
    weeks: [
      buildTemplateWeek(1, "Volume Week 1", "Acumulacion moderada de volumen.", [
        buildTemplateDay(1, "Upper A", "Pecho, espalda y hombros.", [
          buildTemplateExercise("Dumbbell Bench Press", 1, 4, "8-10", 75, "Control excéntrico."),
          buildTemplateExercise("Seated Cable Row", 2, 4, "10-12", 60, "Contraccion fuerte."),
          buildTemplateExercise("Lateral Raise", 3, 3, "12-15", 45, "Recorrido limpio."),
          buildTemplateExercise("Biceps Curl", 4, 3, "12", 45, "Sin balanceo.")
        ]),
        buildTemplateDay(3, "Lower A", "Cuadriciceps y gluteos.", [
          buildTemplateExercise("Leg Press", 1, 4, "10", 75, "Empuje continuo."),
          buildTemplateExercise("Romanian Deadlift", 2, 4, "8-10", 75, "Bisagra controlada."),
          buildTemplateExercise("Hip Thrust", 3, 3, "10-12", 60, "Pausa arriba."),
          buildTemplateExercise("Leg Extension", 4, 3, "12-15", 45, "Contraccion final.")
        ])
      ]),
      buildTemplateWeek(2, "Volume Week 2", "Pequena progresion de repeticiones.", [
        buildTemplateDay(1, "Upper B", "Tiron y empuje complementario.", [
          buildTemplateExercise("Machine Chest Press", 1, 4, "10-12", 60, "Recorrido estable."),
          buildTemplateExercise("Lat Pulldown", 2, 4, "10-12", 60, "Pecho alto."),
          buildTemplateExercise("Arnold Press", 3, 3, "10", 60, "Movimiento fluido."),
          buildTemplateExercise("Triceps Pushdown", 4, 3, "12-15", 45, "Extension completa.")
        ]),
        buildTemplateDay(4, "Lower B", "Unilateral y posterior chain.", [
          buildTemplateExercise("Bulgarian Split Squat", 1, 3, "10/side", 75, "Profundidad estable."),
          buildTemplateExercise("Walking Lunge", 2, 3, "12/side", 60, "Paso controlado."),
          buildTemplateExercise("Cable Kickback", 3, 3, "15", 45, "Gluteo activo."),
          buildTemplateExercise("Side Plank", 4, 3, "30s/side", 30, "Cadera arriba.")
        ])
      ])
    ]
  }),
  buildRoutineTemplate({
    name: "Weight Loss Starter Demo",
    description: "Plantilla inicial para bajar grasa con cardio y fuerza basica.",
    level: "beginner",
    goal: "weight_loss",
    duration_weeks: 4,
    weeks: [
      buildTemplateWeek(1, "Starter Week 1", "Habito y tolerancia basica al esfuerzo.", [
        buildTemplateDay(2, "Conditioning Circuit", "Circuito basico.", [
          buildTemplateExercise("Jumping Jacks", 1, 4, "40s", 20, "Ritmo constante."),
          buildTemplateExercise("Goblet Squat", 2, 3, "12", 45, "Profundidad segura."),
          buildTemplateExercise("Push Up", 3, 3, "8", 45, "Escalar si hace falta."),
          buildTemplateExercise("Mountain Climbers", 4, 3, "25s", 20, "Core firme.")
        ]),
        buildTemplateDay(4, "Lower Body Burn", "Trabajo simple de piernas y gluteos.", [
          buildTemplateExercise("Step Up", 1, 3, "12/side", 45, "Subida controlada."),
          buildTemplateExercise("Glute Bridge", 2, 3, "15", 30, "Sin dolor lumbar."),
          buildTemplateExercise("High Knees", 3, 4, "20s", 20, "Cadencia media."),
          buildTemplateExercise("Plank", 4, 3, "25s", 25, "No perder alineacion.")
        ])
      ]),
      buildTemplateWeek(2, "Starter Week 2", "Mas densidad y continuidad.", [
        buildTemplateDay(2, "Conditioning Plus", "Mayor trabajo por bloque.", [
          buildTemplateExercise("Skater Hops", 1, 4, "20/side", 20, "Aterrizajes suaves."),
          buildTemplateExercise("Dumbbell Row", 2, 3, "12/side", 45, "Espalda firme."),
          buildTemplateExercise("Squat", 3, 4, "15", 30, "Ritmo sostenido."),
          buildTemplateExercise("Russian Twist", 4, 3, "20", 25, "Controlar torso.")
        ]),
        buildTemplateDay(4, "Conditioning Blend", "Fuerza basica y cardio.", [
          buildTemplateExercise("Hip Thrust", 1, 4, "12", 45, "Pausa corta arriba."),
          buildTemplateExercise("Band Row", 2, 3, "15", 30, "Escapulas activas."),
          buildTemplateExercise("Jumping Jacks", 3, 4, "45s", 20, "Respiracion continua."),
          buildTemplateExercise("Dead Bug", 4, 3, "12/side", 25, "Core estable.")
        ])
      ])
    ]
  }),
  buildRoutineTemplate({
    name: "Home Workout Demo",
    description: "Rutina casera con peso corporal, bandas y mancuernas ligeras.",
    level: "beginner",
    goal: "general_fitness",
    duration_weeks: 4,
    weeks: [
      buildTemplateWeek(1, "Home Week 1", "Entrenamiento practico en casa.", [
        buildTemplateDay(1, "Living Room A", "Empuje y piernas.", [
          buildTemplateExercise("Squat", 1, 3, "15", 30, "Usar rango comodo."),
          buildTemplateExercise("Incline Push Up", 2, 3, "12", 45, "Apoyo en sofa o mesa."),
          buildTemplateExercise("Band Walk", 3, 3, "15/side", 30, "Cadera estable."),
          buildTemplateExercise("Plank", 4, 3, "30s", 20, "Respirar tranquilo.")
        ]),
        buildTemplateDay(3, "Living Room B", "Tiron, gluteos y core.", [
          buildTemplateExercise("Band Row", 1, 4, "12", 30, "Tension continua."),
          buildTemplateExercise("Glute Bridge", 2, 4, "15", 30, "Sin arquear espalda."),
          buildTemplateExercise("Hammer Curl", 3, 3, "12", 30, "Mancuernas ligeras."),
          buildTemplateExercise("Mountain Climbers", 4, 3, "20s", 20, "Ritmo moderado.")
        ])
      ]),
      buildTemplateWeek(2, "Home Week 2", "Variaciones un poco mas retadoras.", [
        buildTemplateDay(1, "Living Room A+", "Mayor volumen casero.", [
          buildTemplateExercise("Goblet Squat", 1, 4, "12", 45, "Sostener mancuerna frontal."),
          buildTemplateExercise("Push Up", 2, 3, "10", 45, "Version completa o rodillas."),
          buildTemplateExercise("Lateral Raise", 3, 3, "15", 30, "Poco peso y control."),
          buildTemplateExercise("Russian Twist", 4, 3, "20", 20, "No colapsar hombros.")
        ]),
        buildTemplateDay(4, "Living Room C", "Mixto funcional de bajo equipo.", [
          buildTemplateExercise("Walking Lunge", 1, 3, "10/side", 45, "Paso firme."),
          buildTemplateExercise("Overhead Triceps Extension", 2, 3, "12", 30, "Codos estables."),
          buildTemplateExercise("High Knees", 3, 4, "25s", 20, "Elevar rodillas."),
          buildTemplateExercise("Dead Bug", 4, 3, "12/side", 25, "Coordinar respiracion.")
        ])
      ])
    ]
  }),
  buildRoutineTemplate({
    name: "Mobility Recovery Demo",
    description: "Sesiones suaves de movilidad y recuperacion activa.",
    level: "beginner",
    goal: "recovery",
    duration_weeks: 3,
    weeks: [
      buildTemplateWeek(1, "Recovery Week 1", "Movilidad general.", [
        buildTemplateDay(1, "Reset Flow", "Columna, hombros y cadera.", [
          buildTemplateExercise("Cat Cow", 1, 2, "8", 20, "Movimiento lento."),
          buildTemplateExercise("Thoracic Rotation", 2, 2, "8/side", 20, "Exhalar en rotacion."),
          buildTemplateExercise("90 90 Hip Switch", 3, 2, "10", 20, "Sin prisa."),
          buildTemplateExercise("Hamstring Sweep", 4, 2, "10/side", 20, "Rango gradual.")
        ]),
        buildTemplateDay(4, "Shoulder Reset", "Rango de hombro y activacion ligera.", [
          buildTemplateExercise("Banded Shoulder Dislocates", 1, 2, "12", 20, "Banda ligera."),
          buildTemplateExercise("Face Pull", 2, 3, "15", 30, "Separar manos al final."),
          buildTemplateExercise("Worlds Greatest Stretch", 3, 2, "6/side", 20, "Pausas respiradas."),
          buildTemplateExercise("Plank", 4, 2, "20s", 20, "Bracing suave.")
        ])
      ]),
      buildTemplateWeek(2, "Recovery Week 2", "Recuperacion activa con poco impacto.", [
        buildTemplateDay(2, "Mobility Circuit", "Circuito fluido de baja demanda.", [
          buildTemplateExercise("Cat Cow", 1, 2, "10", 20, "Sin dolor."),
          buildTemplateExercise("Band Walk", 2, 2, "12/side", 20, "Gluteos activos."),
          buildTemplateExercise("Glute Bridge", 3, 2, "12", 20, "Pausa breve."),
          buildTemplateExercise("Box Step March", 4, 3, "30s", 20, "Trabajo suave.")
        ]),
        buildTemplateDay(5, "Recovery Flow", "Movilidad de cuerpo completo.", [
          buildTemplateExercise("Thoracic Rotation", 1, 2, "10/side", 20, "Rotar con control."),
          buildTemplateExercise("Hamstring Sweep", 2, 2, "12/side", 20, "Fluido."),
          buildTemplateExercise("90 90 Hip Switch", 3, 2, "12", 20, "Ritmo continuo."),
          buildTemplateExercise("Dead Bug", 4, 2, "10/side", 20, "Respirar profundo.")
        ])
      ])
    ]
  }),
  buildRoutineTemplate({
    name: "Strength Fundamentals Demo",
    description: "Base de fuerza con patron dominante de sentadilla, press y tiron.",
    level: "intermediate",
    goal: "strength",
    duration_weeks: 6,
    weeks: [
      buildTemplateWeek(1, "Strength Week 1", "Primer bloque de carga tecnica.", [
        buildTemplateDay(1, "Primary Lift A", "Squat dominante.", [
          buildTemplateExercise("Barbell Back Squat", 1, 5, "5", 120, "Buscar tecnica estable."),
          buildTemplateExercise("Romanian Deadlift", 2, 4, "6", 90, "Espalda neutra."),
          buildTemplateExercise("Plank", 3, 3, "40s", 30, "Bracing fuerte."),
          buildTemplateExercise("Face Pull", 4, 3, "15", 30, "Higiene escapular.")
        ]),
        buildTemplateDay(3, "Primary Lift B", "Press y tiron.", [
          buildTemplateExercise("Barbell Bench Press", 1, 5, "5", 120, "Pausa controlada."),
          buildTemplateExercise("Pull Up", 2, 4, "6", 90, "Escala si hace falta."),
          buildTemplateExercise("Dumbbell Shoulder Press", 3, 3, "8", 60, "No arquear espalda."),
          buildTemplateExercise("Biceps Curl", 4, 3, "10", 45, "Accesorio sencillo.")
        ])
      ]),
      buildTemplateWeek(2, "Strength Week 2", "Segunda semana con algo mas de trabajo.", [
        buildTemplateDay(1, "Primary Lift C", "Pierna y gluteos.", [
          buildTemplateExercise("Leg Press", 1, 4, "8", 90, "Cargar con control."),
          buildTemplateExercise("Hip Thrust", 2, 4, "8", 90, "Extension completa."),
          buildTemplateExercise("Side Plank", 3, 3, "35s/side", 30, "No colapsar cadera."),
          buildTemplateExercise("Band Walk", 4, 3, "15/side", 30, "Activacion glutea.")
        ]),
        buildTemplateDay(4, "Primary Lift D", "Upper assistance.", [
          buildTemplateExercise("Machine Chest Press", 1, 4, "8-10", 75, "Trabajo de apoyo."),
          buildTemplateExercise("Lat Pulldown", 2, 4, "8-10", 75, "Recorrido completo."),
          buildTemplateExercise("Arnold Press", 3, 3, "8-10", 60, "Control de hombro."),
          buildTemplateExercise("Triceps Pushdown", 4, 3, "12", 45, "Accesorio final.")
        ])
      ])
    ]
  }),
  buildRoutineTemplate({
    name: "Women Lower Body Demo",
    description: "Enfoque de tren inferior con gluteos, piernas y estabilidad.",
    level: "intermediate",
    goal: "lower_body_hypertrophy",
    duration_weeks: 5,
    weeks: [
      buildTemplateWeek(1, "Lower Focus Week 1", "Base de gluteos y piernas.", [
        buildTemplateDay(1, "Glute Emphasis", "Sesión principal de gluteos.", [
          buildTemplateExercise("Hip Thrust", 1, 4, "10", 75, "Pausa arriba."),
          buildTemplateExercise("Bulgarian Split Squat", 2, 3, "10/side", 75, "Control total."),
          buildTemplateExercise("Cable Kickback", 3, 3, "15", 45, "Contraccion final."),
          buildTemplateExercise("Band Walk", 4, 3, "20/side", 30, "Activacion quemante.")
        ]),
        buildTemplateDay(4, "Quad and Shape", "Trabajo de piernas con estabilidad.", [
          buildTemplateExercise("Goblet Squat", 1, 4, "12", 60, "Pecho erguido."),
          buildTemplateExercise("Walking Lunge", 2, 3, "12/side", 60, "Paso largo."),
          buildTemplateExercise("Leg Extension", 3, 3, "15", 45, "Cuadriciceps al final."),
          buildTemplateExercise("Glute Bridge", 4, 3, "15", 30, "Acabado de gluteo.")
        ])
      ]),
      buildTemplateWeek(2, "Lower Focus Week 2", "Volumen complementario.", [
        buildTemplateDay(2, "Posterior Chain", "Cadena posterior y core.", [
          buildTemplateExercise("Romanian Deadlift", 1, 4, "10", 75, "Bisagra limpia."),
          buildTemplateExercise("Step Up", 2, 3, "12/side", 45, "Rodilla alineada."),
          buildTemplateExercise("Hip Thrust", 3, 4, "8-10", 75, "Cargar un poco mas."),
          buildTemplateExercise("Side Plank", 4, 3, "30s/side", 30, "Control lateral.")
        ]),
        buildTemplateDay(5, "Shape and Burn", "Sesion metabolica de lower body.", [
          buildTemplateExercise("Leg Press", 1, 4, "12", 60, "Cadencia continua."),
          buildTemplateExercise("Cable Kickback", 2, 3, "15/side", 30, "Sin balanceo."),
          buildTemplateExercise("Walking Lunge", 3, 3, "14/side", 45, "Ritmo constante."),
          buildTemplateExercise("High Knees", 4, 4, "20s", 20, "Final con pulso.")
        ])
      ])
    ]
  }),
  buildRoutineTemplate({
    name: "Functional Conditioning Demo",
    description: "Entrenamiento mixto de fuerza ligera, core y acondicionamiento funcional.",
    level: "intermediate",
    goal: "conditioning",
    duration_weeks: 4,
    weeks: [
      buildTemplateWeek(1, "Conditioning Week 1", "Circuitos funcionales.", [
        buildTemplateDay(1, "Engine Builder", "Trabajo continuo de cuerpo completo.", [
          buildTemplateExercise("Battle Rope Waves", 1, 4, "30s", 30, "Cadencia pareja."),
          buildTemplateExercise("Goblet Squat", 2, 4, "12", 45, "Respiracion estable."),
          buildTemplateExercise("Push Up", 3, 3, "12", 30, "Sin perder forma."),
          buildTemplateExercise("Mountain Climbers", 4, 3, "30s", 20, "Core activo.")
        ]),
        buildTemplateDay(3, "Athletic Circuit", "Patrones dinamicos y laterales.", [
          buildTemplateExercise("Skater Hops", 1, 4, "16", 30, "Aterrizar suave."),
          buildTemplateExercise("Dumbbell Row", 2, 3, "12/side", 45, "Espalda neutra."),
          buildTemplateExercise("Walking Lunge", 3, 3, "12/side", 45, "Ritmo controlado."),
          buildTemplateExercise("Russian Twist", 4, 3, "24", 20, "Rotacion limpia.")
        ])
      ]),
      buildTemplateWeek(2, "Conditioning Week 2", "Mas densidad por bloque.", [
        buildTemplateDay(2, "Hybrid Circuit", "Cardio y fuerza ligera.", [
          buildTemplateExercise("Burpees", 1, 4, "10", 30, "Mantener tecnica."),
          buildTemplateExercise("Band Row", 2, 4, "15", 30, "Escapulas activas."),
          buildTemplateExercise("Hip Thrust", 3, 3, "12", 45, "Pausa en gluteos."),
          buildTemplateExercise("Plank", 4, 3, "40s", 20, "Brace constante.")
        ]),
        buildTemplateDay(5, "Work Capacity", "Capacidad de trabajo con menor impacto.", [
          buildTemplateExercise("Box Step March", 1, 4, "40s", 20, "Cadencia continua."),
          buildTemplateExercise("Machine Chest Press", 2, 3, "12", 45, "Mantener forma."),
          buildTemplateExercise("Lat Pulldown", 3, 3, "12", 45, "Bajar controlado."),
          buildTemplateExercise("High Knees", 4, 4, "25s", 20, "Ultimo empuje.")
        ])
      ])
    ]
  })
];

function loadEnv(filePath) {
  const lines = fs.readFileSync(filePath, "utf8").split(/\r?\n/);
  const env = {};

  for (const rawLine of lines) {
    const line = rawLine.trim();
    if (!line || line.startsWith("#")) {
      continue;
    }

    const separatorIndex = line.indexOf("=");
    if (separatorIndex <= 0) {
      continue;
    }

    const key = line.slice(0, separatorIndex).trim();
    const value = line.slice(separatorIndex + 1).trim();
    env[key] = value;
  }

  return env;
}

function buildClientConfig(databaseUrl) {
  const parsed = new URL(databaseUrl);

  return {
    host: parsed.hostname,
    port: Number(parsed.port || 5432),
    database: (parsed.pathname || "/postgres").replace(/^\//, "") || "postgres",
    user: decodeURIComponent(parsed.username),
    password: decodeURIComponent(parsed.password),
    ssl: { rejectUnauthorized: false }
  };
}

async function ensureStagingEnvironment() {
  const envPath = path.join(BACKEND_ROOT, ".env.staging");

  if (!fs.existsSync(envPath)) {
    throw new Error("Missing backend/.env.staging");
  }

  const env = loadEnv(envPath);

  if (env.NODE_ENV !== "staging" || env.APP_ENV !== "staging") {
    throw new Error("Staging environment not confirmed");
  }

  if (!env.DATABASE_URL) {
    throw new Error("Missing DATABASE_URL in backend/.env.staging");
  }

  return env;
}

async function getDemoCompany(client) {
  const { rows } = await client.query(
    `
      select id, slug
      from companies
      where lower(slug) = lower($1)
      limit 1
    `,
    [DEMO_COMPANY_SLUG]
  );

  if (!rows[0]) {
    throw new Error("RubDev Demo Company not found in staging");
  }

  return rows[0];
}

async function getSeedUser(client, companyId) {
  const { rows } = await client.query(
    `
      select id, email
      from app_users
      where company_id = $1 and lower(email) = lower($2)
      limit 1
    `,
    [companyId, DEMO_USER_EMAIL]
  );

  return rows[0] ?? null;
}

async function upsertTrainer(client, companyId, userId, trainer) {
  const existing = await client.query(
    `
      select id
      from trainers
      where company_id = $1
        and lower(email) = lower($2)
      limit 1
    `,
    [companyId, trainer.email]
  );

  if (existing.rows[0]) {
    const { rows } = await client.query(
      `
        update trainers
        set
          name = $3,
          phone = $4,
          specialization = $5,
          status = $6,
          updated_by = $7,
          updated_at = now(),
          deleted_at = null
        where id = $1 and company_id = $2
        returning id, name, email
      `,
      [
        existing.rows[0].id,
        companyId,
        trainer.name,
        trainer.phone,
        trainer.specialization,
        trainer.status,
        userId
      ]
    );

    return rows[0];
  }

  const { rows } = await client.query(
    `
      insert into trainers (
        company_id, name, email, phone, specialization, status,
        created_by, updated_by
      )
      values ($1, $2, $3, $4, $5, $6, $7, $7)
      returning id, name, email
    `,
    [
      companyId,
      trainer.name,
      trainer.email,
      trainer.phone,
      trainer.specialization,
      trainer.status,
      userId
    ]
  );

  return rows[0];
}

async function upsertFitnessClient(client, companyId, userId, trainerId, fitnessClient) {
  const existing = await client.query(
    `
      select id
      from fitness_clients
      where company_id = $1
        and lower(email) = lower($2)
      limit 1
    `,
    [companyId, fitnessClient.email]
  );

  if (existing.rows[0]) {
    const { rows } = await client.query(
      `
        update fitness_clients
        set
          name = $3,
          phone = $4,
          goal = $5,
          status = $6,
          assigned_trainer_id = $7,
          updated_by = $8,
          updated_at = now(),
          deleted_at = null
        where id = $1 and company_id = $2
        returning id, name, email
      `,
      [
        existing.rows[0].id,
        companyId,
        fitnessClient.name,
        fitnessClient.phone,
        fitnessClient.goal,
        fitnessClient.status,
        trainerId,
        userId
      ]
    );

    return rows[0];
  }

  const { rows } = await client.query(
    `
      insert into fitness_clients (
        company_id, name, email, phone, goal, status,
        assigned_trainer_id, created_by, updated_by
      )
      values ($1, $2, $3, $4, $5, $6, $7, $8, $8)
      returning id, name, email
    `,
    [
      companyId,
      fitnessClient.name,
      fitnessClient.email,
      fitnessClient.phone,
      fitnessClient.goal,
      fitnessClient.status,
      trainerId,
      userId
    ]
  );

  return rows[0];
}

async function upsertExercise(client, companyId, userId, exercise) {
  const existing = await client.query(
    `
      select id
      from exercises
      where company_id = $1
        and lower(name) = lower($2)
      order by deleted_at nulls first, created_at asc
      limit 1
    `,
    [companyId, exercise.name]
  );

  if (existing.rows[0]) {
    const { rows } = await client.query(
      `
        update exercises
        set
          description = $3,
          category = $4,
          muscle_group = $5,
          equipment = $6,
          difficulty = $7,
          video_url = $8,
          image_url = $9,
          is_active = $10,
          updated_by = $11,
          updated_at = now(),
          deleted_at = null
        where id = $1 and company_id = $2
        returning id, name
      `,
      [
        existing.rows[0].id,
        companyId,
        exercise.description,
        exercise.category,
        exercise.muscle_group,
        exercise.equipment,
        exercise.difficulty,
        exercise.video_url,
        exercise.image_url,
        exercise.is_active,
        userId
      ]
    );

    return rows[0];
  }

  const { rows } = await client.query(
    `
      insert into exercises (
        company_id, name, description, category, muscle_group, equipment,
        difficulty, video_url, image_url, is_active, created_by, updated_by
      )
      values ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $11)
      returning id, name
    `,
    [
      companyId,
      exercise.name,
      exercise.description,
      exercise.category,
      exercise.muscle_group,
      exercise.equipment,
      exercise.difficulty,
      exercise.video_url,
      exercise.image_url,
      exercise.is_active,
      userId
    ]
  );

  return rows[0];
}

async function upsertRoutineTemplate(client, companyId, userId, template) {
  const existing = await client.query(
    `
      select id
      from routine_templates
      where company_id = $1
        and lower(name) = lower($2)
      order by deleted_at nulls first, created_at asc
      limit 1
    `,
    [companyId, template.name]
  );

  if (existing.rows[0]) {
    const { rows } = await client.query(
      `
        update routine_templates
        set
          description = $3,
          level = $4,
          goal = $5,
          duration_weeks = $6,
          is_active = $7,
          updated_by = $8,
          updated_at = now(),
          deleted_at = null
        where id = $1 and company_id = $2
        returning id, name
      `,
      [
        existing.rows[0].id,
        companyId,
        template.description,
        template.level,
        template.goal,
        template.duration_weeks,
        template.is_active,
        userId
      ]
    );

    return rows[0];
  }

  const { rows } = await client.query(
    `
      insert into routine_templates (
        company_id, name, description, level, goal, duration_weeks,
        is_active, created_by, updated_by
      )
      values ($1, $2, $3, $4, $5, $6, $7, $8, $8)
      returning id, name
    `,
    [
      companyId,
      template.name,
      template.description,
      template.level,
      template.goal,
      template.duration_weeks,
      template.is_active,
      userId
    ]
  );

  return rows[0];
}

async function upsertRoutineTemplateWeek(client, companyId, userId, templateId, week) {
  const existing = await client.query(
    `
      select id
      from routine_template_weeks
      where company_id = $1
        and routine_template_id = $2
        and week_number = $3
      order by deleted_at nulls first, created_at asc
      limit 1
    `,
    [companyId, templateId, week.week_number]
  );

  if (existing.rows[0]) {
    const { rows } = await client.query(
      `
        update routine_template_weeks
        set
          name = $4,
          description = $5,
          updated_by = $6,
          updated_at = now(),
          deleted_at = null
        where id = $1 and company_id = $2 and routine_template_id = $3
        returning id, week_number
      `,
      [
        existing.rows[0].id,
        companyId,
        templateId,
        week.name,
        week.description,
        userId
      ]
    );

    return rows[0];
  }

  const { rows } = await client.query(
    `
      insert into routine_template_weeks (
        company_id, routine_template_id, week_number, name, description,
        created_by, updated_by
      )
      values ($1, $2, $3, $4, $5, $6, $6)
      returning id, week_number
    `,
    [companyId, templateId, week.week_number, week.name, week.description, userId]
  );

  return rows[0];
}

async function upsertRoutineTemplateDay(client, companyId, userId, weekId, day) {
  const existing = await client.query(
    `
      select id
      from routine_template_days
      where company_id = $1
        and routine_template_week_id = $2
        and day_number = $3
      order by deleted_at nulls first, created_at asc
      limit 1
    `,
    [companyId, weekId, day.day_number]
  );

  if (existing.rows[0]) {
    const { rows } = await client.query(
      `
        update routine_template_days
        set
          name = $4,
          description = $5,
          updated_by = $6,
          updated_at = now(),
          deleted_at = null
        where id = $1 and company_id = $2 and routine_template_week_id = $3
        returning id, day_number
      `,
      [
        existing.rows[0].id,
        companyId,
        weekId,
        day.name,
        day.description,
        userId
      ]
    );

    return rows[0];
  }

  const { rows } = await client.query(
    `
      insert into routine_template_days (
        company_id, routine_template_week_id, day_number, name, description,
        created_by, updated_by
      )
      values ($1, $2, $3, $4, $5, $6, $6)
      returning id, day_number
    `,
    [companyId, weekId, day.day_number, day.name, day.description, userId]
  );

  return rows[0];
}

async function upsertRoutineTemplateExercise(client, companyId, userId, dayId, exerciseId, item) {
  const existing = await client.query(
    `
      select id
      from routine_template_exercises
      where company_id = $1
        and routine_template_day_id = $2
        and sort_order = $3
      order by deleted_at nulls first, created_at asc
      limit 1
    `,
    [companyId, dayId, item.sort_order]
  );

  if (existing.rows[0]) {
    const { rows } = await client.query(
      `
        update routine_template_exercises
        set
          exercise_id = $4,
          sets = $5,
          reps = $6,
          rest_seconds = $7,
          notes = $8,
          updated_by = $9,
          updated_at = now(),
          deleted_at = null
        where id = $1 and company_id = $2 and routine_template_day_id = $3
        returning id, sort_order
      `,
      [
        existing.rows[0].id,
        companyId,
        dayId,
        exerciseId,
        item.sets,
        item.reps,
        item.rest_seconds,
        item.notes,
        userId
      ]
    );

    return rows[0];
  }

  const { rows } = await client.query(
    `
      insert into routine_template_exercises (
        company_id, routine_template_day_id, exercise_id, sort_order, sets,
        reps, rest_seconds, notes, created_by, updated_by
      )
      values ($1, $2, $3, $4, $5, $6, $7, $8, $9, $9)
      returning id, sort_order
    `,
    [
      companyId,
      dayId,
      exerciseId,
      item.sort_order,
      item.sets,
      item.reps,
      item.rest_seconds,
      item.notes,
      userId
    ]
  );

  return rows[0];
}

async function fetchCounts(client, companyId) {
  const countQueries = {
    trainers: `select count(*)::int as total from trainers where company_id = $1 and deleted_at is null`,
    fitness_clients: `select count(*)::int as total from fitness_clients where company_id = $1 and deleted_at is null`,
    exercises: `select count(*)::int as total from exercises where company_id = $1 and deleted_at is null`,
    routine_templates: `select count(*)::int as total from routine_templates where company_id = $1 and deleted_at is null`,
    routine_template_weeks: `select count(*)::int as total from routine_template_weeks where company_id = $1 and deleted_at is null`,
    routine_template_days: `select count(*)::int as total from routine_template_days where company_id = $1 and deleted_at is null`,
    routine_template_exercises: `select count(*)::int as total from routine_template_exercises where company_id = $1 and deleted_at is null`
  };

  const counts = {};

  for (const [key, sql] of Object.entries(countQueries)) {
    const { rows } = await client.query(sql, [companyId]);
    counts[key] = rows[0]?.total ?? 0;
  }

  return counts;
}

async function main() {
  const env = await ensureStagingEnvironment();
  const client = new Client(buildClientConfig(env.DATABASE_URL));

  await client.connect();

  try {
    const probe = await client.query(
      `select current_database() as current_database, current_user as current_user, now() as current_time`
    );

    await client.query("begin");

    const company = await getDemoCompany(client);
    const seedUser = await getSeedUser(client, company.id);
    const seedUserId = seedUser?.id ?? null;

    const trainersByEmail = {};
    for (const trainer of DEMO_TRAINERS) {
      const savedTrainer = await upsertTrainer(client, company.id, seedUserId, trainer);
      trainersByEmail[savedTrainer.email.toLowerCase()] = savedTrainer;
    }

    const clients = [];
    for (const fitnessClient of DEMO_CLIENTS) {
      const assignedTrainer = trainersByEmail[fitnessClient.assignedTrainerEmail.toLowerCase()];
      const savedClient = await upsertFitnessClient(
        client,
        company.id,
        seedUserId,
        assignedTrainer?.id ?? null,
        fitnessClient
      );
      clients.push(savedClient);
    }

    const exercisesByName = {};
    for (const exercise of DEMO_EXERCISES) {
      const savedExercise = await upsertExercise(client, company.id, seedUserId, exercise);
      exercisesByName[savedExercise.name] = savedExercise;
    }

    const templates = [];
    for (const template of DEMO_ROUTINE_TEMPLATES) {
      const savedTemplate = await upsertRoutineTemplate(client, company.id, seedUserId, template);
      templates.push(savedTemplate);

      for (const week of template.weeks) {
        const savedWeek = await upsertRoutineTemplateWeek(client, company.id, seedUserId, savedTemplate.id, week);

        for (const day of week.days) {
          const savedDay = await upsertRoutineTemplateDay(client, company.id, seedUserId, savedWeek.id, day);

          for (const item of day.exercises) {
            const exercise = exercisesByName[item.exerciseName];

            if (!exercise) {
              throw new Error(`Missing seeded exercise reference: ${item.exerciseName}`);
            }

            await upsertRoutineTemplateExercise(
              client,
              company.id,
              seedUserId,
              savedDay.id,
              exercise.id,
              item
            );
          }
        }
      }
    }

    await client.query("commit");

    const counts = await fetchCounts(client, company.id);

    console.log(
      JSON.stringify({
        stagingConnectionValid: true,
        seedScope: "fitness_core_demo_data",
        connectionProbe: {
          hasDatabase: Boolean(probe.rows[0]?.current_database),
          hasUser: Boolean(probe.rows[0]?.current_user),
          hasTime: Boolean(probe.rows[0]?.current_time)
        },
        demoCompany: {
          slug: company.slug
        },
        demoRecords: {
          trainers: DEMO_TRAINERS.map((trainer) => trainer.name),
          fitness_clients: DEMO_CLIENTS.map((fitnessClient) => fitnessClient.name),
          exercises: DEMO_EXERCISES.map((exercise) => exercise.name),
          routine_templates: DEMO_ROUTINE_TEMPLATES.map((template) => template.name)
        },
        counts
      })
    );
  } catch (error) {
    await client.query("rollback");
    throw error;
  } finally {
    await client.end();
  }
}

main().catch((error) => {
  console.error("STAGING_FITNESS_SEED_ERROR");
  console.error(error.message);
  process.exit(1);
});
