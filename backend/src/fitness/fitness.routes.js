import { Router } from "express";
import { trainersRouter } from "./trainers/trainers.routes.js";
import { fitnessClientsRouter } from "./clients/fitness-clients.routes.js";
import { exercisesRouter } from "./exercises/exercises.routes.js";
import { routineTemplatesRouter } from "./routines/routine-templates.routes.js";

export const fitnessRouter = Router();

fitnessRouter.use("/trainers", trainersRouter);
fitnessRouter.use("/clients", fitnessClientsRouter);
fitnessRouter.use("/exercises", exercisesRouter);
fitnessRouter.use("/routine-templates", routineTemplatesRouter);
