export type AccessStatus = "active" | "inactive" | "suspended" | "expired";
export type AccessLevel = "full" | "restricted" | "limited" | "none";

export type IdAccessType = {
  id?: number;
  school_id?: number;
  staff_id?: number;
  staff_id_number?: string;
  rfid_card_number?: string;
  fingerprint_id?: string;
  access_level?: AccessLevel;
  access_zones?: string;
  allowed_buildings?: string;
  allowed_entries?: string;
  valid_from?: Date;
  valid_until?: Date;
  status?: AccessStatus;
  issued_at?: Date;
  returned_at?: Date;
  issued_by?: number;
  created_at?: Date;
  updated_at?: Date;
  is_deleted?: boolean;
};

export type CreateIdAccessInput = Partial<IdAccessType>;
export type UpdateIdAccessInput = Partial<IdAccessType>;