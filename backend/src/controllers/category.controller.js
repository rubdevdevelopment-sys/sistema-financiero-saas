import { sendSuccess } from "../utils/response.js";
import {
  createCategory,
  deleteCategory,
  listCategories,
  updateCategory
} from "../services/category.service.js";

export async function getCategories(req, res) {
  const categories = await listCategories(req.user, req.validated.query);
  return sendSuccess(res, categories, "Categorias obtenidas");
}

export async function createCategoryAction(req, res) {
  const category = await createCategory(req.validated.body, req.user);
  return sendSuccess(res, category, "Categoria creada", 201);
}

export async function updateCategoryAction(req, res) {
  const category = await updateCategory(req.validated.params.id, req.validated.body, req.user);
  return sendSuccess(res, category, "Categoria actualizada");
}

export async function deleteCategoryAction(req, res) {
  const category = await deleteCategory(req.validated.params.id, req.user);
  return sendSuccess(res, category, "Categoria eliminada");
}
