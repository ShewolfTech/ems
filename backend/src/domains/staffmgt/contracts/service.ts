import { Model } from "../../../db/index.js";
import { HttpError } from "../../../helpers/error.js";
import { ContractErrors } from "./errors.js";
import type { ContractsType, CreateContractsInput, UpdateContractsInput } from "./types.js";

const ContractsModel = Model.StaffContracts || Model.addModel("staff_contracts", {
  id: { type: "int", primary: true, autoIncrement: true },
  school_id: { type: "int" },
  staff_id: { type: "int" },
  contract_number: { type: "varchar", length: 50 },
  contract_type: { type: "enum", values: ["full-time", "part-time", "contract", "intern"] },
  job_title: { type: "varchar", length: 255 },
  department_id: { type: "int" },
  start_date: { type: "date" },
  end_date: { type: "date" },
  salary: { type: "decimal" },
  salary_currency: { type: "varchar", length: 3 },
  salary_frequency: { type: "enum", values: ["monthly", "bi-weekly", "weekly", "annually"] },
  probation_period_days: { type: "int" },
  notice_period_days: { type: "int" },
  terms: { type: "text" },
  document_url: { type: "varchar", length: 500 },
  status: { type: "enum", values: ["draft", "pending", "active", "expired", "renewed", "terminated"], default: "draft" },
  signed_at: { type: "datetime" },
  signed_by: { type: "int" },
  created_by: { type: "int" },
  created_at: { type: "datetime" },
  updated_at: { type: "datetime" },
  is_deleted: { type: "boolean", default: false },
});

async function getAll(filters?: Partial<ContractsType>): Promise<ContractsType[]> {
  return ContractsModel.findAll({ where: { is_deleted: false, ...filters } });
}

async function getById(id: number): Promise<ContractsType> {
  const contract = await ContractsModel.findByPk(id);
  if (!contract) throw new HttpError(404, ContractErrors.NOT_FOUND);
  return contract;
}

async function create(data: CreateContractsInput): Promise<ContractsType> {
  const contractNumber = await generateContractNumber();
  return ContractsModel.create({ ...data, contract_number: contractNumber } as ContractsType);
}

async function update(id: number, data: UpdateContractsInput): Promise<ContractsType> {
  await getById(id);
  await ContractsModel.update(data, { where: { id } });
  return getById(id);
}

async function renew(id: number): Promise<ContractsType> {
  const contract = await getById(id);
  if (contract.status === "active") {
    throw new HttpError(400, ContractErrors.CANNOT_RENEW);
  }
  await ContractsModel.update({ status: "renewed" }, { where: { id } });
  return getById(id);
}

async function terminate(id: number, terminationDate: Date, reason: string): Promise<ContractsType> {
  const contract = await getById(id);
  if (contract.status !== "active") {
    throw new HttpError(400, ContractErrors.CANNOT_TERMINATE);
  }
  await ContractsModel.update({ status: "terminated", end_date: terminationDate, terms: reason }, { where: { id } });
  return getById(id);
}

async function deleteContract(id: number): Promise<void> {
  await getById(id);
  await ContractsModel.update({ is_deleted: true }, { where: { id } });
}

async function generateContractNumber(): Promise<string> {
  const year = new Date().getFullYear();
  const count = await ContractsModel.count() + 1;
  return `CNT/${year}/${count.toString().padStart(4, "0")}`;
}

export default { getAll, getById, create, update, renew, terminate, delete: deleteContract };