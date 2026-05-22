export type IncidentType = "verbal-warning" | "written-warning" | "final-warning" | "suspension" | "termination" | "other";
export type IncidentStatus = "open" | "under-investigation" | "resolved" | "closed";

export type DisciplinaryType = {
  id?: number;
  school_id?: number;
  staff_id?: number;
  incident_type?: IncidentType;
  incident_date?: Date;
  description?: string;
  location?: string;
  witnesses?: string;
  reported_by?: number;
  incident_status?: IncidentStatus;
  severity?: "low" | "medium" | "high" | "critical";
  action_taken?: string;
  resolved_by?: number;
  resolved_at?: Date;
  resolution_notes?: string;
  created_at?: Date;
  updated_at?: Date;
  is_deleted?: boolean;
};

export type CreateDisciplinaryInput = Partial<DisciplinaryType>;
export type UpdateDisciplinaryInput = Partial<DisciplinaryType>;