export type ContractStatus = "draft" | "pending" | "active" | "expired" | "renewed" | "terminated";
export type ContractType = "full-time" | "part-time" | "contract" | "intern";

export type ContractsType = {
  id?: number;
  school_id?: number;
  staff_id?: number;
  contract_number?: string;
  contract_type?: ContractType;
  job_title?: string;
  department_id?: number;
  start_date?: Date;
  end_date?: Date;
  salary?: number;
  salary_currency?: string;
  salary_frequency?: "monthly" | "bi-weekly" | "weekly" | "annually";
  probation_period_days?: number;
  notice_period_days?: number;
  terms?: string;
  document_url?: string;
  status?: ContractStatus;
  signed_at?: Date;
  signed_by?: number;
  created_by?: number;
  created_at?: Date;
  updated_at?: Date;
  is_deleted?: boolean;
};

export type CreateContractsInput = Partial<ContractsType>;
export type UpdateContractsInput = Partial<ContractsType>;