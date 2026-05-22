import React, { useState, useEffect } from 'react';
import {
  getApplicationById,
  saveApplication,
  getAdmissionStatuses,
  getApplicationTypes,
  getApplicantsList,
  saveApplicant
} from '@/domains/admissions/applications/controller.js';

interface ApplicationFormProps {
  applicationId?: number;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export const ApplicationForm: React.FC<ApplicationFormProps> = ({ applicationId, onSuccess, onCancel }) => {
  const [loading, setLoading] = useState(false);
  const [statuses, setStatuses] = useState<any[]>([]);
  const [types, setTypes] = useState<any[]>([]);
  const [applicants, setApplicants] = useState<any[]>([]);
  const [showNewApplicant, setShowNewApplicant] = useState(false);
  const [searchApplicant, setSearchApplicant] = useState('');
  const [creatingApplicant, setCreatingApplicant] = useState(false);
  const [showApplicantDropdown, setShowApplicantDropdown] = useState(false);
  const [isLoadingApplicants, setIsLoadingApplicants] = useState(false);
  const [applicantSuccessMessage, setApplicantSuccessMessage] = useState('');

  const [formData, setFormData] = useState({
    applicant_id: undefined as number | undefined,
    application_type_id: undefined as number | undefined,
    admission_status_id: undefined as number | undefined,
    assigned_to: undefined as number | undefined,
    applying_for_grade: '',
    applying_for_stream: '',
    academic_year: new Date().getFullYear().toString(),
    intended_start_date: '',
    interview_required: false,
    interview_type: '',
    interview_notes: '',
  });

  // Staff list for assignment
  const [staffList, setStaffList] = useState<any[]>([]);

  // New applicant form data
  const [newApplicant, setNewApplicant] = useState({
    first_name: '',
    last_name: '',
    middle_name: '',
    email: '',
    phone: '',
    date_of_birth: '',
    gender: '',
    nationality: 'Ugandan',
    address: '',
    city: '',
    district: '',
    guardian_name: '',
    guardian_phone: '',
    guardian_email: '',
    guardian_relationship: '',
    previous_school: '',
    previous_grade: '',
  });

  // Debounced search for applicants
  useEffect(() => {
    const timer = setTimeout(async () => {
      if (searchApplicant.length >= 2) {
        setIsLoadingApplicants(true);
        try {
          const result = await getApplicantsList({ search: searchApplicant, limit: 20 });
          if (result.success) {
            setApplicants(result.data?.data || []);
          }
        } catch (error) {
          console.error('Error searching applicants:', error);
        } finally {
          setIsLoadingApplicants(false);
        }
      } else if (searchApplicant.length === 0) {
        // Load recent applicants when search is cleared
        const result = await getApplicantsList({ limit: 10 });
        if (result.success) {
          setApplicants(result.data?.data || []);
        }
      }
    }, 300); // 300ms debounce

    return () => clearTimeout(timer);
  }, [searchApplicant]);

  // Load initial data
  useEffect(() => {
    const loadData = async () => {
      try {
        const [statusesRes, typesRes] = await Promise.all([
          getAdmissionStatuses(),
          getApplicationTypes(),
        ]);

        if (statusesRes.success) {
          setStatuses(statusesRes.data || []);
          // Set default status to "Applied" for new applications
          if (!applicationId) {
            const appliedStatus = statusesRes.data?.find((s: any) => s.code === 'APPLIED');
            if (appliedStatus) {
              setFormData(prev => ({ ...prev, admission_status_id: appliedStatus.id }));
            }
          }
        }
        if (typesRes.success) setTypes(typesRes.data || []);

        // Load users list for assignment (since staff table might be empty)
        try {
          console.log('👥 Loading users list for assignment...');
          const usersModule = await import('@/domains/profiles/users/controller.js');
          const usersRes = await usersModule.loadUsersList({ limit: 100 });
          console.log('👥 Users response:', usersRes);
          if (usersRes.success) {
            // Filter to show only active users
            const activeUsers = (usersRes.data?.data || []).filter((u: any) => u.is_active !== false);
            console.log('👥 Active users:', activeUsers);
            setStaffList(activeUsers);
          } else {
            console.warn('⚠️ Users response not successful:', usersRes);
          }
        } catch (e) {
          console.error('❌ Could not load users list', e);
        }

        // Load applicants
        const applicantsRes = await getApplicantsList({ limit: 10 });
        if (applicantsRes.success) {
          setApplicants(applicantsRes.data?.data || []);
        }

        if (applicationId) {
          const appRes = await getApplicationById(applicationId);
          if (appRes.success) {
            const data = appRes.data;
            setFormData({
              applicant_id: data.applicant_id,
              application_type_id: data.application_type_id,
              admission_status_id: data.admission_status_id,
              assigned_to: data.assigned_to,
              applying_for_grade: data.applying_for_grade || '',
              applying_for_stream: data.applying_for_stream || '',
              academic_year: data.academic_year || new Date().getFullYear().toString(),
              intended_start_date: data.intended_start_date ? new Date(data.intended_start_date).toISOString().split('T')[0] : '',
              interview_required: false,
              interview_type: '',
              interview_notes: '',
            });
          }
        }
      } catch (error) {
        console.error('Error loading data:', error);
      }
    };

    loadData();
  }, [applicationId]);

  const filteredApplicants = applicants.filter((a: any) => {
    if (!searchApplicant) return true;
    const search = searchApplicant.toLowerCase();
    return (
      a.first_name?.toLowerCase().includes(search) ||
      a.last_name?.toLowerCase().includes(search) ||
      a.email?.toLowerCase().includes(search)
    );
  });

  const handleCreateApplicant = async () => {
    // Validate required fields
    if (!newApplicant.first_name?.trim() || !newApplicant.last_name?.trim()) {
      alert('⚠️ First name and last name are required');
      return;
    }

    if (creatingApplicant) {
      console.log('⏳ Already creating, please wait...');
      return;
    }

    setCreatingApplicant(true);

    try {
      console.log('📤 Creating applicant:', newApplicant);
      
      // Call the API
      const result = await saveApplicant(newApplicant);
      
      console.log('📥 API Response:', result);
      
      // Check if we got a valid response with an ID
      const applicantId = result?.data?.data?.id || result?.data?.id;
      
      if (applicantId) {
        const applicantName = `${newApplicant.first_name} ${newApplicant.last_name}`;
        
        console.log('✅ Applicant created with ID:', applicantId);
        
        // Show success message
        setApplicantSuccessMessage(`✅ ${applicantName} created successfully! Now selected for this application.`);
        
        // CRITICAL: Auto-select the created applicant in the application form
        setFormData(prev => ({ 
          ...prev, 
          applicant_id: applicantId 
        }));
        
        // Update the search box to show the selected applicant
        setSearchApplicant(`${applicantName}`);
        
        // Close the new applicant popup
        setShowNewApplicant(false);
        
        // Clear the new applicant form for next use
        setNewApplicant({
          first_name: '',
          last_name: '',
          middle_name: '',
          email: '',
          phone: '',
          date_of_birth: '',
          gender: '',
          nationality: 'Ugandan',
          address: '',
          city: '',
          district: '',
          guardian_name: '',
          guardian_phone: '',
          guardian_email: '',
          guardian_relationship: '',
          previous_school: '',
          previous_grade: '',
        });
        
        // Refresh the applicants list
        try {
          const list = await getApplicantsList({ limit: 20 });
          if (list?.success && list?.data?.data) {
            setApplicants(list.data.data);
          }
        } catch (e) {
          console.warn('Could not refresh applicants list', e);
        }
        
        // Auto-hide success message after 5 seconds
        setTimeout(() => setApplicantSuccessMessage(''), 5000);
        
      } else {
        // No ID returned - this shouldn't happen
        console.error('❌ No applicant ID in response:', result);
        alert('⚠️ Applicant was created but there was an issue processing the response. Please search for the applicant and select them manually.');
      }
      
    } catch (error: any) {
      // Error occurred
      console.error('❌ Error creating applicant:', error);
      console.error('❌ Error details:', error?.response?.data);
      
      // Check if it's actually a success but response format issue
      if (error?.response?.data?.data?.id) {
        console.log('⚠️ Applicant was created but response format was unexpected');
        alert('✅ Applicant created! There was a display issue but the record was saved. Please search for the applicant to select them.');
      } else {
        alert('❌ Error creating applicant: ' + (error?.response?.data?.message || error?.message || 'Unknown error'));
      }
    } finally {
      setCreatingApplicant(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    console.log('📤 Submitting application with data:', formData);

    try {
      // Don't send interview fields to backend - they're not in the applications table
      const { interview_required, interview_type, interview_notes, ...applicationData } = formData;
      
      const result = await saveApplication(applicationData);
      
      console.log('📥 Application saved:', result);

      // If interview is required, create interview record separately
      if (formData.interview_required && result.data?.id) {
        try {
          const interviewData = {
            application_id: result.data.id,
            interview_type: formData.interview_type || 'general',
            interview_notes: formData.interview_notes,
            is_completed: false,
          };
          
          const { saveInterview } = await import('@/components/domains/admissions/interviews/controller.js');
          await saveInterview(interviewData);
          
          console.log('✅ Interview record created automatically');
        } catch (interviewError) {
          console.warn('⚠️ Interview not created:', interviewError);
          // Don't fail the application submission if interview creation fails
        }
      }

      if (applicationId) {
        alert('✅ Application updated successfully!\n\nThe admissions team has been notified of the changes.');
      } else {
        const appNo = result.data?.application_no || result.data?.id;
        let message = `✅ Application submitted successfully!\n\n📋 Application Reference: ${appNo}`;
        
        if (formData.interview_required) {
          message += '\n\n📝 Interview will be scheduled by the admissions team.';
        }
        
        message += '\n\n📧 The admissions team will review your application and contact you soon.';
        
        alert(message);
      }

      onSuccess?.();
    } catch (error: any) {
      console.error('❌ Save application error:', error);
      alert(error.response?.data?.message || 'Failed to save application');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">
          {applicationId ? 'Edit Application' : 'New Application'}
        </h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Applicant <span className="text-red-500">*</span>
            </label>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <input
                  type="text"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Search by name or email..."
                  value={searchApplicant}
                  onChange={(e) => {
                    setSearchApplicant(e.target.value);
                    setShowApplicantDropdown(true);
                  }}
                  onFocus={() => setShowApplicantDropdown(true)}
                />
                {isLoadingApplicants && (
                  <div className="absolute right-2 top-2 text-gray-400">⏳</div>
                )}
              </div>
              <button
                type="button"
                onClick={() => setShowNewApplicant(!showNewApplicant)}
                className="px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm whitespace-nowrap"
              >
                {showNewApplicant ? 'Cancel' : '+ New Applicant'}
              </button>
            </div>
            
            {/* Applicant Search Results Dropdown */}
            {showApplicantDropdown && searchApplicant.length > 0 && (
              <div className="relative mt-1">
                <div className="absolute z-10 w-full bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-y-auto">
                  {applicants.length > 0 ? (
                    applicants.map((applicant) => (
                      <div
                        key={applicant.id}
                        className="px-4 py-2 hover:bg-blue-50 cursor-pointer"
                        onClick={() => {
                          setFormData({ ...formData, applicant_id: applicant.id });
                          setSearchApplicant(`${applicant.first_name} ${applicant.last_name}`);
                          setShowApplicantDropdown(false);
                        }}
                      >
                        <div className="font-medium">{applicant.first_name} {applicant.last_name}</div>
                        <div className="text-sm text-gray-500">
                          {applicant.email} {applicant.phone && `• ${applicant.phone}`}
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="px-4 py-3 text-gray-500 text-sm">
                      No applicants found. Click "+ New Applicant" to create one.
                    </div>
                  )}
                </div>
                <div className="fixed inset-0 z-0" onClick={() => setShowApplicantDropdown(false)} />
              </div>
            )}
            
            {/* New Applicant Form */}
            {showNewApplicant && (
              <div className="mt-4 p-4 border border-blue-200 rounded-md bg-blue-50 space-y-4">
                <div className="flex justify-between items-center">
                  <h4 className="font-medium text-blue-900 text-lg">📝 New Applicant Information</h4>
                  <button
                    type="button"
                    onClick={() => {
                      setShowNewApplicant(false);
                      setNewApplicant({
                        first_name: '',
                        last_name: '',
                        middle_name: '',
                        email: '',
                        phone: '',
                        date_of_birth: '',
                        gender: '',
                        nationality: 'Ugandan',
                        address: '',
                        city: '',
                        district: '',
                        guardian_name: '',
                        guardian_phone: '',
                        guardian_email: '',
                        guardian_relationship: '',
                        previous_school: '',
                        previous_grade: '',
                      });
                    }}
                    className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                  >
                    ✕ Close
                  </button>
                </div>
                
                {/* Success Message */}
                {applicantSuccessMessage && (
                  <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded">
                    {applicantSuccessMessage}
                  </div>
                )}
                
                {/* Personal Information */}
                <div>
                  <h5 className="font-medium text-gray-700 mb-3">👤 Personal Information</h5>
                  <div className="grid grid-cols-3 gap-3">
                    <input
                      type="text"
                      placeholder="First Name *"
                      className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                      value={newApplicant.first_name}
                      onChange={(e) => setNewApplicant({ ...newApplicant, first_name: e.target.value })}
                    />
                    <input
                      type="text"
                      placeholder="Middle Name"
                      className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                      value={newApplicant.middle_name}
                      onChange={(e) => setNewApplicant({ ...newApplicant, middle_name: e.target.value })}
                    />
                    <input
                      type="text"
                      placeholder="Last Name *"
                      className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                      value={newApplicant.last_name}
                      onChange={(e) => setNewApplicant({ ...newApplicant, last_name: e.target.value })}
                    />
                    <input
                      type="email"
                      placeholder="Email"
                      className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                      value={newApplicant.email}
                      onChange={(e) => setNewApplicant({ ...newApplicant, email: e.target.value })}
                    />
                    <input
                      type="tel"
                      placeholder="Phone"
                      className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                      value={newApplicant.phone}
                      onChange={(e) => setNewApplicant({ ...newApplicant, phone: e.target.value })}
                    />
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Date of Birth *
                      </label>
                      <input
                        type="date"
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                        value={newApplicant.date_of_birth}
                        onChange={(e) => setNewApplicant({ ...newApplicant, date_of_birth: e.target.value })}
                      />
                    </div>
                    <select
                      className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                      value={newApplicant.gender}
                      onChange={(e) => setNewApplicant({ ...newApplicant, gender: e.target.value })}
                    >
                      <option value="">Select Gender *</option>
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Other">Other</option>
                    </select>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Nationality
                      </label>
                      <input
                        type="text"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                        value={newApplicant.nationality}
                        onChange={(e) => setNewApplicant({ ...newApplicant, nationality: e.target.value })}
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-3 mt-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Address
                      </label>
                      <input
                        type="text"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                        value={newApplicant.address}
                        onChange={(e) => setNewApplicant({ ...newApplicant, address: e.target.value })}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        City
                      </label>
                      <input
                        type="text"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                        value={newApplicant.city}
                        onChange={(e) => setNewApplicant({ ...newApplicant, city: e.target.value })}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        District
                      </label>
                      <input
                        type="text"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                        value={newApplicant.district}
                        onChange={(e) => setNewApplicant({ ...newApplicant, district: e.target.value })}
                      />
                    </div>
                  </div>
                </div>
                
                {/* Guardian Information */}
                <div>
                  <h5 className="font-medium text-gray-700 mb-3">👨‍👩‍👧 Guardian/Parent Information</h5>
                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Guardian Name *
                      </label>
                      <input
                        type="text"
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                        value={newApplicant.guardian_name}
                        onChange={(e) => setNewApplicant({ ...newApplicant, guardian_name: e.target.value })}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Guardian Phone *
                      </label>
                      <input
                        type="tel"
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                        value={newApplicant.guardian_phone}
                        onChange={(e) => setNewApplicant({ ...newApplicant, guardian_phone: e.target.value })}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Guardian Email
                      </label>
                      <input
                        type="email"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                        value={newApplicant.guardian_email}
                        onChange={(e) => setNewApplicant({ ...newApplicant, guardian_email: e.target.value })}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Relationship *
                      </label>
                      <input
                        type="text"
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                        value={newApplicant.guardian_relationship}
                        onChange={(e) => setNewApplicant({ ...newApplicant, guardian_relationship: e.target.value })}
                      />
                    </div>
                  </div>
                </div>

                {/* Previous School (if applicable) */}
                <div>
                  <h5 className="font-medium text-gray-700 mb-3">🏫 Previous School (Optional)</h5>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Previous School Name
                      </label>
                      <input
                        type="text"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                        value={newApplicant.previous_school}
                        onChange={(e) => setNewApplicant({ ...newApplicant, previous_school: e.target.value })}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Last Grade Attended
                      </label>
                      <input
                        type="text"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                        value={newApplicant.previous_grade}
                        onChange={(e) => setNewApplicant({ ...newApplicant, previous_grade: e.target.value })}
                      />
                    </div>
                  </div>
                </div>
                
                {/* Action Buttons */}
                <div className="flex gap-3 pt-4 border-t border-blue-200">
                  <button
                    type="button"
                    onClick={handleCreateApplicant}
                    disabled={creatingApplicant || !newApplicant.first_name || !newApplicant.last_name}
                    className="flex-1 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed font-medium"
                  >
                    {creatingApplicant ? '⏳ Creating...' : '✅ Create Applicant'}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowNewApplicant(false);
                      setNewApplicant({
                        first_name: '',
                        last_name: '',
                        middle_name: '',
                        email: '',
                        phone: '',
                        date_of_birth: '',
                        gender: '',
                        nationality: 'Ugandan',
                        address: '',
                        city: '',
                        district: '',
                        guardian_name: '',
                        guardian_phone: '',
                        guardian_email: '',
                        guardian_relationship: '',
                        previous_school: '',
                        previous_grade: '',
                      });
                    }}
                    className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 font-medium"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
            
            {formData.applicant_id && (
              <div className="mt-2 text-sm text-green-600">
                ✅ Selected: {applicants.find(a => a.id === formData.applicant_id)?.first_name} {applicants.find(a => a.id === formData.applicant_id)?.last_name}
              </div>
            )}
            
            <p className="text-xs text-gray-500 mt-1">
              💡 Type to search (min 2 characters) or click "+ New Applicant" to create
            </p>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Application Type
            </label>
            <select
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={formData.application_type_id || ''}
              onChange={(e) => setFormData({ ...formData, application_type_id: Number(e.target.value) || undefined })}
            >
              <option value="">Select Type</option>
              {types.map((type) => (
                <option key={type.id} value={type.id}>{type.name}</option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Admission Status
            </label>
            <select
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={formData.admission_status_id || ''}
              onChange={(e) => setFormData({ ...formData, admission_status_id: Number(e.target.value) || undefined })}
            >
              <option value="">Select Status</option>
              {statuses.map((status) => (
                <option key={status.id} value={status.id}>{status.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Assigned To
            </label>
            <select
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={formData.assigned_to || ''}
              onChange={(e) => setFormData({ ...formData, assigned_to: Number(e.target.value) || undefined })}
            >
              <option value="">Unassigned</option>
              {staffList.map((staff) => (
                <option key={staff.id} value={staff.id}>
                  {staff.first_name} {staff.last_name}
                  {staff.employee_no ? ` (${staff.employee_no})` : ''}
                  {staff.email ? ` - ${staff.email}` : ''}
                </option>
              ))}
            </select>
            <p className="text-xs text-gray-500 mt-1">
              Who will handle this application? (Optional)
            </p>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Academic Year <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={formData.academic_year}
              onChange={(e) => setFormData({ ...formData, academic_year: e.target.value })}
              placeholder="e.g., 2026"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Applying for Grade <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={formData.applying_for_grade}
              onChange={(e) => setFormData({ ...formData, applying_for_grade: e.target.value })}
              placeholder="e.g., Grade 10"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Stream
            </label>
            <input
              type="text"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={formData.applying_for_stream}
              onChange={(e) => setFormData({ ...formData, applying_for_stream: e.target.value })}
              placeholder="e.g., Science"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Intended Start Date
            </label>
            <input
              type="date"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={formData.intended_start_date}
              onChange={(e) => setFormData({ ...formData, intended_start_date: e.target.value })}
            />
          </div>
        </div>

        {/* Interview Section */}
        <div className="border-t pt-6 mt-6">
          <div className="flex items-center gap-3 mb-4">
            <input
              type="checkbox"
              id="interview_required"
              className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
              checked={formData.interview_required}
              onChange={(e) => setFormData({ ...formData, interview_required: e.target.checked })}
            />
            <label htmlFor="interview_required" className="text-sm font-medium text-gray-700">
              📝 Interview Required
            </label>
          </div>

          {formData.interview_required && (
            <div className="bg-blue-50 border border-blue-200 rounded-md p-4 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Interview Type
                </label>
                <select
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  value={formData.interview_type}
                  onChange={(e) => setFormData({ ...formData, interview_type: e.target.value })}
                >
                  <option value="general">General Interview</option>
                  <option value="entrance_exam">Entrance Examination</option>
                  <option value="student_interview">Student Interview</option>
                  <option value="parent_interview">Parent/Guardian Interview</option>
                  <option value="panel_interview">Panel Interview</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Notes for Interview Panel
                </label>
                <textarea
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  value={formData.interview_notes}
                  onChange={(e) => setFormData({ ...formData, interview_notes: e.target.value })}
                  placeholder="Special considerations, subjects to focus on, etc..."
                />
              </div>

              <p className="text-xs text-blue-700">
                ℹ️ An interview record will be automatically created. The admissions team will schedule and update the interview details.
              </p>
            </div>
          )}
        </div>

        <div className="flex gap-4 pt-4">
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? 'Saving...' : (applicationId ? 'Update' : 'Create Application')}
          </button>
          <button
            type="button"
            onClick={onCancel}
            className="px-6 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};

export default ApplicationForm;
