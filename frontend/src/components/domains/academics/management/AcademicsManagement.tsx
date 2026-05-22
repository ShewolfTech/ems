import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAcademicYears } from '@/domains/academics/academic_years/hooks/useAcademicYears.js';
import { useTerms } from '@/domains/academics/terms/hooks/useTerms.js';
import { useClasses } from '@/domains/academics/classes/hooks/useClasses.js';
import { useSubjects } from '@/domains/academics/subjects/hooks/useSubjects.js';

export function AcademicsManagement() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'overview' | 'classes' | 'timetables' | 'performance'>('overview');
  const { data: academicYears } = useAcademicYears({ autoFetch: true }) as any;
  const { data: terms } = useTerms({ autoFetch: true }) as any;
  const { data: classes } = useClasses({ autoFetch: true }) as any;
  const { data: subjects } = useSubjects({ autoFetch: true }) as any;

  const currentYear = academicYears?.find((y: any) => y.is_current) || academicYears?.[0];

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Academics Management</h1>
        <p className="text-gray-600">Manage classes, timetables, and monitor academic performance</p>
      </div>

      {/* Current Year Banner */}
      {currentYear && (
        <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-lg shadow p-5 mb-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-200 text-sm">Current Academic Year</p>
              <p className="text-xl font-bold mt-1">{currentYear.name}</p>
            </div>
            <div className="flex gap-2">
              {currentYear.is_current && (
                <span className="px-2 py-0.5 bg-white bg-opacity-20 rounded text-xs font-medium">Current</span>
              )}
              {currentYear.is_active ? (
                <span className="px-2 py-0.5 bg-green-400 bg-opacity-20 rounded text-xs font-medium">Active</span>
              ) : (
                <span className="px-2 py-0.5 bg-gray-400 bg-opacity-20 rounded text-xs font-medium">Inactive</span>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="-mb-px flex space-x-8">
          {[
            { key: 'overview', label: '📊 Overview' },
            { key: 'classes', label: '🏫 Classes' },
            { key: 'timetables', label: '⏰ Timetables' },
            { key: 'performance', label: '📈 Performance' },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as any)}
              className={`py-3 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === tab.key
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Overview Tab */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white rounded-lg shadow p-5">
              <p className="text-sm text-gray-500">Academic Years</p>
              <p className="text-3xl font-bold text-blue-600">{academicYears?.length || 0}</p>
            </div>
            <div className="bg-white rounded-lg shadow p-5">
              <p className="text-sm text-gray-500">Terms</p>
              <p className="text-3xl font-bold text-purple-600">{terms?.length || 0}</p>
            </div>
            <div className="bg-white rounded-lg shadow p-5">
              <p className="text-sm text-gray-500">Classes</p>
              <p className="text-3xl font-bold text-indigo-600">{classes?.length || 0}</p>
            </div>
            <div className="bg-white rounded-lg shadow p-5">
              <p className="text-sm text-gray-500">Subjects</p>
              <p className="text-3xl font-bold text-green-600">{subjects?.length || 0}</p>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              { title: 'Manage Academic Years', icon: '📅', route: '/academics/academic_years' },
              { title: 'Manage Terms', icon: '📆', route: '/academics/terms' },
              { title: 'Manage Grade Levels', icon: '🎓', route: '/academics/grade_levels' },
              { title: 'Manage Subjects', icon: '📚', route: '/academics/subjects' },
              { title: 'Manage Curricula', icon: '📖', route: '/academics/curricula' },
              { title: 'View Report Cards', icon: '📄', route: '/academics/report_cards' },
            ].map((action) => (
              <div
                key={action.title}
                onClick={() => navigate(action.route)}
                className="bg-white rounded-lg shadow p-4 hover:shadow-md transition-shadow cursor-pointer border border-gray-100 hover:border-blue-200 group"
              >
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{action.icon}</span>
                  <div>
                    <p className="font-medium text-gray-900 group-hover:text-blue-600 transition-colors">{action.title}</p>
                    <p className="text-xs text-gray-500 mt-1">Click to manage</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Classes Tab */}
      {activeTab === 'classes' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-semibold text-gray-800">Classes Overview</h2>
            <button
              onClick={() => navigate('/academics/classes')}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm"
            >
              + New Class
            </button>
          </div>
          <div className="bg-white rounded-lg shadow overflow-hidden">
            {classes?.length > 0 ? (
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Class Name</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {classes.map((cls: any) => (
                    <tr key={cls.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div className="text-sm font-medium text-gray-900">{cls.name || cls.class_name || '—'}</div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-0.5 rounded text-xs font-medium ${cls.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                          {cls.is_active ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right text-sm font-medium">
                        <button
                          onClick={() => navigate('/academics/classes')}
                          className="text-blue-600 hover:text-blue-900"
                        >
                          Manage
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className="p-12 text-center text-gray-500">No classes defined yet</div>
            )}
          </div>
        </div>
      )}

      {/* Timetables Tab */}
      {activeTab === 'timetables' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-semibold text-gray-800">Timetables</h2>
            <button
              onClick={() => navigate('/academics/timetables')}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm"
            >
              + New Timetable
            </button>
          </div>
          <div className="bg-white rounded-lg shadow p-12 text-center text-gray-500">
            <p className="text-lg mb-2">🗓️ Timetable Builder</p>
            <p className="text-sm">Navigate to Timetables to create and manage class schedules</p>
            <button
              onClick={() => navigate('/academics/timetables')}
              className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm"
            >
              Go to Timetables
            </button>
          </div>
        </div>
      )}

      {/* Performance Tab */}
      {activeTab === 'performance' && (
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-gray-800">Performance Analytics</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              { title: 'Class Performance', icon: '📊', desc: 'Class-level performance summary', route: '/academics/views/class_performance' },
              { title: 'Student Grades', icon: '📈', desc: 'View student grade records', route: '/academics/views/student_grades' },
              { title: 'Exams Performance', icon: '🏆', desc: 'Exam performance analytics', route: '/academics/views/exams_performance' },
              { title: 'Subject Performance', icon: '📐', desc: 'Subject-level analytics', route: '/academics/views/subject_performance' },
              { title: 'Term Performance', icon: '📋', desc: 'Student term performance', route: '/academics/views/term_performance' },
              { title: 'Assignment Submissions', icon: '📬', desc: 'Track assignment submissions', route: '/academics/views/assignment_submissions' },
            ].map((card) => (
              <div
                key={card.title}
                onClick={() => navigate(card.route)}
                className="bg-white rounded-lg shadow p-5 hover:shadow-md transition-shadow cursor-pointer border border-gray-100 hover:border-blue-200 group"
              >
                <div className="flex items-start gap-3">
                  <span className="text-2xl">{card.icon}</span>
                  <div>
                    <p className="font-medium text-gray-900 group-hover:text-blue-600 transition-colors">{card.title}</p>
                    <p className="text-xs text-gray-500 mt-1">{card.desc}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default AcademicsManagement;
