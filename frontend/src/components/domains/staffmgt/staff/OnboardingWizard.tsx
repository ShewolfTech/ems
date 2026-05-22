import React, { useState, useEffect } from "react";
import { Button } from "@/components/domains/aacommon/index.js";
import {
  User, Mail, Phone, Calendar, MapPin, FileText, CreditCard,
  CheckCircle, Clock, AlertCircle, ChevronRight, ChevronLeft,
  Upload, Camera, Star, Award, BookOpen, Users, Zap
} from "lucide-react";
import type { StaffFormValues } from "@/domains/staffmgt/staff/types.js";
import { StaffDefaultValues } from "@/domains/staffmgt/staff/types.js";
import { saveStaff } from "@/domains/staffmgt/staff/services.js";

interface OnboardingWizardProps {
  onComplete: () => void;
  onCancel: () => void;
}

type OnboardingStep = 'welcome' | 'personal' | 'contact' | 'employment' | 'documents' | 'review';

export function OnboardingWizard({ onComplete, onCancel }: OnboardingWizardProps) {
  const [currentStep, setCurrentStep] = useState<OnboardingStep>('welcome');
  const [loading, setLoading] = useState(false);
  const [departments, setDepartments] = useState<any[]>([]);
  const [roles, setRoles] = useState<any[]>([]);
  const [progress, setProgress] = useState(0);

  const [formData, setFormData] = useState<StaffFormValues>({
    ...StaffDefaultValues,
  });

  const [documents, setDocuments] = useState({
    photo: null as File | null,
    idDocument: null as File | null,
    resume: null as File | null,
    contract: null as File | null,
  });

  useEffect(() => {
    loadMetadata();
  }, []);

  useEffect(() => {
    // Calculate progress based on current step
    const steps = ['welcome', 'personal', 'contact', 'employment', 'documents', 'review'];
    const currentIndex = steps.indexOf(currentStep);
    setProgress((currentIndex / (steps.length - 1)) * 100);
  }, [currentStep]);

  const loadMetadata = async () => {
    try {
      const [deptRes, roleRes] = await Promise.all([
        fetch("/api/staffmgt/departments").then(r => r.json()).catch(() => ({ data: [] })),
        fetch("/api/staffmgt/roles").then(r => r.json()).catch(() => ({ data: [] })),
      ]);
      setDepartments(Array.isArray(deptRes.data) ? deptRes.data : []);
      setRoles(Array.isArray(roleRes.data) ? roleRes.data : []);
    } catch (error) {
      console.error("Error loading metadata:", error);
    }
  };

  const handleChange = (field: keyof StaffFormValues, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleFileUpload = (type: keyof typeof documents, file: File) => {
    setDocuments(prev => ({ ...prev, [type]: file }));
  };

  const validateStep = (step: OnboardingStep): boolean => {
    switch (step) {
      case 'personal':
        return !!(formData.first_name && formData.last_name && formData.date_of_birth);
      case 'contact':
        return !!(formData.email && formData.phone);
      case 'employment':
        return !!(formData.hire_date && formData.department_id && formData.role_id);
      default:
        return true;
    }
  };

  const nextStep = () => {
    if (!validateStep(currentStep)) {
      alert("Please fill in all required fields before proceeding.");
      return;
    }

    const steps: OnboardingStep[] = ['welcome', 'personal', 'contact', 'employment', 'documents', 'review'];
    const currentIndex = steps.indexOf(currentStep);
    if (currentIndex < steps.length - 1) {
      setCurrentStep(steps[currentIndex + 1]);
    }
  };

  const prevStep = () => {
    const steps: OnboardingStep[] = ['welcome', 'personal', 'contact', 'employment', 'documents', 'review'];
    const currentIndex = steps.indexOf(currentStep);
    if (currentIndex > 0) {
      setCurrentStep(steps[currentIndex - 1]);
    }
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const payload = {
        ...formData,
        department_id: formData.department_id ? Number(formData.department_id) : undefined,
        role_id: formData.role_id ? Number(formData.role_id) : undefined,
        hire_date: formData.hire_date ? new Date(formData.hire_date) : undefined,
        date_of_birth: formData.date_of_birth ? new Date(formData.date_of_birth) : undefined,
      };

      await saveStaff(payload as any);
      onComplete();
    } catch (error: any) {
      console.error("Save failed:", error.message);
      alert(`Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const steps = [
    { id: 'welcome' as OnboardingStep, title: 'Welcome', icon: Star, required: false },
    { id: 'personal' as OnboardingStep, title: 'Personal Info', icon: User, required: true },
    { id: 'contact' as OnboardingStep, title: 'Contact Details', icon: Phone, required: true },
    { id: 'employment' as OnboardingStep, title: 'Employment', icon: Briefcase, required: true },
    { id: 'documents' as OnboardingStep, title: 'Documents', icon: FileText, required: false },
    { id: 'review' as OnboardingStep, title: 'Review & Submit', icon: CheckCircle, required: true },
  ];

  const renderStepContent = () => {
    switch (currentStep) {
      case 'welcome':
        return (
          <div className="text-center py-12">
            <div className="inline-block p-6 bg-gradient-to-r from-teal-100 to-cyan-100 rounded-3xl mb-8">
              <Users className="w-16 h-16 text-teal-600" />
            </div>
            <h2 className="text-3xl font-bold text-slate-800 mb-4">Welcome to Staff Onboarding</h2>
            <p className="text-lg text-slate-600 mb-8 max-w-2xl mx-auto">
              Let's get you set up with our comprehensive staff management system.
              We'll guide you through each step to ensure all information is collected accurately.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
                <User className="w-8 h-8 text-teal-600 mx-auto mb-3" />
                <h3 className="font-bold text-slate-800 mb-2">Personal Details</h3>
                <p className="text-sm text-slate-600">Basic information and identification</p>
              </div>
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
                <Briefcase className="w-8 h-8 text-cyan-600 mx-auto mb-3" />
                <h3 className="font-bold text-slate-800 mb-2">Employment Setup</h3>
                <p className="text-sm text-slate-600">Role, department, and hire details</p>
              </div>
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
                <Award className="w-8 h-8 text-blue-600 mx-auto mb-3" />
                <h3 className="font-bold text-slate-800 mb-2">Complete Profile</h3>
                <p className="text-sm text-slate-600">Documents and final verification</p>
              </div>
            </div>
          </div>
        );

      case 'personal':
        return (
          <div className="space-y-8">
            <div className="text-center">
              <h3 className="text-2xl font-bold text-slate-800 mb-2">Personal Information</h3>
              <p className="text-slate-600">Tell us about the new team member</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  First Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.first_name || ""}
                  onChange={(e) => handleChange("first_name", e.target.value)}
                  className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Last Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.last_name || ""}
                  onChange={(e) => handleChange("last_name", e.target.value)}
                  className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Date of Birth <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  value={formData.date_of_birth || ""}
                  onChange={(e) => handleChange("date_of_birth", e.target.value)}
                  className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Gender</label>
                <select
                  value={formData.gender || ""}
                  onChange={(e) => handleChange("gender", e.target.value)}
                  className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent bg-white"
                >
                  <option value="">Select Gender</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-slate-700 mb-2">National ID</label>
                <input
                  type="text"
                  value={formData.national_id || ""}
                  onChange={(e) => handleChange("national_id", e.target.value)}
                  className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                  placeholder="Enter national ID number"
                />
              </div>
            </div>
          </div>
        );

      case 'contact':
        return (
          <div className="space-y-8">
            <div className="text-center">
              <h3 className="text-2xl font-bold text-slate-800 mb-2">Contact Information</h3>
              <p className="text-slate-600">How can we reach the new team member?</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  <Mail className="w-4 h-4 inline mr-2" />
                  Email Address <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  value={formData.email || ""}
                  onChange={(e) => handleChange("email", e.target.value)}
                  className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  <Phone className="w-4 h-4 inline mr-2" />
                  Phone Number <span className="text-red-500">*</span>
                </label>
                <input
                  type="tel"
                  value={formData.phone || ""}
                  onChange={(e) => handleChange("phone", e.target.value)}
                  className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                  required
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  <MapPin className="w-4 h-4 inline mr-2" />
                  Address
                </label>
                <input
                  type="text"
                  value={formData.address_line1 || ""}
                  onChange={(e) => handleChange("address_line1", e.target.value)}
                  className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                  placeholder="Street address"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">City</label>
                <input
                  type="text"
                  value={formData.city || ""}
                  onChange={(e) => handleChange("city", e.target.value)}
                  className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Nationality</label>
                <input
                  type="text"
                  value={formData.nationality || ""}
                  onChange={(e) => handleChange("nationality", e.target.value)}
                  className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>
        );

      case 'employment':
        return (
          <div className="space-y-8">
            <div className="text-center">
              <h3 className="text-2xl font-bold text-slate-800 mb-2">Employment Details</h3>
              <p className="text-slate-600">Set up their role and position in the organization</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  <Calendar className="w-4 h-4 inline mr-2" />
                  Hire Date <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  value={formData.hire_date || ""}
                  onChange={(e) => handleChange("hire_date", e.target.value)}
                  className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  <Briefcase className="w-4 h-4 inline mr-2" />
                  Department <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.department_id || ""}
                  onChange={(e) => handleChange("department_id", e.target.value)}
                  className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent bg-white"
                  required
                >
                  <option value="">Select Department</option>
                  {departments.map((dept) => (
                    <option key={dept.id} value={dept.id}>{dept.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  <Briefcase className="w-4 h-4 inline mr-2" />
                  Role <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.role_id || ""}
                  onChange={(e) => handleChange("role_id", e.target.value)}
                  className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent bg-white"
                  required
                >
                  <option value="">Select Role</option>
                  {roles.map((role) => (
                    <option key={role.id} value={role.id}>{role.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Employment Type</label>
                <select
                  value={formData.employment_type || ""}
                  onChange={(e) => handleChange("employment_type", e.target.value)}
                  className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent bg-white"
                >
                  <option value="full_time">Full Time</option>
                  <option value="part_time">Part Time</option>
                  <option value="contract">Contract</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Employee Number</label>
                <input
                  type="text"
                  value={formData.employee_no || ""}
                  onChange={(e) => handleChange("employee_no", e.target.value)}
                  className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                  placeholder="Auto-generated if empty"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Experience (Years)</label>
                <input
                  type="number"
                  value={formData.experience_years || ""}
                  onChange={(e) => handleChange("experience_years", e.target.value)}
                  className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                  min="0"
                  step="0.5"
                />
              </div>
            </div>
          </div>
        );

      case 'documents':
        return (
          <div className="space-y-8">
            <div className="text-center">
              <h3 className="text-2xl font-bold text-slate-800 mb-2">Document Upload</h3>
              <p className="text-slate-600">Upload necessary documents for the employee record</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
              <div className="border-2 border-dashed border-slate-300 rounded-xl p-6 text-center hover:border-teal-400 transition-colors">
                <Camera className="w-12 h-12 text-slate-400 mx-auto mb-4" />
                <h4 className="font-bold text-slate-800 mb-2">Profile Photo</h4>
                <p className="text-sm text-slate-600 mb-4">Upload a professional headshot</p>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => e.target.files?.[0] && handleFileUpload('photo', e.target.files[0])}
                  className="hidden"
                  id="photo-upload"
                />
                <label
                  htmlFor="photo-upload"
                  className="inline-block px-4 py-2 bg-teal-100 text-teal-700 rounded-lg cursor-pointer hover:bg-teal-200 transition-colors"
                >
                  Choose File
                </label>
                {documents.photo && (
                  <p className="text-sm text-green-600 mt-2">{documents.photo.name}</p>
                )}
              </div>

              <div className="border-2 border-dashed border-slate-300 rounded-xl p-6 text-center hover:border-teal-400 transition-colors">
                <FileText className="w-12 h-12 text-slate-400 mx-auto mb-4" />
                <h4 className="font-bold text-slate-800 mb-2">ID Document</h4>
                <p className="text-sm text-slate-600 mb-4">National ID or passport copy</p>
                <input
                  type="file"
                  accept=".pdf,.jpg,.jpeg,.png"
                  onChange={(e) => e.target.files?.[0] && handleFileUpload('idDocument', e.target.files[0])}
                  className="hidden"
                  id="id-upload"
                />
                <label
                  htmlFor="id-upload"
                  className="inline-block px-4 py-2 bg-teal-100 text-teal-700 rounded-lg cursor-pointer hover:bg-teal-200 transition-colors"
                >
                  Choose File
                </label>
                {documents.idDocument && (
                  <p className="text-sm text-green-600 mt-2">{documents.idDocument.name}</p>
                )}
              </div>

              <div className="border-2 border-dashed border-slate-300 rounded-xl p-6 text-center hover:border-teal-400 transition-colors">
                <FileText className="w-12 h-12 text-slate-400 mx-auto mb-4" />
                <h4 className="font-bold text-slate-800 mb-2">Resume/CV</h4>
                <p className="text-sm text-slate-600 mb-4">Professional resume or CV</p>
                <input
                  type="file"
                  accept=".pdf,.doc,.docx"
                  onChange={(e) => e.target.files?.[0] && handleFileUpload('resume', e.target.files[0])}
                  className="hidden"
                  id="resume-upload"
                />
                <label
                  htmlFor="resume-upload"
                  className="inline-block px-4 py-2 bg-teal-100 text-teal-700 rounded-lg cursor-pointer hover:bg-teal-200 transition-colors"
                >
                  Choose File
                </label>
                {documents.resume && (
                  <p className="text-sm text-green-600 mt-2">{documents.resume.name}</p>
                )}
              </div>

              <div className="border-2 border-dashed border-slate-300 rounded-xl p-6 text-center hover:border-teal-400 transition-colors">
                <FileText className="w-12 h-12 text-slate-400 mx-auto mb-4" />
                <h4 className="font-bold text-slate-800 mb-2">Employment Contract</h4>
                <p className="text-sm text-slate-600 mb-4">Signed employment contract</p>
                <input
                  type="file"
                  accept=".pdf,.doc,.docx"
                  onChange={(e) => e.target.files?.[0] && handleFileUpload('contract', e.target.files[0])}
                  className="hidden"
                  id="contract-upload"
                />
                <label
                  htmlFor="contract-upload"
                  className="inline-block px-4 py-2 bg-teal-100 text-teal-700 rounded-lg cursor-pointer hover:bg-teal-200 transition-colors"
                >
                  Choose File
                </label>
                {documents.contract && (
                  <p className="text-sm text-green-600 mt-2">{documents.contract.name}</p>
                )}
              </div>
            </div>
          </div>
        );

      case 'review':
        return (
          <div className="space-y-8">
            <div className="text-center">
              <h3 className="text-2xl font-bold text-slate-800 mb-2">Review & Submit</h3>
              <p className="text-slate-600">Please review all information before submitting</p>
            </div>

            <div className="max-w-4xl mx-auto space-y-6">
              <div className="bg-slate-50 rounded-2xl p-6">
                <h4 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
                  <User className="w-5 h-5 text-teal-600" />
                  Personal Information
                </h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div><span className="font-medium">Name:</span> {formData.first_name} {formData.last_name}</div>
                  <div><span className="font-medium">Date of Birth:</span> {formData.date_of_birth}</div>
                  <div><span className="font-medium">Gender:</span> {formData.gender}</div>
                  <div><span className="font-medium">National ID:</span> {formData.national_id}</div>
                </div>
              </div>

              <div className="bg-slate-50 rounded-2xl p-6">
                <h4 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
                  <Phone className="w-5 h-5 text-cyan-600" />
                  Contact Information
                </h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div><span className="font-medium">Email:</span> {formData.email}</div>
                  <div><span className="font-medium">Phone:</span> {formData.phone}</div>
                  <div><span className="font-medium">Address:</span> {formData.address_line1}</div>
                  <div><span className="font-medium">City:</span> {formData.city}</div>
                </div>
              </div>

              <div className="bg-slate-50 rounded-2xl p-6">
                <h4 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
                  <Briefcase className="w-5 h-5 text-blue-600" />
                  Employment Details
                </h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div><span className="font-medium">Hire Date:</span> {formData.hire_date}</div>
                  <div><span className="font-medium">Department:</span> {departments.find(d => d.id == formData.department_id)?.name}</div>
                  <div><span className="font-medium">Role:</span> {roles.find(r => r.id == formData.role_id)?.name}</div>
                  <div><span className="font-medium">Employment Type:</span> {formData.employment_type}</div>
                </div>
              </div>

              <div className="bg-green-50 border border-green-200 rounded-2xl p-6">
                <div className="flex items-center gap-3 mb-4">
                  <CheckCircle className="w-6 h-6 text-green-600" />
                  <h4 className="font-bold text-green-800">Ready to Submit</h4>
                </div>
                <p className="text-green-700 text-sm">
                  All required information has been provided. Click "Complete Onboarding" to create the staff record.
                </p>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-3xl shadow-2xl max-w-6xl w-full max-h-[90vh] flex flex-col">
        {/* Progress Bar */}
        <div className="px-8 pt-8">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-2xl font-bold text-slate-800">Staff Onboarding</h1>
            <button onClick={onCancel} className="p-2 hover:bg-slate-100 rounded-lg transition-colors">
              <AlertCircle className="w-6 h-6 text-slate-400" />
            </button>
          </div>

          <div className="w-full bg-slate-200 rounded-full h-2 mb-6">
            <div
              className="bg-gradient-to-r from-teal-500 to-cyan-500 h-2 rounded-full transition-all duration-500"
              style={{ width: `${progress}%` }}
            ></div>
          </div>

          {/* Step Indicators */}
          <div className="flex items-center justify-between mb-8">
            {steps.map((step, index) => {
              const isCompleted = steps.findIndex(s => s.id === currentStep) > index;
              const isCurrent = step.id === currentStep;

              return (
                <div key={step.id} className="flex items-center">
                  <div className={`flex items-center justify-center w-10 h-10 rounded-full border-2 transition-all ${
                    isCompleted
                      ? 'bg-green-500 border-green-500 text-white'
                      : isCurrent
                      ? 'bg-teal-500 border-teal-500 text-white'
                      : 'bg-white border-slate-300 text-slate-400'
                  }`}>
                    {isCompleted ? (
                      <CheckCircle className="w-5 h-5" />
                    ) : (
                      <step.icon className="w-5 h-5" />
                    )}
                  </div>
                  <span className={`ml-3 text-sm font-medium ${
                    isCurrent ? 'text-teal-600' : isCompleted ? 'text-green-600' : 'text-slate-400'
                  }`}>
                    {step.title}
                  </span>
                  {index < steps.length - 1 && (
                    <div className={`w-12 h-0.5 mx-4 ${
                      isCompleted ? 'bg-green-500' : 'bg-slate-300'
                    }`} />
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-8">
          {renderStepContent()}
        </div>

        {/* Footer */}
        <div className="px-8 py-6 border-t border-slate-200 flex justify-between items-center">
          <Button
            onClick={prevStep}
            disabled={currentStep === 'welcome'}
            className="px-6 py-2.5 border border-slate-300 text-slate-700 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ChevronLeft className="w-4 h-4 mr-2" />
            Previous
          </Button>

          <div className="text-sm text-slate-500">
            Step {steps.findIndex(s => s.id === currentStep) + 1} of {steps.length}
          </div>

          {currentStep === 'review' ? (
            <Button
              onClick={handleSubmit}
              disabled={loading}
              className="px-6 py-2.5 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white font-bold shadow-lg"
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Creating...
                </span>
              ) : (
                <>
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Complete Onboarding
                </>
              )}
            </Button>
          ) : (
            <Button
              onClick={nextStep}
              className="px-6 py-2.5 bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600 text-white font-bold shadow-lg"
            >
              Next
              <ChevronRight className="w-4 h-4 ml-2" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

export default OnboardingWizard;