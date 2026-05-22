import { Model } from "../../../db/index.js";
import { HttpError } from "../../../helpers/error.js";
import { CertificationErrors } from "./errors.js";
import type { CertificationsType, CreateCertificationsInput, UpdateCertificationsInput } from "./types.js";

const CertificationsModel = Model.StaffCertifications || Model.addModel("staff_certifications", {
  id: { type: "int", primary: true, autoIncrement: true },
  school_id: { type: "int" },
  staff_id: { type: "int" },
  name: { type: "varchar", length: 255 },
  issuer: { type: "varchar", length: 255 },
  issue_date: { type: "date" },
  expiry_date: { type: "date" },
  credential_id: { type: "varchar", length: 255 },
  credential_url: { type: "varchar", length: 500 },
  document_url: { type: "varchar", length: 500 },
  created_at: { type: "datetime" },
  updated_at: { type: "datetime" },
  is_deleted: { type: "boolean", default: false },
});

async function getAll(filters?: Partial<CertificationsType>): Promise<CertificationsType[]> {
  return CertificationsModel.findAll({ where: { is_deleted: false, ...filters } });
}

async function getById(id: number): Promise<CertificationsType> {
  const cert = await CertificationsModel.findByPk(id);
  if (!cert) throw new HttpError(404, CertificationErrors.NOT_FOUND);
  return cert;
}

async function create(data: CreateCertificationsInput): Promise<CertificationsType> {
  return CertificationsModel.create(data as CertificationsType);
}

async function update(id: number, data: UpdateCertificationsInput): Promise<CertificationsType> {
  await getById(id);
  await CertificationsModel.update(data, { where: { id } });
  return getById(id);
}

async function deleteCertification(id: number): Promise<void> {
  await getById(id);
  await CertificationsModel.update({ is_deleted: true }, { where: { id } });
}

export default { getAll, getById, create, update, delete: deleteCertification };