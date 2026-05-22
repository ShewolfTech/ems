export type PromotionStatus = "pending" | "approved" | "rejected" | "cancelled";

export type PromotionsType = {
  id?: number;
  school_id?: number;
  staff_id?: number;
  current_title?: string;
  new_title?: string;
  current_salary?: number;
  new_salary?: number;
  salary_currency?: string;
  effective_date?: Date;
  reason?: string;
  approved_by?: number;
  approved_at?: Date;
  status?: PromotionStatus;
  notes?: string;
  created_by?: number;
  created_at?: Date;
  updated_at?: Date;
  is_deleted?: boolean;
};

export type CreatePromotionsInput = Partial<PromotionsType>;
export type UpdatePromotionsInput = Partial<PromotionsType>;