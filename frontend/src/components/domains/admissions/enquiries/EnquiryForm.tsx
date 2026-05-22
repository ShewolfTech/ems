import React, { useState, useEffect, useMemo } from 'react';
import { 
  getEnquiryById, 
  saveEnquiry, 
  getEnquiryTypes, 
  getEnquirySources,
  getEnquiryNotes,
  saveEnquiryNote,
  getUsersList
} from '../../../../domains/admissions/enquiries/controller.js';

interface EnquiryFormProps {
  enquiryId?: number;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export const EnquiryForm: React.FC<EnquiryFormProps> = ({ enquiryId, onSuccess, onCancel }) => {
  const [loading, setLoading] = useState(false);
  const [enquiryTypes, setEnquiryTypes] = useState<any[]>([]);
  const [enquirySources, setEnquirySources] = useState<any[]>([]);
  const [usersList, setUsersList] = useState<any[]>([]);
  const [notes, setNotes] = useState<any[]>([]);
  const [newNote, setNewNote] = useState('');
  
  // Search states for dropdowns
  const [searchCategory, setSearchCategory] = useState('');
  const [searchSource, setSearchSource] = useState('');
  const [searchUser, setSearchUser] = useState('');
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);
  const [showSourceDropdown, setShowSourceDropdown] = useState(false);
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  
  const [formData, setFormData] = useState({
    subject: '',
    description: '',
    enquirer_name: '',
    enquirer_email: '',
    enquirer_phone: '',
    enquirer_category_id: undefined as number | undefined,
    enquiry_category_id: undefined as number | undefined,
    enquiry_source_id: undefined as number | undefined,
    status: 'new' as string,
    priority: 'medium' as string,
    interested_grade: '',
    interested_stream: '',
    academic_year: '',
    assigned_to: undefined as number | undefined,
    follow_up_date: '',
    next_action: '',
    resolution_notes: '',
    rejection_reason: '',
    converted_to_student_id: undefined as number | undefined,
  });

  // Filtered options for search
  const filteredCategories = useMemo(() => {
    if (!searchCategory) return enquiryTypes;
    return enquiryTypes.filter((type: any) => 
      type.name.toLowerCase().includes(searchCategory.toLowerCase())
    );
  }, [enquiryTypes, searchCategory]);

  const filteredSources = useMemo(() => {
    if (!searchSource) return enquirySources;
    return enquirySources.filter((source: any) => 
      source.name.toLowerCase().includes(searchSource.toLowerCase())
    );
  }, [enquirySources, searchSource]);

  const filteredUsers = useMemo(() => {
    if (!searchUser) return usersList;
    return usersList.filter((user: any) => {
      const name = `${user.first_name || ''} ${user.last_name || ''}`.toLowerCase();
      const email = user.email?.toLowerCase() || '';
      const username = user.username?.toLowerCase() || '';
      return name.includes(searchUser.toLowerCase()) || email.includes(searchUser.toLowerCase()) || username.includes(searchUser.toLowerCase());
    });
  }, [usersList, searchUser]);

  useEffect(() => {
    const loadData = async () => {
      try {
        console.log('🔄 Loading enquiry form data...');
        
        // Load categories and sources first (critical)
        const [categoriesRes, sourcesRes] = await Promise.all([
          getEnquiryTypes(),
          getEnquirySources(),
        ]);
        
        console.log('📋 Categories response:', categoriesRes);
        console.log('📍 Sources response:', sourcesRes);
        
        if (categoriesRes.success) {
          setEnquiryTypes(categoriesRes.data || []);
          console.log(`✅ Loaded ${categoriesRes.data?.length || 0} categories`);
        }
        if (sourcesRes.success) {
          setEnquirySources(sourcesRes.data || []);
          console.log(`✅ Loaded ${sourcesRes.data?.length || 0} sources`);
        }
        
        // Load users separately (optional - don't break form if it fails)
        try {
          const usersRes = await getUsersList();
          console.log('👥 Users response:', usersRes);
          if (usersRes.success) {
            setUsersList(usersRes.data || []);
            console.log(`✅ Loaded ${usersRes.data?.length || 0} users`);
          }
        } catch (userError) {
          console.warn('⚠️ Users endpoint unavailable, using manual entry');
          setUsersList([]);
        }
        
        if (enquiryId) {
          const enquiryRes = await getEnquiryById(enquiryId);
          if (enquiryRes.success) {
            const data = enquiryRes.data;
            setFormData({
              subject: data.subject || '',
              description: data.description || '',
              enquirer_name: data.enquirer_name || '',
              enquirer_email: data.enquirer_email || '',
              enquirer_phone: data.enquirer_phone || '',
              enquirer_category_id: data.enquirer_category_id,
              enquiry_category_id: data.enquiry_category_id,
              enquiry_source_id: data.enquiry_source_id,
              status: data.status || 'new',
              priority: data.priority || 'medium',
              interested_grade: data.interested_grade || '',
              interested_stream: data.interested_stream || '',
              academic_year: data.academic_year || '',
              assigned_to: data.assigned_to,
              follow_up_date: data.follow_up_date ? new Date(data.follow_up_date).toISOString().split('T')[0] : '',
              next_action: data.next_action || '',
              resolution_notes: data.resolution_notes || '',
              rejection_reason: data.rejection_reason || '',
              converted_to_student_id: data.student_id,
            });
          }
          
          const notesRes = await getEnquiryNotes(enquiryId);
          if (notesRes.success) setNotes(notesRes.data || []);
        }
      } catch (error) {
        console.error('Error loading data:', error);
      }
    };
    
    loadData();
  }, [enquiryId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const payload = {
        ...formData,
        enquiry_category_id: formData.enquiry_category_id ? Number(formData.enquiry_category_id) : undefined,
        enquiry_source_id: formData.enquiry_source_id ? Number(formData.enquiry_source_id) : undefined,
        enquirer_category_id: formData.enquirer_category_id ? Number(formData.enquirer_category_id) : undefined,
        assigned_to: formData.assigned_to ? Number(formData.assigned_to) : undefined,
        follow_up_date: formData.follow_up_date ? new Date(formData.follow_up_date) : undefined,
        interested_grade: formData.interested_grade || undefined,
        interested_stream: formData.interested_stream || undefined,
        academic_year: formData.academic_year || undefined,
        next_action: formData.next_action || undefined,
        resolution_notes: formData.resolution_notes || undefined,
        rejection_reason: formData.rejection_reason || undefined,
        student_id: formData.converted_to_student_id || undefined,
        enquirer_type: undefined,
      };
      
      await saveEnquiry({ ...payload, id: enquiryId });
      
      // Show success message with notification info
      const message = enquiryId 
        ? '✅ Enquiry updated successfully!\n\n📧 Notification sent to assigned user.'
        : '✅ Enquiry submitted successfully!\n\n📧 Confirmation sent to enquirer.\n📋 Reference number generated.';
      
      alert(message);
      onSuccess?.();
    } catch (error: any) {
      console.error('Save error:', error);
      alert('❌ Failed to save enquiry\n\n' + (error.response?.data?.message || 'Please try again'));
    } finally {
      setLoading(false);
    }
  };

  const handleAddNote = async () => {
    if (!newNote.trim() || !enquiryId) return;
    
    try {
      await saveEnquiryNote(enquiryId, { note: newNote, note_type: 'general' });
      setNewNote('');
      const notesRes = await getEnquiryNotes(enquiryId);
      if (notesRes.success) setNotes(notesRes.data || []);
    } catch (error) {
      alert('Failed to add note');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-gray-100">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-8 py-6 sticky top-0 z-40 shadow-sm">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                {enquiryId ? 'Edit Enquiry' : 'New Enquiry'}
              </h1>
              <p className="text-gray-500 mt-1">
                {enquiryId ? `Enquiry #${enquiryId}` : 'Create a new enquiry record'}
              </p>
            </div>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={onCancel}
                className="px-6 py-2.5 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors font-medium"
              >
                Cancel
              </button>
              <button
                type="submit"
                form="enquiryForm"
                disabled={loading}
                className="px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed shadow-md flex items-center gap-2"
              >
                <span>{loading ? 'Saving...' : (enquiryId ? '💾 Update & Notify' : '📤 Submit & Notify')}</span>
              </button>
            </div>
          </div>
          
          {/* Info Banner */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <span className="text-2xl">ℹ️</span>
              <div className="text-sm text-blue-800">
                <p className="font-semibold mb-1">What happens when you submit?</p>
                <ul className="list-disc list-inside space-y-1 text-blue-700">
                  <li>The enquiry is saved to the database</li>
                  <li>If assigned, the responsible user is notified</li>
                  <li>A unique reference number is generated (e.g., ENQ-20260325-00001)</li>
                  <li>The enquirer receives a confirmation (if email provided)</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Form Content */}
      <div className="max-w-6xl mx-auto px-8 py-8">
        <form id="enquiryForm" onSubmit={handleSubmit} className="space-y-6">
          
          {/* Section 1: Enquiry Details */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center gap-3">
              <span className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <span className="text-2xl">📋</span>
              </span>
              Enquiry Details
            </h2>
            
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description <span className="text-red-500">*</span>
                </label>
                <textarea
                  required
                  rows={6}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Please provide detailed information about this enquiry..."
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Category Dropdown */}
                <div className="relative">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Category <span className="text-red-500">*</span>
                  </label>
                  <div
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg cursor-pointer flex justify-between items-center hover:border-blue-500 bg-white"
                    onClick={() => {
                      setShowCategoryDropdown(!showCategoryDropdown);
                      setShowSourceDropdown(false);
                      setShowUserDropdown(false);
                    }}
                  >
                    <span className={formData.enquiry_category_id ? 'text-gray-900 font-medium' : 'text-gray-500'}>
                      {formData.enquiry_category_id 
                        ? enquiryTypes.find(t => t.id === formData.enquiry_category_id)?.name 
                        : 'Select category'}
                    </span>
                    <span className="text-gray-600 font-bold">▼</span>
                  </div>
                  
                  {showCategoryDropdown && (
                    <>
                      <div className="absolute z-30 w-full mt-2 bg-white border border-gray-200 rounded-lg shadow-xl max-h-72 overflow-hidden">
                        <div className="p-3 border-b border-gray-100">
                          <input
                            type="text"
                            placeholder="Search categories..."
                            className="w-full px-3 py-2 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            value={searchCategory}
                            onChange={(e) => setSearchCategory(e.target.value)}
                            onClick={(e) => e.stopPropagation()}
                            autoFocus
                          />
                        </div>
                        <div className="max-h-56 overflow-y-auto py-2">
                          {filteredCategories.length > 0 ? (
                            filteredCategories.map((type: any) => (
                              <div
                                key={type.id}
                                className={`px-4 py-3 cursor-pointer hover:bg-blue-50 ${
                                  formData.enquiry_category_id === type.id ? 'bg-blue-50' : ''
                                }`}
                                onClick={() => {
                                  setFormData({ 
                                    ...formData, 
                                    enquiry_category_id: type.id,
                                    subject: !formData.subject || formData.subject.startsWith('Enquiry about')
                                      ? `${type.name} Enquiry` 
                                      : formData.subject
                                  });
                                  setShowCategoryDropdown(false);
                                  setSearchCategory('');
                                }}
                              >
                                <div className="flex items-start gap-3">
                                  {type.color && (
                                    <div className="w-3 h-3 rounded-full mt-1.5" style={{ backgroundColor: type.color }} />
                                  )}
                                  <div>
                                    <span className="text-gray-900 font-medium">{type.name}</span>
                                    {type.description && (
                                      <p className="text-xs text-gray-500 mt-1">{type.description}</p>
                                    )}
                                  </div>
                                </div>
                              </div>
                            ))
                          ) : (
                            <div className="px-4 py-3 text-sm text-gray-500 text-center">
                              No categories found
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="fixed inset-0 z-20" onClick={() => setShowCategoryDropdown(false)} />
                    </>
                  )}
                </div>
                
                {/* Source Dropdown */}
                <div className="relative">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Source</label>
                  <div
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg cursor-pointer flex justify-between items-center hover:border-blue-500 bg-white"
                    onClick={() => {
                      setShowSourceDropdown(!showSourceDropdown);
                      setShowCategoryDropdown(false);
                      setShowUserDropdown(false);
                    }}
                  >
                    <span className={formData.enquiry_source_id ? 'text-gray-900 font-medium' : 'text-gray-500'}>
                      {formData.enquiry_source_id 
                        ? enquirySources.find(s => s.id === formData.enquiry_source_id)?.name 
                        : 'Select source'}
                    </span>
                    <span className="text-gray-600 font-bold">▼</span>
                  </div>
                  
                  {showSourceDropdown && (
                    <>
                      <div className="absolute z-30 w-full mt-2 bg-white border border-gray-200 rounded-lg shadow-xl max-h-72 overflow-hidden">
                        <div className="p-3 border-b border-gray-100">
                          <input
                            type="text"
                            placeholder="Search sources..."
                            className="w-full px-3 py-2 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            value={searchSource}
                            onChange={(e) => setSearchSource(e.target.value)}
                            onClick={(e) => e.stopPropagation()}
                            autoFocus
                          />
                        </div>
                        <div className="max-h-56 overflow-y-auto py-2">
                          {filteredSources.length > 0 ? (
                            filteredSources.map((source: any) => (
                              <div
                                key={source.id}
                                className={`px-4 py-3 cursor-pointer hover:bg-blue-50 ${
                                  formData.enquiry_source_id === source.id ? 'bg-blue-50' : ''
                                }`}
                                onClick={() => {
                                  setFormData({ ...formData, enquiry_source_id: source.id });
                                  setShowSourceDropdown(false);
                                  setSearchSource('');
                                }}
                              >
                                <span className="text-gray-900 font-medium">{source.name}</span>
                                {source.description && (
                                  <p className="text-xs text-gray-500 mt-1">{source.description}</p>
                                )}
                              </div>
                            ))
                          ) : (
                            <div className="px-4 py-3 text-sm text-gray-500 text-center">
                              No sources found
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="fixed inset-0 z-20" onClick={() => setShowSourceDropdown(false)} />
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Section 2: Enquirer Information */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center gap-3">
              <span className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <span className="text-2xl">👤</span>
              </span>
              Enquirer Information
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Full Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={formData.enquirer_name}
                  onChange={(e) => setFormData({ ...formData, enquirer_name: e.target.value })}
                  placeholder="John Doe"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                <input
                  type="email"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={formData.enquirer_email}
                  onChange={(e) => setFormData({ ...formData, enquirer_email: e.target.value })}
                  placeholder="john@example.com"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Phone <span className="text-red-500">*</span>
                </label>
                <input
                  type="tel"
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={formData.enquirer_phone}
                  onChange={(e) => setFormData({ ...formData, enquirer_phone: e.target.value })}
                  placeholder="+256 700 000 000"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Enquirer Type</label>
                <select
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={formData.enquirer_category_id || ''}
                  onChange={(e) => setFormData({ ...formData, enquirer_category_id: Number(e.target.value) || undefined })}
                >
                  <option value="">Select enquirer type</option>
                  <option value="1">Existing Parent</option>
                  <option value="2">Potential Parent</option>
                  <option value="3">Existing Student</option>
                  <option value="4">Potential Student</option>
                  <option value="5">Vendor</option>
                  <option value="6">Board Member</option>
                  <option value="7">Staff</option>
                  <option value="8">Alumni</option>
                  <option value="9">External Visitor</option>
                </select>
              </div>
            </div>
          </div>

          {/* Section 3: Assignment & Priority */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center gap-3">
              <span className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                <span className="text-2xl">🎯</span>
              </span>
              Assignment & Priority
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                <select
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                >
                  <option value="new">🆕 New</option>
                  <option value="in_progress">⏳ In Progress</option>
                  <option value="waiting_response">⏸️ Waiting Response</option>
                  <option value="converted">✅ Converted</option>
                  <option value="closed">✔️ Closed</option>
                  <option value="rejected">❌ Rejected</option>
                </select>
                <p className="text-xs text-gray-500 mt-1">💡 Changing status will automatically add a system note</p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Priority</label>
                <select
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={formData.priority}
                  onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                >
                  <option value="low">⚪ Low</option>
                  <option value="medium">🔵 Medium</option>
                  <option value="high">🟠 High</option>
                  <option value="urgent">🔴 Urgent</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Assigned To (User ID)</label>
                <input
                  type="number"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={formData.assigned_to || ''}
                  onChange={(e) => setFormData({ 
                    ...formData, 
                    assigned_to: Number(e.target.value) || undefined,
                    status: e.target.value ? 'in_progress' : formData.status
                  })}
                  placeholder="Enter user ID"
                />
                <p className="text-xs text-gray-500 mt-1">💡 Enter the ID of the user to assign this enquiry to</p>
              </div>
            </div>
          </div>

          {/* Section 4: Academic Interest */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center gap-3">
              <span className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                <span className="text-2xl">🎓</span>
              </span>
              Academic Interest
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Interested Grade</label>
                <input
                  type="text"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={formData.interested_grade}
                  onChange={(e) => setFormData({ ...formData, interested_grade: e.target.value })}
                  placeholder="e.g., Grade 10"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Stream</label>
                <input
                  type="text"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={formData.interested_stream}
                  onChange={(e) => setFormData({ ...formData, interested_stream: e.target.value })}
                  placeholder="e.g., Science"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Academic Year</label>
                <input
                  type="text"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={formData.academic_year}
                  onChange={(e) => setFormData({ ...formData, academic_year: e.target.value })}
                  placeholder="e.g., 2026"
                />
              </div>
            </div>
          </div>

          {/* Section 5: Follow-up */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center gap-3">
              <span className="w-10 h-10 bg-teal-100 rounded-lg flex items-center justify-center">
                <span className="text-2xl">📅</span>
              </span>
              Follow-up
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Follow-up Date</label>
                <input
                  type="date"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={formData.follow_up_date}
                  onChange={(e) => setFormData({ ...formData, follow_up_date: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Next Action</label>
                <input
                  type="text"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={formData.next_action}
                  onChange={(e) => setFormData({ ...formData, next_action: e.target.value })}
                  placeholder="e.g., Call parent back"
                />
              </div>
            </div>
          </div>

          {/* Section 6: Resolution & Feedback */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center gap-3">
              <span className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                <span className="text-2xl">✅</span>
              </span>
              Resolution & Closing
            </h2>
            
            <div className="space-y-6">
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <p className="text-sm text-yellow-800">
                  💡 <strong>Tip:</strong> Fill this section when closing or resolving the enquiry.
                </p>
              </div>

              {formData.status === 'converted' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Converted to Student ID
                  </label>
                  <input
                    type="text"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                    value={formData.converted_to_student_id || ''}
                    onChange={(e) => setFormData({ ...formData, converted_to_student_id: Number(e.target.value) || undefined })}
                    placeholder="Enter student ID if converted"
                  />
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Resolution Notes <span className="text-red-500">*</span>
                </label>
                <textarea
                  required={formData.status === 'closed' || formData.status === 'converted' || formData.status === 'rejected'}
                  rows={4}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={formData.resolution_notes || ''}
                  onChange={(e) => setFormData({ ...formData, resolution_notes: e.target.value })}
                  placeholder="Describe how this enquiry was resolved. What actions were taken? What was the outcome?"
                />
                {formData.status === 'closed' && !formData.resolution_notes && (
                  <p className="text-xs text-red-500 mt-1">⚠️ Resolution notes are required when closing an enquiry</p>
                )}
              </div>

              {formData.status === 'rejected' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Rejection Reason <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    required={formData.status === 'rejected'}
                    rows={3}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                    value={formData.rejection_reason || ''}
                    onChange={(e) => setFormData({ ...formData, rejection_reason: e.target.value })}
                    placeholder="Explain why this enquiry was rejected..."
                  />
                </div>
              )}

              {formData.status === 'closed' && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <p className="text-sm text-green-800">
                    ✅ <strong>Enquiry will be marked as Closed</strong><br/>
                    This indicates the enquiry has been fully resolved and no further action is needed.
                  </p>
                </div>
              )}

              {formData.status === 'converted' && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <p className="text-sm text-blue-800">
                    🎉 <strong>Enquiry Converted to Admission!</strong><br/>
                    This enquiry has successfully resulted in a student admission.
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Section 7: Notes (Edit Mode Only) */}
          {enquiryId && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center gap-3">
                <span className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
                  <span className="text-2xl">💬</span>
                </span>
                Internal Notes
              </h2>
              
              <div className="space-y-6">
                <div>
                  <textarea
                    rows={3}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Add an internal note..."
                    value={newNote}
                    onChange={(e) => setNewNote(e.target.value)}
                  />
                  <button
                    type="button"
                    onClick={handleAddNote}
                    className="mt-3 px-4 py-2.5 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm font-medium"
                  >
                    Add Note
                  </button>
                </div>
                
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {notes.length > 0 ? (
                    notes.map((note: any) => (
                      <div key={note.id} className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                        <div className="flex justify-between items-start mb-2">
                          <div className="flex items-center gap-2">
                            <span className="text-lg">👤</span>
                            <div>
                              <div className="text-sm font-medium text-gray-900">
                                {note.created_by_name || 'Unknown'}
                              </div>
                              {note.note_type && (
                                <span className="text-xs text-gray-500 bg-gray-200 px-2 py-0.5 rounded">
                                  {note.note_type}
                                </span>
                              )}
                            </div>
                          </div>
                          <div className="text-xs text-gray-500">
                            {new Date(note.created_at || '').toLocaleString()}
                          </div>
                        </div>
                        <p className="text-gray-700 mt-2">{note.note}</p>
                      </div>
                    ))
                  ) : (
                    <p className="text-gray-500 text-center py-4">No notes yet</p>
                  )}
                </div>
              </div>
            </div>
          )}
        </form>
      </div>
    </div>
  );
};

export default EnquiryForm;
