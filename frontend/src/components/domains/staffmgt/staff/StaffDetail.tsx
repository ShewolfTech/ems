import React, { useState } from "react";
import { X, User, Mail, Briefcase, Award, CreditCard, Calendar, MapPin, Phone, Building, FileText, AlertCircle, History } from "lucide-react";
import { StaffHistory } from "./StaffHistory.js";
import type { Staff } from "../../types.js";

interface StaffDetailProps {
  item: Staff;
  onClose: () => void;
}

type TabId = 'overview' | 'personal' | 'employment' | 'contact' | 'financial' | 'history';

const tabs: { id: TabId; label: string; icon: any }[] = [
  { id: 'overview', label: 'Overview', icon: User },
  { id: 'personal', label: 'Personal', icon: FileText },
  { id: 'employment', label: 'Employment', icon: Briefcase },
  { id: 'contact', label: 'Contact', icon: Mail },
  { id: 'financial', label: 'Financial', icon: CreditCard },
  { id: 'history', label: 'History', icon: History },
];

const InfoField = ({ label, value, icon }: { label: string; value?: string | number | null; icon?: any }) => {
  if (!value && value !== 0) return null;
  const IconComp = icon;
  return (
    <div className="space-y-1">
      <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">{label}</p>
      <div className="flex items-center gap-2">
        {IconComp && <IconComp className="w-4 h-4 text-teal-500" />}
        <p className="text-base font-semibold text-slate-800">{value}</p>
      </div>
    </div>
  );
};

const InfoCard = ({ title, icon: Icon, children }: { title: string; icon: any; children: React.ReactNode }) => (
  <div className="bg-gradient-to-br from-teal-50 to-cyan-50 rounded-xl p-6 border-2 border-teal-100">
    <div className="flex items-center gap-3 mb-4">
      <div className="p-2 bg-teal-500 rounded-lg">
        <Icon className="w-5 h-5 text-white" />
      </div>
      <h4 className="text-lg font-black text-teal-800">{title}</h4>
    </div>
    <div className="space-y-4">
      {children}
    </div>
  </div>
);

export function StaffDetail({ item, onClose }: StaffDetailProps) {
  const [activeTab, setActiveTab] = useState<TabId>('overview');

  const formatName = () => {
    const title = item.title ? `${item.title.toUpperCase()}. ` : "";
    const firstName = item.first_name || "";
    const lastName = item.last_name || "";
    return `${title}${firstName} ${lastName}`.trim() || "N/A";
  };

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return "N/A";
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  };

  const calculateYearsOfService = () => {
    if (!item.hire_date) return "N/A";
    const hire = new Date(item.hire_date);
    const now = new Date();
    const years = now.getFullYear() - hire.getFullYear();
    const months = now.getMonth() - hire.getMonth();
    const totalMonths = years * 12 + months;
    if (totalMonths < 12) return `${totalMonths} month${totalMonths !== 1 ? 's' : ''}`;
    const yrs = Math.floor(totalMonths / 12);
    const remMonths = totalMonths % 12;
    return remMonths > 0 ? `${yrs} year${yrs !== 1 ? 's' : ''}, ${remMonths} month${remMonths !== 1 ? 's' : ''}` : `${yrs} year${yrs !== 1 ? 's' : ''}`;
  };

  const getStatusBadge = () => {
    const status = item.employment_status || (item.is_active ? 'active' : 'inactive');
    const statusConfig: Record<string, { bg: string; text: string; label: string }> = {
      active: { bg: "bg-green-100", text: "text-green-800", label: "Active" },
      inactive: { bg: "bg-slate-100", text: "text-slate-600", label: "Inactive" },
      suspended: { bg: "bg-red-100", text: "text-red-800", label: "Suspended" },
      terminated: { bg: "bg-gray-100", text: "text-gray-800", label: "Terminated" },
      on_leave: { bg: "bg-orange-100", text: "text-orange-800", label: "On Leave" },
    };
    const config = statusConfig[status] || statusConfig.inactive;
    return (
      <span className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-bold ${config.bg} ${config.text}`}>
        <span className="w-2 h-2 rounded-full bg-current mr-2" />
        {config.label}
      </span>
    );
  };

  const getEmploymentTypeBadge = () => {
    const type = item.employment_type || 'full_time';
    const typeConfig: Record<string, { bg: string; text: string; label: string }> = {
      full_time: { bg: "bg-teal-100", text: "text-teal-800", label: "Full Time" },
      part_time: { bg: "bg-blue-100", text: "text-blue-800", label: "Part Time" },
      contract: { bg: "bg-purple-100", text: "text-purple-800", label: "Contract" },
      temporary: { bg: "bg-yellow-100", text: "text-yellow-800", label: "Temporary" },
      intern: { bg: "bg-cyan-100", text: "text-cyan-800", label: "Intern" },
      consultant: { bg: "bg-indigo-100", text: "text-indigo-800", label: "Consultant" },
    };
    const config = typeConfig[type] || typeConfig.full_time;
    return (
      <span className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-bold ${config.bg} ${config.text}`}>
        {config.label}
      </span>
    );
  };

  const renderOverview = () => (
    <div className="space-y-6">
      {/* Profile Header */}
      <div className="bg-gradient-to-r from-teal-500 to-cyan-500 rounded-2xl p-8 text-white">
        <div className="flex items-start gap-6">
          <div className="w-24 h-24 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center text-4xl font-black border-4 border-white/30">
            {(item.first_name?.[0] || item.last_name?.[0] || "S").toUpperCase()}
          </div>
          <div className="flex-1">
            <h2 className="text-3xl font-black mb-2">{formatName()}</h2>
            <div className="flex flex-wrap gap-3 mb-4">
              {item.employee_no && (
                <span className="px-3 py-1 bg-white/20 rounded-lg text-sm font-bold">
                  #{item.employee_no}
                </span>
              )}
              {getStatusBadge()}
              {getEmploymentTypeBadge()}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div>
                <p className="text-teal-100 text-xs font-bold uppercase tracking-wider">Department</p>
                <p className="font-bold">{item.department_name || "N/A"}</p>
              </div>
              <div>
                <p className="text-teal-100 text-xs font-bold uppercase tracking-wider">Role</p>
                <p className="font-bold">{item.role_name || "N/A"}</p>
              </div>
              <div>
                <p className="text-teal-100 text-xs font-bold uppercase tracking-wider">Years of Service</p>
                <p className="font-bold">{calculateYearsOfService()}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Info Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <InfoCard title="Contact Information" icon={Mail}>
          <InfoField label="Email" value={item.email} icon={Mail} />
          <InfoField label="Phone" value={item.phone} icon={Phone} />
          {item.alternate_phone && <InfoField label="Alternate Phone" value={item.alternate_phone} icon={Phone} />}
        </InfoCard>

        <InfoCard title="Location" icon={MapPin}>
          <InfoField label="Address" value={item.address_line1} icon={MapPin} />
          {item.city && <InfoField label="City" value={item.city} icon={MapPin} />}
          {item.country && <InfoField label="Country" value={item.country} icon={MapPin} />}
        </InfoCard>

        <InfoCard title="Employment" icon={Calendar}>
          <InfoField label="Hire Date" value={formatDate(item.hire_date)} icon={Calendar} />
          <InfoField label="Department" value={item.department_name} icon={Building} />
          <InfoField label="Designation" value={item.designation} icon={Award} />
        </InfoCard>
      </div>

      {/* Emergency Contact */}
      {item.emergency_contact_name && (
        <InfoCard title="Emergency Contact" icon={AlertCircle}>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <InfoField label="Name" value={item.emergency_contact_name} icon={User} />
            <InfoField label="Phone" value={item.emergency_contact_phone} icon={Phone} />
            <InfoField label="Relation" value={item.emergency_contact_relation} icon={User} />
          </div>
        </InfoCard>
      )}
    </div>
  );

  const renderPersonal = () => (
    <div className="space-y-6">
      <InfoCard title="Personal Information" icon={User}>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <InfoField label="Title" value={item.title?.toUpperCase()} />
          <InfoField label="First Name" value={item.first_name} />
          <InfoField label="Middle Name" value={item.middle_name} />
          <InfoField label="Last Name" value={item.last_name} />
          <InfoField label="Date of Birth" value={formatDate(item.date_of_birth)} />
          <InfoField label="Gender" value={item.gender?.replace('_', ' ')} />
          <InfoField label="National ID" value={item.national_id} />
          <InfoField label="Passport Number" value={item.passport_number} />
          <InfoField label="Marital Status" value={item.marital_status?.replace('_', ' ')} />
          <InfoField label="Nationality" value={item.nationality} />
          <InfoField label="Religion" value={item.religion} />
          <InfoField label="Blood Group" value={item.blood_group} />
        </div>
      </InfoCard>
    </div>
  );

  const renderEmployment = () => (
    <div className="space-y-6">
      <InfoCard title="Employment Details" icon={Briefcase}>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <InfoField label="Employee Number" value={item.employee_no} />
          <InfoField label="Hire Date" value={formatDate(item.hire_date)} />
          <InfoField label="Employment Type" value={item.employment_type?.replace('_', ' ')} />
          <InfoField label="Department" value={item.department_name} />
          <InfoField label="Role" value={item.role_name} />
          <InfoField label="Designation" value={item.designation} />
          <InfoField label="Employment Status" value={item.employment_status?.replace('_', ' ')} />
          <InfoField label="Probation End Date" value={formatDate(item.probation_end_date)} />
          <InfoField label="Confirmation Date" value={formatDate(item.confirmation_date)} />
          <InfoField label="Contract End Date" value={formatDate(item.contract_end_date)} />
          <InfoField label="Work Location" value={item.work_location} />
        </div>
      </InfoCard>

      {item.qualifications && (
        <InfoCard title="Professional Qualifications" icon={Award}>
          <div className="space-y-4">
            <InfoField label="Qualifications" value={item.qualifications} />
            <InfoField label="Experience (Years)" value={item.experience_years} />
            <InfoField label="Specialization" value={item.specialization} />
          </div>
        </InfoCard>
      )}

      {item.previous_employer && (
        <InfoCard title="Previous Employment" icon={Building}>
          <div className="space-y-4">
            <InfoField label="Previous Employer" value={item.previous_employer} />
            <InfoField label="Previous Position" value={item.previous_position} />
            <InfoField label="Reason for Joining" value={item.joining_reason} />
          </div>
        </InfoCard>
      )}
    </div>
  );

  const renderContact = () => (
    <div className="space-y-6">
      <InfoCard title="Contact Information" icon={Mail}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <InfoField label="Email Address" value={item.email} icon={Mail} />
          <InfoField label="Phone Number" value={item.phone} icon={Phone} />
          <InfoField label="Alternate Phone" value={item.alternate_phone} icon={Phone} />
          <InfoField label="Address Line 1" value={item.address_line1} icon={MapPin} />
          <InfoField label="Address Line 2" value={item.address_line2} icon={MapPin} />
          <InfoField label="City" value={item.city} icon={MapPin} />
          <InfoField label="State" value={item.state} icon={MapPin} />
          <InfoField label="Postal Code" value={item.postal_code} icon={MapPin} />
          <InfoField label="Country" value={item.country} icon={MapPin} />
        </div>
      </InfoCard>

      {item.emergency_contact_name && (
        <InfoCard title="Emergency Contact" icon={AlertCircle}>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <InfoField label="Contact Name" value={item.emergency_contact_name} icon={User} />
            <InfoField label="Contact Phone" value={item.emergency_contact_phone} icon={Phone} />
            <InfoField label="Relation" value={item.emergency_contact_relation} icon={User} />
          </div>
        </InfoCard>
      )}
    </div>
  );

  const renderFinancial = () => (
    <div className="space-y-6">
      <InfoCard title="Bank Information" icon={CreditCard}>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <InfoField label="Bank Name" value={item.bank_name} />
          <InfoField label="Account Number" value={item.bank_account_number} />
          <InfoField label="Bank Branch" value={item.bank_branch} />
        </div>
      </InfoCard>

      <InfoCard title="Tax & Social Security" icon={FileText}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <InfoField label="Tax ID" value={item.tax_id} />
          <InfoField label="Social Security Number" value={item.social_security_number} />
        </div>
      </InfoCard>
    </div>
  );

  const renderTabContent = () => {
    switch (activeTab) {
      case 'overview': return renderOverview();
      case 'personal': return renderPersonal();
      case 'employment': return renderEmployment();
      case 'contact': return renderContact();
      case 'financial': return renderFinancial();
      case 'history': return <StaffHistory staffId={item.id} />;
      default: return renderOverview();
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-2xl border border-teal-200 overflow-hidden max-h-[90vh] flex flex-col">
      {/* Sticky Header */}
      <div className="sticky top-0 z-40 p-6 border-b border-teal-200 bg-gradient-to-r from-teal-500 to-cyan-500">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-black text-white">Staff Member Details</h2>
            <p className="text-teal-100 text-sm mt-1">
              {formatName()} — {item.employee_no ? `#${item.employee_no}` : 'No Employee ID'}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/20 rounded-lg transition-all"
          >
            <X className="w-6 h-6 text-white" />
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="sticky top-[88px] z-30 bg-white border-b border-teal-200">
        <div className="flex overflow-x-auto">
          {tabs.map(tab => {
            const IconComp = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-6 py-4 font-bold text-sm whitespace-nowrap transition-all border-b-2 ${
                  isActive
                    ? 'border-teal-500 text-teal-600 bg-teal-50'
                    : 'border-transparent text-slate-600 hover:text-teal-600 hover:bg-teal-50'
                }`}
              >
                <IconComp className="w-4 h-4" />
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto p-6 bg-slate-50">
        {renderTabContent()}
      </div>
    </div>
  );
}

export default StaffDetail;
