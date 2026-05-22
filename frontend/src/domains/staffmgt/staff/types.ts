// Staff Management Domain - Comprehensive Types
import type { DB } from "@shared/db/kysely.generated.js";

type Unwrap<T> = T extends { __select__: infer S } ? S : T extends { readonly __brand__: any } ? T : T;

// Enum types for better type safety
export type StaffStatus = 'active' | 'inactive' | 'suspended' | 'terminated' | 'on_leave';
export type StaffGender = 'male' | 'female' | 'other';
export type StaffMaritalStatus = 'single' | 'married' | 'divorced' | 'widowed' | 'separated';
export type EmploymentType = 'full_time' | 'part_time' | 'contract' | 'temporary' | 'intern' | 'consultant';
export type StaffTitle = 'mr' | 'mrs' | 'ms' | 'miss' | 'dr' | 'prof' | 'rev';

// Main Staff Entity with all fields
export type Staff = {
  [K in keyof DB["staff"]]: Unwrap<DB["staff"][K]>;
} & {
  // Joined fields from users table
  first_name?: string;
  last_name?: string;
  email?: string;
  phone?: string;
  username?: string;
  profile_photo_url?: string;
  
  // Joined fields from departments
  department_name?: string;
  department_code?: string;
  
  // Joined fields from roles
  role_name?: string;
  role_description?: string;
  
  // Additional computed fields
  full_name?: string;
  age?: number;
  years_of_service?: number;
  leave_balance?: number;
  attendance_rate?: number;
};

// Create/Update types
export type CreateStaff = Omit<Staff, 
  "id" | "schoolId" | "school_id" | "userId" | "user_id" | 
  "created_at" | "updated_at" | "deleted_at" | "createdAt" | "updatedAt" | "deletedAt" | 
  "created_by" | "updated_by" | "deleted_by" | "createdBy" | "updatedBy" | "deletedBy" | 
  "is_deleted" | "isDeleted" | "user_id"
>;

export type UpdateStaff = Partial<CreateStaff> & { id?: number | string };

// Comprehensive form values
export type StaffFormValues = {
  // Personal Information
  title?: StaffTitle;
  first_name: string;
  middle_name?: string;
  last_name: string;
  date_of_birth?: string;
  gender?: StaffGender;
  national_id?: string;
  passport_number?: string;
  marital_status?: StaffMaritalStatus;
  nationality?: string;
  religion?: string;
  blood_group?: string;
  
  // Contact Information
  email: string;
  phone: string;
  alternate_phone?: string;
  address_line1?: string;
  address_line2?: string;
  city?: string;
  state?: string;
  postal_code?: string;
  country?: string;
  emergency_contact_name?: string;
  emergency_contact_phone?: string;
  emergency_contact_relation?: string;
  
  // Employment Information
  employee_no?: string;
  hire_date?: string;
  employment_type?: EmploymentType;
  department_id?: number;
  role_id?: number;
  designation?: string;
  employment_status?: StaffStatus;
  probation_end_date?: string;
  confirmation_date?: string;
  contract_end_date?: string;
  supervisor_id?: number;
  work_location?: string;
  
  // Professional Information
  qualifications?: string;
  experience_years?: number;
  specialization?: string;
  joining_reason?: string;
  previous_employer?: string;
  previous_position?: string;
  
  // Account Information
  username?: string;
  password?: string;
  bank_name?: string;
  bank_account_number?: string;
  bank_branch?: string;
  tax_id?: string;
  social_security_number?: string;
  
  // System
  is_active?: boolean;
  notes?: string;
  profile_photo_url?: string;
};

// Filters for list queries
export interface StaffFilters {
  search?: string;
  department_id?: number;
  role_id?: number;
  employment_status?: StaffStatus;
  employment_type?: EmploymentType;
  gender?: StaffGender;
  page?: number;
  limit?: number;
}

// Statistics for dashboard
export interface StaffStatistics {
  total_staff: number;
  active_staff: number;
  inactive_staff: number;
  on_leave: number;
  new_this_month: number;
  male_count: number;
  female_count: number;
  departments_count: number;
  roles_count: number;
  turnover_rate?: number;
  attendance_rate?: number;
}

// Paginated response
export interface StaffPaginatedResponse {
  staff: Staff[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// Dropdown options
export interface StaffOption {
  id: number;
  name: string;
  code?: string;
  color?: string;
}

// Default values for new staff
export const StaffDefaultValues: Partial<StaffFormValues> = {
  is_active: true,
  employment_status: 'active',
  employment_type: 'full_time',
  gender: 'male',
  marital_status: 'single',
  hire_date: new Date().toISOString().split('T')[0],
};

// Field metadata for dynamic forms
export const StaffMetadata = {
  resource: "staff",
  label: "Staff Member",
  pluralLabel: "Staff Members",
  sections: [
    {
      id: "personal",
      label: "Personal Information",
      icon: "user",
      fields: [
        { name: "title", label: "Title", uiType: "select", required: false, options: ["mr", "mrs", "ms", "miss", "dr", "prof", "rev"] },
        { name: "first_name", label: "First Name", uiType: "text", required: true },
        { name: "middle_name", label: "Middle Name", uiType: "text", required: false },
        { name: "last_name", label: "Last Name", uiType: "text", required: true },
        { name: "date_of_birth", label: "Date of Birth", uiType: "date", required: false },
        { name: "gender", label: "Gender", uiType: "select", required: false, options: ["male", "female", "other"] },
        { name: "national_id", label: "National ID", uiType: "text", required: false },
        { name: "passport_number", label: "Passport Number", uiType: "text", required: false },
        { name: "marital_status", label: "Marital Status", uiType: "select", required: false, options: ["single", "married", "divorced", "widowed", "separated"] },
        { name: "nationality", label: "Nationality", uiType: "text", required: false },
        { name: "religion", label: "Religion", uiType: "text", required: false },
        { name: "blood_group", label: "Blood Group", uiType: "select", required: false, options: ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"] },
      ]
    },
    {
      id: "contact",
      label: "Contact Information",
      icon: "mail",
      fields: [
        { name: "email", label: "Email Address", uiType: "email", required: true },
        { name: "phone", label: "Phone Number", uiType: "tel", required: true },
        { name: "alternate_phone", label: "Alternate Phone", uiType: "tel", required: false },
        { name: "address_line1", label: "Address Line 1", uiType: "text", required: false },
        { name: "address_line2", label: "Address Line 2", uiType: "text", required: false },
        { name: "city", label: "City", uiType: "text", required: false },
        { name: "state", label: "State", uiType: "text", required: false },
        { name: "postal_code", label: "Postal Code", uiType: "text", required: false },
        { name: "country", label: "Country", uiType: "text", required: false },
        { name: "emergency_contact_name", label: "Emergency Contact Name", uiType: "text", required: false },
        { name: "emergency_contact_phone", label: "Emergency Contact Phone", uiType: "tel", required: false },
        { name: "emergency_contact_relation", label: "Emergency Contact Relation", uiType: "text", required: false },
      ]
    },
    {
      id: "employment",
      label: "Employment Information",
      icon: "briefcase",
      fields: [
        { name: "employee_no", label: "Employee Number", uiType: "text", required: false },
        { name: "hire_date", label: "Hire Date", uiType: "date", required: true },
        { name: "employment_type", label: "Employment Type", uiType: "select", required: true, options: ["full_time", "part_time", "contract", "temporary", "intern", "consultant"] },
        { name: "department_id", label: "Department", uiType: "relation", relation: "departments", required: false },
        { name: "role_id", label: "Role", uiType: "relation", relation: "staffmgt_roles", required: false },
        { name: "designation", label: "Designation", uiType: "text", required: false },
        { name: "employment_status", label: "Employment Status", uiType: "select", required: true, options: ["active", "inactive", "suspended", "terminated", "on_leave"] },
        { name: "probation_end_date", label: "Probation End Date", uiType: "date", required: false },
        { name: "confirmation_date", label: "Confirmation Date", uiType: "date", required: false },
        { name: "contract_end_date", label: "Contract End Date", uiType: "date", required: false },
        { name: "supervisor_id", label: "Supervisor", uiType: "relation", relation: "staff", required: false },
        { name: "work_location", label: "Work Location", uiType: "text", required: false },
      ]
    },
    {
      id: "professional",
      label: "Professional Information",
      icon: "award",
      fields: [
        { name: "qualifications", label: "Qualifications", uiType: "textarea", required: false },
        { name: "experience_years", label: "Experience (Years)", uiType: "number", required: false },
        { name: "specialization", label: "Specialization", uiType: "text", required: false },
        { name: "joining_reason", label: "Reason for Joining", uiType: "textarea", required: false },
        { name: "previous_employer", label: "Previous Employer", uiType: "text", required: false },
        { name: "previous_position", label: "Previous Position", uiType: "text", required: false },
      ]
    },
    {
      id: "account",
      label: "Account & Financial Information",
      icon: "credit-card",
      fields: [
        { name: "username", label: "Username", uiType: "text", required: false },
        { name: "password", label: "Password", uiType: "password", required: false },
        { name: "bank_name", label: "Bank Name", uiType: "text", required: false },
        { name: "bank_account_number", label: "Bank Account Number", uiType: "text", required: false },
        { name: "bank_branch", label: "Bank Branch", uiType: "text", required: false },
        { name: "tax_id", label: "Tax ID", uiType: "text", required: false },
        { name: "social_security_number", label: "Social Security Number", uiType: "text", required: false },
      ]
    },
    {
      id: "system",
      label: "System Settings",
      icon: "settings",
      fields: [
        { name: "is_active", label: "Active", uiType: "boolean", required: true },
        { name: "notes", label: "Notes", uiType: "textarea", required: false },
        { name: "profile_photo_url", label: "Profile Photo URL", uiType: "text", required: false },
      ]
    }
  ]
};
