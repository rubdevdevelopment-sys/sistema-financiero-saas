import { sendSuccess } from "../utils/response.js";
import { createCategory, listCategories } from "../services/category.service.js";

export async function getCategories(req, res) {
  const categories = await listCategories(req.user, req.query.type);
  return sendSuccess(res, categories, "Categorias obtenidas");
}

export async function createCategoryAction(req, res) {
  const category = await createCategory(req.validated.body, req.user);
  return sendSuccess(res, category, "Categoria creada", 201);
}
