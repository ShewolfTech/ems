import React, { useState, useEffect } from 'react';
import { 
  getEnquiryTypes, 
  saveEnquiryType, 
  removeEnquiryType,
  getEnquirySources,
  saveEnquirySource,
  removeEnquirySource
} from '@/domains/admissions/enquiries/controller.js';
import CategoriesManager from '../management/CategoriesManager.js';

interface Source {
  id?: number;
  name: string;
  code: string;
  description?: string;
  is_active?: boolean;
}

const EnquiriesManagement: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'categories' | 'sources'>('categories');
  const [categories, setCategories] = useState<any[]>([]);
  const [sources, setSources] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [initialized, setInitialized] = useState(false);
  
  // Source form state
  const [isEditingSource, setIsEditingSource] = useState(false);
  const [editingSource, setEditingSource] = useState<Source | null>(null);
  const [sourceForm, setSourceForm] = useState<Source>({
    name: '',
    code: '',
    description: '',
    is_active: true,
  });

  const loadCategories = async () => {
    try {
      const res = await getEnquiryTypes();
      if (res.success) setCategories(res.data || []);
    } catch (error) {
      console.error('Failed to load categories:', error);
    }
  };

  const loadSources = async () => {
    try {
      const res = await getEnquirySources();
      if (res.success) setSources(res.data || []);
    } catch (error) {
      console.error('Failed to load sources:', error);
    }
  };

  useEffect(() => {
    // Load data in parallel without blocking
    Promise.all([loadCategories(), loadSources()]).then(() => {
      setInitialized(true);
    });
  }, []);

  // Show loading state briefly
  if (!initialized) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading configuration...</p>
        </div>
      </div>
    );
  }

  const handleSaveCategory = async (data: any) => {
    setLoading(true);
    try {
      await saveEnquiryType(data);
      await loadCategories();
      alert('Category saved successfully!');
    } catch (error: any) {
      alert('Failed to save: ' + (error.response?.data?.message || 'Unknown error'));
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteCategory = async (id: number) => {
    setLoading(true);
    try {
      await removeEnquiryType(id);
      await loadCategories();
      alert('Category deleted!');
    } catch (error: any) {
      alert('Failed to delete: ' + (error.response?.data?.message || 'Unknown error'));
    } finally {
      setLoading(false);
    }
  };

  const handleEditSource = (source: any) => {
    setEditingSource(source);
    setSourceForm({
      id: source.id,
      name: source.name,
      code: source.code,
      description: source.description || '',
      is_active: source.is_active !== false,
    });
    setIsEditingSource(true);
  };

  const handleSaveSource = async () => {
    if (!sourceForm.name || !sourceForm.code) {
      alert('Name and Code are required!');
      return;
    }
    
    setLoading(true);
    try {
      await saveEnquirySource(sourceForm);
      await loadSources();
      alert('Source saved successfully!');
      setIsEditingSource(false);
      setEditingSource(null);
      setSourceForm({
        name: '',
        code: '',
        description: '',
        is_active: true,
      });
    } catch (error: any) {
      alert('Failed to save: ' + (error.response?.data?.message || 'Unknown error'));
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteSource = async (id: number) => {
    if (confirm('Are you sure? This cannot be undone.')) {
      setLoading(true);
      try {
        await removeEnquirySource(id);
        await loadSources();
        alert('Source deleted!');
      } catch (error: any) {
        alert('Failed to delete: ' + (error.response?.data?.message || 'Unknown error'));
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-gray-100">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-8 py-6">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-3xl font-bold text-gray-900">⚙️ Enquiries Configuration</h1>
          <p className="text-gray-500 mt-1">Manage enquiry categories, sources, and settings</p>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-6xl mx-auto px-8 py-8">
        {/* Tabs */}
        <div className="flex gap-2 mb-6">
          <button
            onClick={() => setActiveTab('categories')}
            className={`px-6 py-3 rounded-lg font-medium transition-colors ${
              activeTab === 'categories'
                ? 'bg-blue-600 text-white'
                : 'bg-white text-gray-700 hover:bg-gray-50'
            }`}
          >
            📋 Enquiry Categories
          </button>
          <button
            onClick={() => setActiveTab('sources')}
            className={`px-6 py-3 rounded-lg font-medium transition-colors ${
              activeTab === 'sources'
                ? 'bg-blue-600 text-white'
                : 'bg-white text-gray-700 hover:bg-gray-50'
            }`}
          >
            📍 Enquiry Sources
          </button>
        </div>

        {/* Categories Tab */}
        {activeTab === 'categories' && (
          <CategoriesManager
            categories={categories}
            onSave={handleSaveCategory}
            onDelete={handleDeleteCategory}
            isLoading={loading}
          />
        )}

        {/* Sources Tab */}
        {activeTab === 'sources' && (
          <div className="space-y-6">
            {/* Source Form */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                {isEditingSource ? '✏️ Edit Source' : '➕ Add New Source'}
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Name *</label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={sourceForm.name}
                    onChange={(e) => setSourceForm({ ...sourceForm, name: e.target.value })}
                    placeholder="e.g., Website"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Code *</label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={sourceForm.code}
                    onChange={(e) => setSourceForm({ ...sourceForm, code: e.target.value.toUpperCase() })}
                    placeholder="e.g., WEB"
                  />
                </div>
                
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                  <textarea
                    rows={2}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={sourceForm.description || ''}
                    onChange={(e) => setSourceForm({ ...sourceForm, description: e.target.value })}
                    placeholder="Brief description..."
                  />
                </div>
                
                <div className="flex items-center">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                      checked={sourceForm.is_active !== false}
                      onChange={(e) => setSourceForm({ ...sourceForm, is_active: e.target.checked })}
                    />
                    <span className="text-sm font-medium text-gray-700">Active</span>
                  </label>
                </div>
              </div>
              
              <div className="flex gap-3 mt-4">
                <button
                  type="button"
                  onClick={handleSaveSource}
                  disabled={loading || !sourceForm.name || !sourceForm.code}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'Saving...' : (isEditingSource ? '💾 Update' : '➕ Add Source')}
                </button>
                {isEditingSource && (
                  <button
                    type="button"
                    onClick={() => {
                      setIsEditingSource(false);
                      setEditingSource(null);
                      setSourceForm({
                        name: '',
                        code: '',
                        description: '',
                        is_active: true,
                      });
                    }}
                    className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                )}
              </div>
            </div>

            {/* Sources List */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900">📍 Existing Sources</h3>
              </div>
              
              <div className="divide-y divide-gray-200 max-h-96 overflow-y-auto">
                {sources.length > 0 ? (
                  sources.map((source) => (
                    <div key={source.id} className="px-6 py-4 hover:bg-gray-50 flex items-center justify-between">
                      <div>
                        <div className="font-medium text-gray-900">
                          {source.name}
                          {!source.is_active && (
                            <span className="ml-2 text-xs text-gray-500 bg-gray-200 px-2 py-0.5 rounded">Inactive</span>
                          )}
                        </div>
                        <div className="text-sm text-gray-500">
                          Code: {source.code}
                          {source.description && ` • ${source.description}`}
                        </div>
                      </div>
                      
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleEditSource(source)}
                          className="px-3 py-1 text-sm text-blue-600 hover:bg-blue-50 rounded"
                        >
                          ✏️ Edit
                        </button>
                        <button
                          onClick={() => handleDeleteSource(source.id)}
                          className="px-3 py-1 text-sm text-red-600 hover:bg-red-50 rounded"
                        >
                          🗑️ Delete
                        </button>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="px-6 py-8 text-center text-gray-500">
                    No sources yet. Add your first source above!
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default EnquiriesManagement;
