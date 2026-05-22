import React, { useState } from 'react';
import { EnquiriesList } from './EnquiriesList.js';
import { EnquiryForm } from './EnquiryForm.js';

export const EnquiriesPage: React.FC = () => {
  const [view, setView] = useState<'list' | 'form'>('list');
  const [selectedEnquiryId, setSelectedEnquiryId] = useState<number | undefined>(undefined);

  const handleCreateNew = () => {
    setSelectedEnquiryId(undefined);
    setView('form');
  };

  const handleViewEnquiry = (id: number) => {
    setSelectedEnquiryId(id);
    setView('form');
  };

  const handleSuccess = () => {
    setView('list');
    setSelectedEnquiryId(undefined);
  };

  const handleCancel = () => {
    setView('list');
    setSelectedEnquiryId(undefined);
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {view === 'list' ? (
        <div>
          <div className="p-6">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h1 className="text-2xl font-bold text-gray-800">Enquiries</h1>
                <p className="text-gray-600">Manage all incoming enquiries</p>
              </div>
              <div className="flex gap-3">
                <a
                  href="/admissions/enquiries/manage"
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
                >
                  ⚙️ Configure
                </a>
                <button
                  onClick={handleCreateNew}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  + New Enquiry
                </button>
              </div>
            </div>
          </div>
          <EnquiriesList onView={handleViewEnquiry} />
        </div>
      ) : (
        <EnquiryForm
          enquiryId={selectedEnquiryId}
          onSuccess={handleSuccess}
          onCancel={handleCancel}
        />
      )}
    </div>
  );
};

export default EnquiriesPage;
