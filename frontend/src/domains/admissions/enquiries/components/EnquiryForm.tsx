import React, { useState, useEffect } from 'react';
import {
  getEnquiryById,
  saveEnquiry,
  getEnquiryTypes,
  getEnquirySources,
  assignEnquiry,
  updateEnquiryStatus,
  getEnquiryNotes,
  saveEnquiryNote,
  getEnquiryAttachments
} from '../controller.js';
import type { Enquiry, EnquiryType, EnquirySource, EnquiryNote, EnquiryFormData } from '../types.js';

interface EnquiryFormProps {
  enquiryId?: number;
  onSuccess?: () => void;
  onCancel?: () => void;
}

const StatusBadge = ({ status }: { status: string }) => {
  const statusClasses: Record<string, string> = {
    new: 'bg-blue-100 text-blue-800',
    in_progress: 'bg-yellow-100 text-yellow-800',
    waiting_response: 'bg-purple-100 text-purple-800',
    converted: 'bg-green-100 text-green-800',
    closed: 'bg-gray-100 text-gray-800',
    rejected: 'bg-red-100 text-red-800',
  };
  
  const statusLabels: Record<string, string> = {
    new: 'New',
    in_progress: 'In Progress',
    waiting_response: 'Waiting Response',
    converted: 'Converted',
    closed: 'Closed',
    rejected: 'Rejected',
  };
  
  return (
    <span className={`px-3 py-1 rounded-full text-sm font-medium ${statusClasses[status] || 'bg-gray-100 text-gray-800'}`}>
      {statusLabels[status] || status}
    </span>
  );
};

export const EnquiryForm: React.FC<EnquiryFormProps> = ({ enquiryId, onSuccess, onCancel }) => {
  const [loading, setLoading] = useState(false);
  const [enquiryTypes, setEnquiryTypes] = useState<EnquiryType[]>([]);
  const [enquirySources, setEnquirySources] = useState<EnquirySource[]>([]);
  const [notes, setNotes] = useState<EnquiryNote[]>([]);
  const [newNote, setNewNote] = useState('');
  
  const [formData, setFormData] = useState<EnquiryFormData>({
    subject: '',
    description: '',
    enquirer_name: '',
    enquirer_email: '',
    enquirer_phone: '',
    enquirer_type: 'external',
    status: 'new',
    priority: 'medium',
    enquiry_type_id: undefined,
    enquiry_source_id: undefined,
    interested_grade: '',
    interested_stream: '',
    academic_year: '',
    assigned_to: undefined,
    follow_up_date: '',
    next_action: '',
  });

  useEffect(() => {
    const loadData = async () => {
      try {
        const [typesRes, sourcesRes] = await Promise.all([
          getEnquiryTypes(),
          getEnquirySources(),
        ]);
        
        if (typesRes.success) setEnquiryTypes(typesRes.data || []);
        if (sourcesRes.success) setEnquirySources(sourcesRes.data || []);
        
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
              enquirer_type: data.enquirer_type || 'external',
              status: data.status || 'new',
              priority: data.priority || 'medium',
              enquiry_type_id: data.enquiry_type_id,
              enquiry_source_id: data.enquiry_source_id,
              interested_grade: data.interested_grade || '',
              interested_stream: data.interested_stream || '',
              academic_year: data.academic_year || '',
              assigned_to: data.assigned_to,
              follow_up_date: data.follow_up_date ? new Date(data.follow_up_date).toISOString().split('T')[0] : '',
              next_action: data.next_action || '',
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
      await saveEnquiry({ ...formData, id: enquiryId });
      alert(enquiryId ? 'Enquiry updated successfully' : 'Enquiry created successfully');
      onSuccess?.();
    } catch (error: any) {
      alert(error.response?.data?.message || 'Failed to save enquiry');
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

  const handleStatusChange = async (newStatus: string) => {
    if (!enquiryId) return;

    try {
      await updateEnquiryStatus(enquiryId, newStatus);
      alert('Status updated successfully');
      if (enquiryId) {
        const enquiryRes = await getEnquiryById(enquiryId);
        if (enquiryRes.success) {
          setFormData((prev: any) => ({ ...prev, status: enquiryRes.data.status }));
        }
      }
    } catch (error) {
      alert('Failed to update status');
    }
  };

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">
          {enquiryId ? 'Edit Enquiry' : 'New Enquiry'}
        </h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Classification */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Enquiry Type
            </label>
            <select
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={formData.enquiry_type_id || ''}
              onChange={(e) => setFormData({ ...formData, enquiry_type_id: Number(e.target.value) || undefined })}
            >
              <option value="">Select Type</option>
              {enquiryTypes.map((type) => (
                <option key={type.id} value={type.id}>{type.name}</option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Source
            </label>
            <select
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={formData.enquiry_source_id || ''}
              onChange={(e) => setFormData({ ...formData, enquiry_source_id: Number(e.target.value) || undefined })}
            >
              <option value="">Select Source</option>
              {enquirySources.map((source) => (
                <option key={source.id} value={source.id}>{source.name}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Subject & Description */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Subject *
          </label>
          <input
            type="text"
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={formData.subject}
            onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Description *
          </label>
          <textarea
            required
            rows={4}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          />
        </div>

        {/* Enquirer Details */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Enquirer Name *
            </label>
            <input
              type="text"
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={formData.enquirer_name}
              onChange={(e) => setFormData({ ...formData, enquirer_name: e.target.value })}
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
            <input
              type="email"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={formData.enquirer_email}
              onChange={(e) => setFormData({ ...formData, enquirer_email: e.target.value })}
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Phone
            </label>
            <input
              type="tel"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={formData.enquirer_phone}
              onChange={(e) => setFormData({ ...formData, enquirer_phone: e.target.value })}
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Enquirer Type
            </label>
            <select
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={formData.enquirer_type}
              onChange={(e) => setFormData({ ...formData, enquirer_type: e.target.value as any })}
            >
              <option value="external">External</option>
              <option value="student">Student</option>
              <option value="parent">Parent</option>
              <option value="guardian">Guardian</option>
            </select>
          </div>
        </div>

        {/* Academic Interest */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Interested Grade
            </label>
            <input
              type="text"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={formData.interested_grade}
              onChange={(e) => setFormData({ ...formData, interested_grade: e.target.value })}
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Stream
            </label>
            <input
              type="text"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={formData.interested_stream}
              onChange={(e) => setFormData({ ...formData, interested_stream: e.target.value })}
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Academic Year
            </label>
            <input
              type="text"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={formData.academic_year}
              onChange={(e) => setFormData({ ...formData, academic_year: e.target.value })}
            />
          </div>
        </div>

        {/* Status & Priority */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Status
            </label>
            <select
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
            >
              <option value="new">New</option>
              <option value="in_progress">In Progress</option>
              <option value="waiting_response">Waiting Response</option>
              <option value="converted">Converted</option>
              <option value="closed">Closed</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Priority
            </label>
            <select
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={formData.priority}
              onChange={(e) => setFormData({ ...formData, priority: e.target.value as any })}
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
              <option value="urgent">Urgent</option>
            </select>
          </div>
        </div>

        {/* Follow-up */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Follow-up Date
            </label>
            <input
              type="date"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={formData.follow_up_date}
              onChange={(e) => setFormData({ ...formData, follow_up_date: e.target.value })}
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Next Action
            </label>
            <input
              type="text"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={formData.next_action}
              onChange={(e) => setFormData({ ...formData, next_action: e.target.value })}
            />
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-4 pt-4">
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? 'Saving...' : (enquiryId ? 'Update' : 'Create')}
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

      {/* Notes Section (Edit Mode Only) */}
      {enquiryId && (
        <div className="mt-8">
          <h2 className="text-xl font-bold text-gray-800 mb-4">Notes</h2>
          
          <div className="mb-4">
            <textarea
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Add a note..."
              value={newNote}
              onChange={(e) => setNewNote(e.target.value)}
            />
            <button
              type="button"
              onClick={handleAddNote}
              className="mt-2 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 text-sm"
            >
              Add Note
            </button>
          </div>
          
          <div className="space-y-3">
            {notes.map((note) => (
              <div key={note.id} className="p-4 bg-gray-50 rounded-md">
                <div className="flex justify-between items-start mb-2">
                  <div className="text-sm font-medium text-gray-900">
                    {note.created_by_name || 'Unknown'}
                  </div>
                  <div className="text-xs text-gray-500">
                    {new Date(note.created_at || '').toLocaleString()}
                  </div>
                </div>
                <p className="text-gray-700">{note.note}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default EnquiryForm;
