import React, { useState, useEffect } from 'react';
import { 
  getEntranceExams, 
  createExamResult, 
  updateExamResult, 
  deleteExamResult,
  getExamSessions,
  createSession,
  getExamDefinitions,
  createDefinition
} from '@/domains/admissions/exams/controller.js';
import { getApplicationsList } from '@/domains/admissions/applications/controller.js';

export const EntranceExamsPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'results' | 'sessions' | 'definitions'>('results');
  const [exams, setExams] = useState<any[]>([]);
  const [sessions, setSessions] = useState<any[]>([]);
  const [definitions, setDefinitions] = useState<any[]>([]);
  const [applications, setApplications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState<'exam' | 'session' | 'definition'>('exam');
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState<{
    session_id?: number;
    exam_definition_id?: number;
    date_from?: string;
    date_to?: string;
  }>({});
  
  // Exam result form data
  const [examData, setExamData] = useState({
    application_id: 0,
    session_id: undefined as number | undefined,
    exam_definition_id: undefined as number | undefined,
    exam_date: new Date().toISOString().split('T')[0],
    total_marks: 100,
    marks_obtained: 0,
    grade: 'B',
    supervisor_name: '',
    marker_name: '',
    examiner_name: '',
    exam_venue: '',
    remarks: '',
  });

  // Session form data
  const [sessionData, setSessionData] = useState({
    session_name: '',
    session_code: '',
    academic_year: new Date().getFullYear().toString(),
    start_date: '',
    end_date: '',
  });

  // Definition form data
  const [definitionData, setDefinitionData] = useState({
    exam_name: '',
    exam_code: '',
    subject_area: '',
    total_marks: 100,
    duration_minutes: 120,
    grading_scale: 'A-F',
    description: '',
  });

  const loadData = async () => {
    try {
      setLoading(true);
      const params: any = {};
      if (filters.session_id) params.session_id = filters.session_id;
      if (filters.exam_definition_id) params.exam_definition_id = filters.exam_definition_id;
      if (filters.date_from) params.date_from = filters.date_from;
      if (filters.date_to) params.date_to = filters.date_to;

      const [examsRes, sessionsRes, definitionsRes, appsRes] = await Promise.all([
        getEntranceExams(params),
        getExamSessions(),
        getExamDefinitions(),
        getApplicationsList({ limit: 100 }),
      ]);

      if (examsRes.success) setExams(examsRes.data || []);
      if (sessionsRes.success) setSessions(sessionsRes.data || []);
      if (definitionsRes.success) setDefinitions(definitionsRes.data || []);
      if (appsRes.success) setApplications(appsRes.data?.data || []);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [filters]);

  const handleAddExam = () => {
    setModalType('exam');
    setSelectedItem(null);
    setExamData({
      application_id: 0,
      session_id: undefined,
      exam_definition_id: undefined,
      exam_date: new Date().toISOString().split('T')[0],
      total_marks: 100,
      marks_obtained: 0,
      grade: 'B',
      supervisor_name: '',
      marker_name: '',
      examiner_name: '',
      exam_venue: '',
      remarks: '',
    });
    setShowModal(true);
  };

  const handleSaveExam = async () => {
    try {
      if (selectedItem) {
        await updateExamResult(selectedItem.id, examData);
        alert('✅ Exam result updated!');
        setShowModal(false);
      } else {
        await createExamResult(examData);
        alert('✅ Exam result recorded!');
        // Keep modal open for next exam entry - reset only exam-specific fields
        setExamData(prev => ({
          ...prev,
          exam_definition_id: undefined,
          marks_obtained: 0,
          grade: '',
          remarks: '',
        }));
      }
      loadData();
    } catch (error: any) {
      alert('❌ Error: ' + (error.response?.data?.message || 'Failed to save exam result'));
    }
  };

  const handleAddSession = () => {
    setModalType('session');
    setSelectedItem(null);
    
    // Auto-generate session code: ENT-YYYY-MMM
    const now = new Date();
    const year = now.getFullYear();
    const month = now.toLocaleString('default', { month: 'short' }).toUpperCase();
    const autoCode = `ENT-${year}-${month}`;
    
    setSessionData({
      session_name: '',
      session_code: autoCode,
      academic_year: year.toString(),
      start_date: '',
      end_date: '',
    });
    setShowModal(true);
  };

  const handleSaveSession = async () => {
    try {
      await createSession(sessionData);
      alert('✅ Exam session created!');
      setShowModal(false);
      loadData();
    } catch (error: any) {
      alert('❌ Error: ' + (error.response?.data?.message || 'Failed to create session'));
    }
  };

  const handleAddDefinition = () => {
    setModalType('definition');
    setSelectedItem(null);
    setDefinitionData({
      exam_name: '',
      exam_code: '',
      subject_area: '',
      total_marks: 100,
      duration_minutes: 120,
      grading_scale: 'A-F',
      description: '',
    });
    setShowModal(true);
  };

  const handleSaveDefinition = async () => {
    try {
      await createDefinition(definitionData);
      alert('✅ Exam definition created!');
      setShowModal(false);
      loadData();
    } catch (error: any) {
      alert('❌ Error: ' + (error.response?.data?.message || 'Failed to create definition'));
    }
  };

  const handleEditExam = (exam: any) => {
    setModalType('exam');
    setSelectedItem(exam);
    setExamData({
      application_id: exam.application_id,
      session_id: exam.session_id,
      exam_definition_id: exam.exam_definition_id,
      exam_date: exam.exam_date ? exam.exam_date.split('T')[0] : new Date().toISOString().split('T')[0],
      total_marks: exam.total_marks,
      marks_obtained: exam.marks_obtained,
      grade: exam.grade,
      supervisor_name: exam.supervisor_name || '',
      marker_name: exam.marker_name || '',
      examiner_name: exam.examiner_name || '',
      exam_venue: exam.exam_venue || '',
      remarks: exam.remarks || '',
    });
    setShowModal(true);
  };

  const handleDeleteExam = async (id: number) => {
    if (!confirm('Are you sure you want to delete this exam result?')) return;
    try {
      await deleteExamResult(id);
      alert('✅ Exam result deleted!');
      loadData();
    } catch (error: any) {
      alert('❌ Error: ' + (error.response?.data?.message || 'Failed to delete exam result'));
    }
  };

  const getGradeColor = (grade: string) => {
    const colors: any = {
      'A': 'bg-green-100 text-green-800',
      'B': 'bg-blue-100 text-blue-800',
      'C': 'bg-yellow-100 text-yellow-800',
      'D': 'bg-orange-100 text-orange-800',
      'F': 'bg-red-100 text-red-800',
    };
    return colors[grade] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Entrance Examinations</h1>
          <p className="text-gray-600">Manage exam sessions, definitions, and results</p>
        </div>
        <button
          onClick={activeTab === 'results' ? handleAddExam : activeTab === 'sessions' ? handleAddSession : handleAddDefinition}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          + {activeTab === 'results' ? 'Record Result' : activeTab === 'sessions' ? 'New Session' : 'New Definition'}
        </button>
      </div>

      {/* Tabs */}
      <div className="mb-6">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab('results')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'results'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              📊 Exam Results
            </button>
            <button
              onClick={() => setActiveTab('sessions')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'sessions'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              📅 Exam Sessions
            </button>
            <button
              onClick={() => setActiveTab('definitions')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'definitions'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              📝 Exam Definitions
            </button>
          </nav>
        </div>
      </div>

      {/* Results Tab */}
      {activeTab === 'results' && (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          {/* Filters */}
          <div className="p-4 bg-gray-50 border-b border-gray-200">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Session</label>
                <select
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  value={filters.session_id || ''}
                  onChange={(e) => setFilters({ ...filters, session_id: e.target.value ? Number(e.target.value) : undefined })}
                >
                  <option value="">All Sessions</option>
                  {sessions.map((s: any) => (
                    <option key={s.id} value={s.id}>{s.session_name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Exam</label>
                <select
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  value={filters.exam_definition_id || ''}
                  onChange={(e) => setFilters({ ...filters, exam_definition_id: e.target.value ? Number(e.target.value) : undefined })}
                >
                  <option value="">All Exams</option>
                  {definitions.map((d: any) => (
                    <option key={d.id} value={d.id}>{d.exam_name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">From Date</label>
                <input
                  type="date"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  value={filters.date_from || ''}
                  onChange={(e) => setFilters({ ...filters, date_from: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">To Date</label>
                <input
                  type="date"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  value={filters.date_to || ''}
                  onChange={(e) => setFilters({ ...filters, date_to: e.target.value })}
                />
              </div>
            </div>
          </div>

          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Application</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Applicant</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Exam</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Session</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Score</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Grade</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Marker</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {loading ? (
                <tr><td colSpan={9} className="px-6 py-4 text-center text-gray-500">Loading...</td></tr>
              ) : exams.length === 0 ? (
                <tr><td colSpan={9} className="px-6 py-4 text-center text-gray-500">No exam results recorded</td></tr>
              ) : (
                exams.map((exam) => (
                  <tr key={exam.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-blue-600">{exam.application_no}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{exam.first_name} {exam.last_name}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{exam.exam_name || exam.subject_area || 'N/A'}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">{exam.session_name || 'N/A'}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(exam.exam_date).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {exam.marks_obtained}/{exam.total_marks} ({exam.percentage}%)
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getGradeColor(exam.grade)}`}>
                        {exam.grade}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {exam.marker_name || 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                      <button
                        onClick={() => handleEditExam(exam)}
                        className="text-blue-600 hover:text-blue-900"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDeleteExam(exam.id)}
                        className="text-red-600 hover:text-red-900"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Sessions Tab */}
      {activeTab === 'sessions' && (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Session Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Code</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Academic Year</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Period</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {loading ? (
                <tr><td colSpan={5} className="px-6 py-4 text-center text-gray-500">Loading...</td></tr>
              ) : sessions.length === 0 ? (
                <tr><td colSpan={5} className="px-6 py-4 text-center text-gray-500">No exam sessions created</td></tr>
              ) : (
                sessions.map((session) => (
                  <tr key={session.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{session.session_name}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">{session.session_code}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">{session.academic_year || 'N/A'}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {session.start_date && session.end_date 
                        ? `${new Date(session.start_date).toLocaleDateString()} - ${new Date(session.end_date).toLocaleDateString()}`
                        : 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        session.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                      }`}>
                        {session.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Definitions Tab */}
      {activeTab === 'definitions' && (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Exam Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Code</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Subject Area</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total Marks</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Duration</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Grading Scale</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {loading ? (
                <tr><td colSpan={6} className="px-6 py-4 text-center text-gray-500">Loading...</td></tr>
              ) : definitions.length === 0 ? (
                <tr><td colSpan={6} className="px-6 py-4 text-center text-gray-500">No exam definitions created</td></tr>
              ) : (
                definitions.map((def) => (
                  <tr key={def.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{def.exam_name}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">{def.exam_code}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">{def.subject_area || 'N/A'}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {def.total_marks}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {def.duration_minutes ? `${def.duration_minutes} min` : 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        {def.grading_scale}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal for adding/editing */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">
                {modalType === 'exam' ? 'Record Exam Result' : 
                 modalType === 'session' ? 'Create Exam Session' : 'Create Exam Definition'}
              </h2>
              <button onClick={() => setShowModal(false)} className="text-gray-500 hover:text-gray-700">✕</button>
            </div>

            {modalType === 'exam' && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Application *</label>
                  <select
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    value={examData.application_id}
                    onChange={(e) => setExamData({ ...examData, application_id: Number(e.target.value) })}
                  >
                    <option value="">Select Application</option>
                    {applications.map((app: any) => (
                      <option key={app.id} value={app.id}>
                        {app.applicantFirstName} {app.applicantLastName} - {app.application_no}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Exam Session</label>
                    <select
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                      value={examData.session_id || ''}
                      onChange={(e) => setExamData({ ...examData, session_id: e.target.value ? Number(e.target.value) : undefined })}
                    >
                      <option value="">No Session</option>
                      {sessions.map((s: any) => (
                        <option key={s.id} value={s.id}>{s.session_name}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Exam Definition</label>
                    <select
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                      value={examData.exam_definition_id || ''}
                      onChange={(e) => setExamData({ ...examData, exam_definition_id: e.target.value ? Number(e.target.value) : undefined })}
                    >
                      <option value="">Select Exam</option>
                      {definitions.map((d: any) => (
                        <option key={d.id} value={d.id}>{d.exam_name} ({d.exam_code})</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Exam Date *</label>
                    <input
                      type="date"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                      value={examData.exam_date}
                      onChange={(e) => setExamData({ ...examData, exam_date: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Exam Venue</label>
                    <input
                      type="text"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                      value={examData.exam_venue}
                      onChange={(e) => setExamData({ ...examData, exam_venue: e.target.value })}
                      placeholder="e.g., Room 101"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Total Marks *</label>
                    <input
                      type="number"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                      value={examData.total_marks}
                      onChange={(e) => setExamData({ ...examData, total_marks: Number(e.target.value) })}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Marks Obtained *</label>
                    <input
                      type="number"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                      value={examData.marks_obtained}
                      onChange={(e) => setExamData({ ...examData, marks_obtained: Number(e.target.value) })}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Grade *</label>
                    <select
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                      value={examData.grade}
                      onChange={(e) => setExamData({ ...examData, grade: e.target.value })}
                    >
                      <option value="A">A</option>
                      <option value="B">B</option>
                      <option value="C">C</option>
                      <option value="D">D</option>
                      <option value="F">F</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Supervisor</label>
                    <input
                      type="text"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                      value={examData.supervisor_name}
                      onChange={(e) => setExamData({ ...examData, supervisor_name: e.target.value })}
                      placeholder="Name"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Marker *</label>
                    <input
                      type="text"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                      value={examData.marker_name}
                      onChange={(e) => setExamData({ ...examData, marker_name: e.target.value })}
                      placeholder="Name"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Examiner</label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    value={examData.examiner_name}
                    onChange={(e) => setExamData({ ...examData, examiner_name: e.target.value })}
                    placeholder="Chief Examiner Name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Remarks</label>
                  <textarea
                    rows={2}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    value={examData.remarks}
                    onChange={(e) => setExamData({ ...examData, remarks: e.target.value })}
                  />
                </div>
              </div>
            )}

            {modalType === 'session' && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Session Name *</label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    value={sessionData.session_name}
                    onChange={(e) => setSessionData({ ...sessionData, session_name: e.target.value })}
                    placeholder="e.g., 2026 Entrance Exams - March"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Session Code *</label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    value={sessionData.session_code}
                    onChange={(e) => setSessionData({ ...sessionData, session_code: e.target.value })}
                    placeholder="e.g., ENT-2026-MAR"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Academic Year</label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    value={sessionData.academic_year}
                    onChange={(e) => setSessionData({ ...sessionData, academic_year: e.target.value })}
                    placeholder="e.g., 2026"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
                    <input
                      type="date"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                      value={sessionData.start_date}
                      onChange={(e) => setSessionData({ ...sessionData, start_date: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
                    <input
                      type="date"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                      value={sessionData.end_date}
                      onChange={(e) => setSessionData({ ...sessionData, end_date: e.target.value })}
                    />
                  </div>
                </div>
              </div>
            )}

            {modalType === 'definition' && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Exam Name *</label>
                    <input
                      type="text"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                      value={definitionData.exam_name}
                      onChange={(e) => setDefinitionData({ ...definitionData, exam_name: e.target.value })}
                      placeholder="e.g., Mathematics"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Exam Code *</label>
                    <input
                      type="text"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                      value={definitionData.exam_code}
                      onChange={(e) => setDefinitionData({ ...definitionData, exam_code: e.target.value })}
                      placeholder="e.g., MATH-001"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Subject Area</label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    value={definitionData.subject_area}
                    onChange={(e) => setDefinitionData({ ...definitionData, subject_area: e.target.value })}
                    placeholder="e.g., Sciences, Arts, Languages"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Total Marks</label>
                    <input
                      type="number"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                      value={definitionData.total_marks}
                      onChange={(e) => setDefinitionData({ ...definitionData, total_marks: Number(e.target.value) })}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Duration (minutes)</label>
                    <input
                      type="number"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                      value={definitionData.duration_minutes}
                      onChange={(e) => setDefinitionData({ ...definitionData, duration_minutes: Number(e.target.value) })}
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Grading Scale</label>
                  <select
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    value={definitionData.grading_scale}
                    onChange={(e) => setDefinitionData({ ...definitionData, grading_scale: e.target.value })}
                  >
                    <option value="A-F">A-F (A=80-100, B=70-79, etc.)</option>
                    <option value="1-9">1-9 (UK System)</option>
                    <option value="percentage">Percentage Only</option>
                    <option value="pass-fail">Pass/Fail</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                  <textarea
                    rows={2}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    value={definitionData.description}
                    onChange={(e) => setDefinitionData({ ...definitionData, description: e.target.value })}
                  />
                </div>
              </div>
            )}

            <div className="flex gap-3 mt-6">
              {modalType === 'exam' && !selectedItem ? (
                <>
                  <button
                    onClick={handleSaveExam}
                    className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                  >
                    Save & Add Another
                  </button>
                  <button
                    onClick={() => { handleSaveExam(); setShowModal(false); }}
                    className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                  >
                    Save & Done
                  </button>
                  <button
                    onClick={() => setShowModal(false)}
                    className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400"
                  >
                    Cancel
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={modalType === 'exam' ? handleSaveExam : modalType === 'session' ? handleSaveSession : handleSaveDefinition}
                    className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                  >
                    Save
                  </button>
                  <button
                    onClick={() => setShowModal(false)}
                    className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400"
                  >
                    Cancel
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EntranceExamsPage;
