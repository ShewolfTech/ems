import { Model } from "../../../db/index.js";
import { HttpError } from "../../../helpers/error.js";
import { PromotionErrors } from "./errors.js";
import type { CreatePromotionsInput, PromotionsType, UpdatePromotionsInput } from "./types.js";

const PromotionsModel = Model.StaffPromotions || Model.addModel("staff_promotions", {
  id: { type: "int", primary: true, autoIncrement: true },
  school_id: { type: "int" },
  staff_id: { type: "int" },
  current_title: { type: "varchar", length: 255 },
  new_title: { type: "varchar", length: 255 },
  current_salary: { type: "decimal" },
  new_salary: { type: "decimal" },
  salary_currency: { type: "varchar", length: 3 },
  effective_date: { type: "date" },
  reason: { type: "text" },
  approved_by: { type: "int" },
  approved_at: { type: "datetime" },
  status: { type: "enum", values: ["pending", "approved", "rejected", "cancelled"], default: "pending" },
  notes: { type: "text" },
  created_by: { type: "int" },
  created_at: { type: "datetime" },
  updated_at: { type: "datetime" },
  is_deleted: { type: "boolean", default: false },
});

async function getAll(filters?: Partial<PromotionsType>): Promise<PromotionsType[]> {
  return PromotionsModel.findAll({ where: { is_deleted: false, ...filters } });
}

async function getById(id: number): Promise<PromotionsType> {
  const promotion = await PromotionsModel.findByPk(id);
  if (!promotion) throw new HttpError(404, PromotionErrors.NOT_FOUND);
  return promotion;
}

async function create(data: CreatePromotionsInput): Promise<PromotionsType> {
  return PromotionsModel.create(data as PromotionsType);
}

async function update(id: number, data: UpdatePromotionsInput): Promise<PromotionsType> {
  await getById(id);
  await PromotionsModel.update(data, { where: { id } });
  return getById(id);
}

async function deletePromotion(id: number): Promise<void> {
  await getById(id);
  await PromotionsModel.update({ is_deleted: true }, { where: { id } });
}

export default { getAll, getById, create, update, delete: deletePromotion };