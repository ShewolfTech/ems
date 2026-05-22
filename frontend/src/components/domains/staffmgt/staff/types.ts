export type StaffStatus = 'active' | 'inactive' | 'suspended' | 'terminated' | 'on_leave';

export type StaffEmploymentType = 'full_time' | 'part_time' | 'contract' | 'temporary' | 'intern' | 'consultant';

export type StaffEmploymentStatus = 'active' | 'inactive' | 'on_leave' | 'suspended' | 'terminated';

export type StaffTitle = 'Mr' | 'Mrs' | 'Ms' | 'Dr' | 'Prof';

export type StaffGender = 'male' | 'female' | 'other';

export interface Staff {
  id?: number | string;
  employee_number?: string;
  title?: StaffTitle;
  first_name: string;
  middle_name?: string;
  last_name: string;
  date_of_birth?: string;
  gender?: StaffGender;
  national_id?: string;
  passport_number?: string;
  phone?: string;
  email: string;
  address?: string;
  city?: string;
  state?: string;
  postal_code?: string;
  country?: string;
  emergency_contact_name?: string;
  emergency_contact_phone?: string;
  emergency_contact_relationship?: string;
  department_id?: number;
  role_id?: number;
  supervisor_id?: number;
  employment_type: StaffEmploymentType;
  employment_status: StaffEmploymentStatus;
  hire_date: string;
  termination_date?: string;
  experience_years?: number;
  qualifications?: string;
  certifications?: string;
  skills?: string;
  salary?: number;
  benefits?: string;
  work_schedule?: string;
  profile_photo_url?: string;
  school_id?: number;
  created_at?: string;
  updated_at?: string;
}

export interface StaffFilters {
  search?: string;
  department_id?: number;
  role_id?: number;
  employment_status?: StaffEmploymentStatus;
  employment_type?: StaffEmploymentType;
  page?: number;
  limit?: number;
}

export interface StaffStatistics {
  total: number;
  active: number;
  inactive: number;
  on_leave: number;
  by_department: Array<{
    department: string;
    count: number;
  }>;
  by_employment_type: Array<{
    type: string;
    count: number;
  }>;
}