export type CertificationsType = {
  id?: number;
  school_id?: number;
  staff_id?: number;
  name?: string;
  issuer?: string;
  issue_date?: Date;
  expiry_date?: Date;
  credential_id?: string;
  credential_url?: string;
  document_url?: string;
  created_at?: Date;
  updated_at?: Date;
  is_deleted?: boolean;
};

export type CreateCertificationsInput = Partial<CertificationsType>;
export type UpdateCertificationsInput = Partial<CertificationsType>;