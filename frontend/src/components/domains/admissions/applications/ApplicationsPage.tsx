import React, { useState } from 'react';
import { ApplicationsList } from './ApplicationsList.js';
import { ApplicationForm } from './ApplicationForm.js';

export const ApplicationsPage: React.FC = () => {
  const [view, setView] = useState<'list' | 'form'>('list');
  const [selectedApplicationId, setSelectedApplicationId] = useState<number | undefined>(undefined);

  const handleCreateNew = () => {
    setSelectedApplicationId(undefined);
    setView('form');
  };

  const handleViewApplication = (id: number) => {
    setSelectedApplicationId(id);
    setView('form');
  };

  const handleSuccess = () => {
    setView('list');
    setSelectedApplicationId(undefined);
  };

  const handleCancel = () => {
    setView('list');
    setSelectedApplicationId(undefined);
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {view === 'list' ? (
        <div>
          <div className="p-6">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h1 className="text-2xl font-bold text-gray-800">Applications</h1>
                <p className="text-gray-600">Manage admission applications</p>
              </div>
              <button
                onClick={handleCreateNew}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                + New Application
              </button>
            </div>
          </div>
          <ApplicationsList />
        </div>
      ) : (
        <ApplicationForm
          applicationId={selectedApplicationId}
          onSuccess={handleSuccess}
          onCancel={handleCancel}
        />
      )}
    </div>
  );
};

export default ApplicationsPage;
