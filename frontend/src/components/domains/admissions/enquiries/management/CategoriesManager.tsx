import React, { useState, useEffect } from 'react';

interface Category {
  id?: number;
  name: string;
  code: string;
  description?: string;
  parent_id?: number;
  color?: string;
  display_order?: number;
  is_active?: boolean;
}

interface CategoriesManagerProps {
  categories: any[];
  onSave: (data: any) => Promise<void>;
  onDelete: (id: number) => Promise<void>;
  isLoading?: boolean;
}

export const CategoriesManager: React.FC<CategoriesManagerProps> = ({ 
  categories, 
  onSave, 
  onDelete,
  isLoading = false 
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [formData, setFormData] = useState<Category>({
    name: '',
    code: '',
    description: '',
    parent_id: undefined,
    color: '#3B82F6',
    display_order: 0,
    is_active: true,
  });

  const handleEdit = (category: any) => {
    setEditingCategory(category);
    setFormData({
      name: category.name,
      code: category.code,
      description: category.description || '',
      parent_id: category.parent_id,
      color: category.color || '#3B82F6',
      display_order: category.display_order || 0,
      is_active: category.is_active !== false,
    });
    setIsEditing(true);
  };

  const handleSave = async () => {
    await onSave({ ...formData, id: editingCategory?.id });
    setIsEditing(false);
    setEditingCategory(null);
    setFormData({
      name: '',
      code: '',
      description: '',
      parent_id: undefined,
      color: '#3B82F6',
      display_order: 0,
      is_active: true,
    });
  };

  const handleDelete = async (id: number) => {
    if (confirm('Are you sure? This cannot be undone.')) {
      await onDelete(id);
    }
  };

  return (
    <div className="space-y-6">
      {/* Form */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          {isEditing ? '✏️ Edit Category' : '➕ Add New Category'}
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Name *</label>
            <input
              type="text"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g., Academic"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Code *</label>
            <input
              type="text"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={formData.code}
              onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
              placeholder="e.g., ACADEMIC"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Parent Category</label>
            <select
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={formData.parent_id || ''}
              onChange={(e) => setFormData({ ...formData, parent_id: Number(e.target.value) || undefined })}
            >
              <option value="">No parent (top level)</option>
              {categories
                .filter(c => c.id !== editingCategory?.id)
                .map(cat => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Color</label>
            <input
              type="color"
              className="w-full h-10 px-1 py-1 border border-gray-300 rounded-lg cursor-pointer"
              value={formData.color || '#3B82F6'}
              onChange={(e) => setFormData({ ...formData, color: e.target.value })}
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Display Order</label>
            <input
              type="number"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={formData.display_order || 0}
              onChange={(e) => setFormData({ ...formData, display_order: Number(e.target.value) })}
              placeholder="0"
            />
          </div>
          
          <div className="flex items-center">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                checked={formData.is_active !== false}
                onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
              />
              <span className="text-sm font-medium text-gray-700">Active</span>
            </label>
          </div>
          
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea
              rows={2}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={formData.description || ''}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Brief description..."
            />
          </div>
        </div>
        
        <div className="flex gap-3 mt-4">
          <button
            type="button"
            onClick={handleSave}
            disabled={isLoading || !formData.name || !formData.code}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? 'Saving...' : (isEditing ? '💾 Update' : '➕ Add Category')}
          </button>
          {isEditing && (
            <button
              type="button"
              onClick={() => {
                setIsEditing(false);
                setEditingCategory(null);
                setFormData({
                  name: '',
                  code: '',
                  description: '',
                  parent_id: undefined,
                  color: '#3B82F6',
                  display_order: 0,
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

      {/* List */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">📋 Existing Categories</h3>
        </div>
        
        <div className="divide-y divide-gray-200 max-h-96 overflow-y-auto">
          {categories.length > 0 ? (
            categories.map((category) => (
              <div key={category.id} className="px-6 py-4 hover:bg-gray-50 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div 
                    className="w-4 h-4 rounded-full" 
                    style={{ backgroundColor: category.color || '#3B82F6' }}
                  />
                  <div>
                    <div className="font-medium text-gray-900">
                      {category.name}
                      {!category.is_active && (
                        <span className="ml-2 text-xs text-gray-500 bg-gray-200 px-2 py-0.5 rounded">Inactive</span>
                      )}
                    </div>
                    <div className="text-sm text-gray-500">
                      Code: {category.code}
                      {category.parent_name && ` • Parent: ${category.parent_name}`}
                      {category.description && ` • ${category.description}`}
                    </div>
                  </div>
                </div>
                
                <div className="flex gap-2">
                  <button
                    onClick={() => handleEdit(category)}
                    className="px-3 py-1 text-sm text-blue-600 hover:bg-blue-50 rounded"
                  >
                    ✏️ Edit
                  </button>
                  <button
                    onClick={() => handleDelete(category.id)}
                    className="px-3 py-1 text-sm text-red-600 hover:bg-red-50 rounded"
                  >
                    🗑️ Delete
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div className="px-6 py-8 text-center text-gray-500">
              No categories yet. Add your first category above!
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CategoriesManager;
