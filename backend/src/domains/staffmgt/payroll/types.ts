export type PayrollStatus = "pending" | "processing" | "paid" | "failed" | "cancelled";

export type PayrollType = {
  id?: number;
  school_id?: number;
  staff_id?: number;
  bank_name?: string;
  bank_account_number?: string;
  bank_routing_number?: string;
  bank_account_name?: string;
  bank_account_type?: "checking" | "savings";
  base_salary?: number;
  salary_currency?: string;
  salary_frequency?: "weekly" | "bi-weekly" | "monthly" | "annually";
  tax_deductions?: number;
  benefits_deductions?: number;
  other_deductions?: number;
  net_salary?: number;
  is_active?: boolean;
  last_paid_date?: Date;
  created_at?: Date;
  updated_at?: Date;
  is_deleted?: boolean;
};

export type CreatePayrollInput = Partial<PayrollType>;
export type UpdatePayrollInput = Partial<PayrollType>;