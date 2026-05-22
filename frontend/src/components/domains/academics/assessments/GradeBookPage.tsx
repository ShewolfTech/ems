import React, { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Download, Users, BarChart3, TrendingUp, Filter, BookOpen, Award, FileCheck } from "lucide-react";
import api from "@/utils/api.js";

interface UnifiedGradeBookData {
  gradedItems: Array<{
    item_type: 'assessment' | 'exam' | 'assignment';
    item_id: number;
    item_title: string;
    subject_id: number | null;
    item_date: string;
    max_score: number;
    weight: number;
  }>;
  students: Array<{
    student_id: number;
    student_name: string;
    admission_no: string;
    items: Record<number, {
      score: number;
      max_score: number;
      grade_letter: string | null;
      grade_point: number | null;
      percentage: number;
    }>;
  }>;
  stats: {
    totalStudents: number;
    totalItems: number;
    classAverage: number | null;
  };
}

const TYPE_ICONS: Record<string, { icon: React.ReactNode; color: string; label: string }> = {
  assessment: { icon: <BookOpen className="w-3 h-3" />, color: "bg-teal-100 text-teal-700", label: "Assessment" },
  exam: { icon: <Award className="w-3 h-3" />, color: "bg-teal-100 text-teal-700", label: "Exam" },
  assignment: { icon: <FileCheck className="w-3 h-3" />, color: "bg-cyan-100 text-cyan-700", label: "Assignment" },
};

export function GradeBookPage() {
  const navigate = useNavigate();
  const [gradeBook, setGradeBook] = useState<UnifiedGradeBookData | null>(null);
  const [classes, setClasses] = useState<any[]>([]);
  const [terms, setTerms] = useState<any[]>([]);
  const [students, setStudents] = useState<any[]>([]);
  const [selectedClass, setSelectedClass] = useState("");
  const [selectedStudent, setSelectedStudent] = useState("");
  const [studentSearch, setStudentSearch] = useState("");
  const [showStudentDropdown, setShowStudentDropdown] = useState(false);
  const [selectedTerm, setSelectedTerm] = useState("");
  const [selectedType, setSelectedType] = useState("");
  const [selectedItem, setSelectedItem] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadDropdowns();
  }, []);

  useEffect(() => {
    if (selectedClass) {
      loadGradeBook();
      loadClassStudents();
    }
  }, [selectedClass, selectedTerm, selectedType, dateFrom, dateTo, selectedStudent]);

  const loadDropdowns = async () => {
    try {
      const [classesRes, termsRes] = await Promise.all([
        api.get("/academics/classes"),
        api.get("/academics/terms"),
      ]);
      setClasses(classesRes.data?.data || []);
      setTerms(termsRes.data?.data || []);
    } catch (err) {
      console.error("Failed to load dropdowns", err);
    }
  };

  const loadClassStudents = async () => {
    if (!selectedClass) return;
    try {
      const classRes = await api.get(`/academics/classes/${selectedClass}`);
      const classData = classRes.data?.data;
      setStudents(classData?.students || []);
    } catch (err) {
      console.error("Failed to load students", err);
    }
  };

  const filteredStudents = useMemo(() => {
    if (!studentSearch) return students;
    const search = studentSearch.toLowerCase();
    return students.filter((s: any) =>
      `${s.first_name} ${s.last_name}`.toLowerCase().includes(search) ||
      (s.admission_no && String(s.admission_no).toLowerCase().includes(search))
    );
  }, [students, studentSearch]);

  const selectStudent = (student: any) => {
    const sId = student.student_id || student.id;
    setSelectedStudent(sId);
    setStudentSearch(`${student.first_name} ${student.last_name}`);
    setShowStudentDropdown(false);
  };

  const clearStudentFilter = () => {
    setSelectedStudent("");
    setStudentSearch("");
    setShowStudentDropdown(false);
  };

  const selectedStudentName = useMemo(() => {
    if (!selectedStudent || !gradeBook?.students) return null;
    const s = gradeBook.students.find((st: any) => String(st.student_id || st.id) === String(selectedStudent));
    return s ? s.student_name : null;
  }, [selectedStudent, gradeBook]);

  const gradeDistributionTitle = useMemo(() => {
    if (selectedStudentName && selectedType === 'assessment') return `${selectedStudentName} — Assessment Grades`;
    if (selectedStudentName && selectedType === 'exam') return `${selectedStudentName} — Exam Grades`;
    if (selectedStudentName && selectedType === 'assignment') return `${selectedStudentName} — Assignment Grades`;
    if (selectedStudentName) return `${selectedStudentName} — All Grades`;
    if (selectedType === 'assessment') return 'Class — Assessment Grade Distribution';
    if (selectedType === 'exam') return 'Class — Exam Grade Distribution';
    if (selectedType === 'assignment') return 'Class — Assignment Grade Distribution';
    return 'Class — Grade Distribution';
  }, [selectedStudentName, selectedType]);

  const trendTitle = useMemo(() => {
    if (selectedStudentName && selectedType === 'assessment') return `${selectedStudentName} vs Class — Assessments`;
    if (selectedStudentName && selectedType === 'exam') return `${selectedStudentName} vs Class — Exams`;
    if (selectedStudentName && selectedType === 'assignment') return `${selectedStudentName} vs Class — Assignments`;
    if (selectedStudentName) return `${selectedStudentName} vs Class — Performance`;
    if (selectedType === 'assessment') return 'Class Average — Assessments';
    if (selectedType === 'exam') return 'Class Average — Exams';
    if (selectedType === 'assignment') return 'Class Average — Assignments';
    return 'Class Average Trend';
  }, [selectedStudentName, selectedType]);

  const loadGradeBook = async () => {
    if (!selectedClass) return;
    setLoading(true);
    try {
      const params: any = { class_id: selectedClass };
      if (selectedTerm) params.term_id = selectedTerm;
      if (selectedStudent) params.student_id = selectedStudent;
      if (selectedType) params.type = selectedType;
      if (dateFrom) params.date_from = dateFrom;
      if (dateTo) params.date_to = dateTo;

      const { data } = await api.get("/academics/assessments/unified-gradebook", { params });
      let filteredData = data.data;

      if (selectedItem) {
        filteredData = {
          ...filteredData,
          gradedItems: filteredData.gradedItems.filter((item: any) => String(item.item_id) === String(selectedItem)),
        };
      }

      setGradeBook(filteredData);
    } catch (err) {
      console.error("Failed to load grade book", err);
    } finally {
      setLoading(false);
    }
  };

  const exportCSV = () => {
    if (!gradeBook) return;
    const headers = ["Student", "Admission No.", ...gradeBook.gradedItems.map(i => `${i.item_title} (${TYPE_ICONS[i.item_type].label})`)];
    const rows = gradeBook.students.map(s => [
      s.student_name,
      s.admission_no || "—",
      ...gradeBook.gradedItems.map(item => {
        const itemKey = `${item.item_type}_${item.item_id}`;
        const result = s.items[itemKey];
        return result ? `${result.score}/${result.max_score} (${result.grade_letter || "-"})` : "—";
      }),
    ]);
    const csvContent = [headers, ...rows].map(row => row.join(",")).join("\n");
    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `gradebook_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const getGradeColor = (percentage: number | null) => {
    if (percentage === null) return "";
    if (percentage >= 90) return "bg-green-100 text-green-800";
    if (percentage >= 70) return "bg-cyan-100 text-cyan-800";
    if (percentage >= 50) return "bg-teal-100 text-teal-800";
    return "bg-red-100 text-red-800";
  };

  const gradeDistribution = useMemo(() => {
    if (!gradeBook) return { A: 0, B: 0, C: 0, D: 0, E: 0, F: 0 };
    const dist = { A: 0, B: 0, C: 0, D: 0, E: 0, F: 0 };
    
    // Filter students based on selection
    const studentsToCount = selectedStudent 
      ? gradeBook.students.filter(s => String(s.student_id) === String(selectedStudent))
      : gradeBook.students;
    
    for (const student of studentsToCount) {
      for (const item of gradeBook.gradedItems) {
        const itemKey = `${item.item_type}_${item.item_id}`;
        const result = student.items[itemKey];
        if (result?.grade_letter) {
          const grade = result.grade_letter.toUpperCase();
          if (grade in dist) dist[grade as keyof typeof dist]++;
        }
      }
    }
    return dist;
  }, [gradeBook, selectedStudent]);

  const classTrend = useMemo(() => {
    if (!gradeBook || gradeBook.gradedItems.length === 0) return [];

    return gradeBook.gradedItems.map(item => {
      const itemKey = `${item.item_type}_${item.item_id}`;
      let total = 0, count = 0;

      for (const student of gradeBook.students) {
        const result = student.items[itemKey];
        if (result?.percentage !== null && result?.percentage !== undefined) {
          total += result.percentage;
          count++;
        }
      }

      const classAvg = count > 0 ? total / count : 0;

      let studentScore: number | null = null;
      if (selectedStudent) {
        const student = gradeBook.students.find(s => String(s.student_id) === String(selectedStudent));
        if (student) {
          const result = student.items[itemKey];
          if (result?.percentage !== null && result?.percentage !== undefined) {
            studentScore = result.percentage;
          }
        }
      }

      return {
        title: item.item_title,
        type: item.item_type,
        date: item.item_date,
        classAverage: classAvg,
        studentScore: studentScore,
      };
    });
  }, [gradeBook, selectedStudent]);

  const maxGradeCount = Math.max(...Object.values(gradeDistribution), 1);

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <button onClick={() => navigate(-1)} className="p-2 hover:bg-white rounded-lg">
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-2xl font-bold text-gray-800">Grade Book</h1>
              <p className="text-sm text-gray-500">Unified view of assessments, exams, and assignments</p>
            </div>
          </div>
          {gradeBook && (
            <button onClick={exportCSV} className="px-4 py-2 bg-teal-600 text-white rounded-md hover:bg-teal-700 flex items-center gap-2">
              <Download className="w-4 h-4" /> Export CSV
            </button>
          )}
        </div>

        <div className="bg-white rounded-lg shadow p-4 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Class</label>
              <select value={selectedClass} onChange={(e) => { setSelectedClass(e.target.value); setSelectedStudent(""); }} className="w-full px-3 py-2 border border-gray-300 rounded-md">
                <option value="">Select class...</option>
                {classes.map(c => (<option key={c.id} value={c.id}>{c.name} ({c.code})</option>))}
              </select>
            </div>
            <div className="relative">
              <label className="block text-sm font-medium text-gray-700 mb-2">Student</label>
              <div className="flex items-center gap-1">
                <input
                  type="text"
                  value={studentSearch}
                  onChange={(e) => { setStudentSearch(e.target.value); setShowStudentDropdown(true); }}
                  onFocus={() => setShowStudentDropdown(true)}
                  onBlur={() => setTimeout(() => setShowStudentDropdown(false), 200)}
                  placeholder="Search students..."
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm"
                />
                {selectedStudent && (
                  <button onClick={clearStudentFilter} className="p-2 text-gray-400 hover:text-gray-600" title="Clear filter">✕</button>
                )}
              </div>
              {showStudentDropdown && filteredStudents.length > 0 && (
                <div className="absolute z-50 mt-1 w-full bg-white border border-gray-200 rounded-md shadow-lg max-h-48 overflow-auto">
                  <div
                    key="all"
                    onClick={() => clearStudentFilter()}
                    className={`px-3 py-2 text-sm cursor-pointer hover:bg-gray-100 ${!selectedStudent ? 'bg-teal-50 text-teal-700 font-medium' : ''}`}
                  >
                    All Students
                  </div>
                  {filteredStudents.map((s: any) => (
                    <div
                      key={s.student_id}
                      onClick={() => selectStudent(s)}
                      className={`px-3 py-2 text-sm cursor-pointer hover:bg-gray-100 flex justify-between ${selectedStudent === s.student_id ? 'bg-teal-50 text-teal-700 font-medium' : ''}`}
                    >
                      <span>{s.first_name} {s.last_name}</span>
                      <span className="text-gray-400 text-xs">{s.admission_no || ''}</span>
                    </div>
                  ))}
                </div>
              )}
              {showStudentDropdown && filteredStudents.length === 0 && studentSearch && (
                <div className="absolute z-50 mt-1 w-full bg-white border border-gray-200 rounded-md shadow-lg p-3 text-sm text-gray-500">
                  No students match "{studentSearch}"
                </div>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Type</label>
              <select value={selectedType} onChange={(e) => setSelectedType(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-md">
                <option value="">All Types</option>
                <option value="assessment">📝 Assessments</option>
                <option value="exam">🎓 Exams</option>
                <option value="assignment">📋 Assignments</option>
              </select>
            </div>
          </div>

          <button onClick={() => setShowFilters(!showFilters)} className="flex items-center gap-2 text-sm text-teal-600 hover:text-teal-700 mb-3">
            <Filter className="w-4 h-4" /> {showFilters ? 'Hide' : 'Show'} Advanced Filters
          </button>

          {showFilters && (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 pt-3 border-t">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Specific Item</label>
                <select value={selectedItem} onChange={(e) => setSelectedItem(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-md">
                  <option value="">All Items</option>
                  {gradeBook?.gradedItems.map(item => (
                    <option key={item.item_id} value={item.item_id}>{item.item_title}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Term</label>
                <select value={selectedTerm} onChange={(e) => setSelectedTerm(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-md">
                  <option value="">All terms</option>
                  {terms.map(t => (<option key={t.id} value={t.id}>{t.name} ({t.code})</option>))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">From Date</label>
                <input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-md" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">To Date</label>
                <input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-md" />
              </div>
            </div>
          )}
        </div>

        {loading && (
          <div className="flex items-center justify-center py-12">
            <div className="w-8 h-8 border-4 border-teal-600 border-t-transparent rounded-full animate-spin" />
            <span className="ml-3 text-gray-500">Loading grade book...</span>
          </div>
        )}

        {!loading && gradeBook && gradeBook.gradedItems.length > 0 && (
          <div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
              <div className="bg-white rounded-lg shadow p-4">
                <div className="flex items-center gap-2 mb-4">
                  <BarChart3 className="w-5 h-5 text-gray-500" />
                  <h3 className="text-sm font-semibold text-gray-800">{gradeDistributionTitle}</h3>
                </div>
                <div className="flex items-end gap-3 h-32">
                  {Object.entries(gradeDistribution).map(([grade, count]) => (
                    <div key={grade} className="flex-1 flex flex-col items-center" title={`${count} grade(s) of ${grade}`}>
                      <span className="text-xs font-bold text-gray-600 mb-1">{count}</span>
                      <div className={`w-full rounded-t ${grade === 'A' ? 'bg-green-500' : grade === 'B' ? 'bg-cyan-500' : grade === 'C' ? 'bg-teal-500' : grade === 'D' ? 'bg-orange-500' : grade === 'E' ? 'bg-red-400' : 'bg-red-600'}`} style={{ height: `${(count / maxGradeCount) * 100}%`, minHeight: count > 0 ? '8px' : '2px' }} />
                      <span className="text-xs font-semibold text-gray-500 mt-1">{grade}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-white rounded-lg shadow p-4">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-gray-500" />
                    <h3 className="text-sm font-semibold text-gray-800">{trendTitle}</h3>
                  </div>
                  {selectedStudent && (
                    <div className="flex gap-3 text-xs">
                      <span className="flex items-center gap-1"><span className="w-2 h-2 bg-teal-500 rounded-full"></span> Class</span>
                      <span className="flex items-center gap-1"><span className="w-2 h-2 bg-cyan-500 rounded-full"></span> Student</span>
                    </div>
                  )}
                </div>
                <div className="flex items-end gap-2 h-32">
                  {classTrend.map((t, idx) => (
                    <div key={idx} className="flex-1 flex flex-col items-center relative" title={`${t.title}: Class ${t.classAverage.toFixed(1)}% | Student ${t.studentScore !== null ? t.studentScore.toFixed(1) + '%' : 'N/A'}`}>
                      <span className="text-[9px] font-bold text-gray-600 mb-0.5">
                        {t.studentScore !== null ? t.studentScore.toFixed(0) : t.classAverage.toFixed(0)}%
                      </span>
                      <div className="flex items-end gap-1 w-full justify-center">
                        <div className={`w-1/3 rounded-t ${t.classAverage >= 70 ? 'bg-teal-500' : t.classAverage >= 50 ? 'bg-teal-400' : 'bg-teal-300'}`} style={{ height: `${t.classAverage}%`, minHeight: '4px' }} />
                        {selectedStudent && t.studentScore !== null && (
                          <div className={`w-1/3 rounded-t ${t.studentScore >= 70 ? 'bg-cyan-500' : t.studentScore >= 50 ? 'bg-cyan-400' : 'bg-cyan-300'}`} style={{ height: `${t.studentScore}%`, minHeight: '4px' }} />
                        )}
                      </div>
                      <span className="text-[9px] text-gray-500 mt-0.5 truncate w-full text-center" title={t.title}>{t.title.substring(0, 8)}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {!loading && gradeBook && gradeBook.gradedItems.length === 0 && (
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <BookOpen className="w-16 h-16 mx-auto mb-4 text-gray-300" />
            <h3 className="text-xl font-bold text-gray-800 mb-2">No Graded Items Found</h3>
            <p className="text-gray-500 mb-6 max-w-md mx-auto">
              There are no assessments, exams, or assignments recorded for this class yet.
              Start by creating an assessment to see data here.
            </p>
            <button
              onClick={() => navigate("/academics/assessments")}
              className="px-4 py-2 bg-gradient-to-r from-teal-600 to-cyan-600 text-white rounded-md hover:from-teal-700 hover:to-cyan-700"
            >
              Go to Assessments
            </button>
          </div>
        )}

        {!loading && gradeBook && gradeBook.gradedItems.length > 0 && gradeBook.students.length > 0 && (
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="overflow-auto max-h-[calc(100vh-400px)]">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b sticky top-0 z-30">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider sticky left-0 bg-gray-50 z-40 border-r w-16 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)]">#</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider sticky left-[4rem] bg-gray-50 z-40 border-r min-w-[200px] shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)]">Student</th>
                    {gradeBook.gradedItems.map((item, itemIdx) => {
                      const typeInfo = TYPE_ICONS[item.item_type];
                      return (
                        <th key={`${item.item_type}-${item.item_id}-${itemIdx}`} className="px-4 py-3 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider min-w-[120px]">
                          <div className="flex flex-col items-center gap-0.5">
                            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] ${typeInfo.color}`}>
                              {typeInfo.icon} {item.item_title}
                            </span>
                            <span className="text-[10px] text-gray-400 font-normal">/{item.max_score}</span>
                          </div>
                        </th>
                      );
                    })}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {gradeBook.students
                    .filter(student => {
                      return !selectedStudent || String(student.student_id) === String(selectedStudent);
                    })
                    .map((student, idx) => (
                    <tr key={`student-${student.student_id}-${idx}`} className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-sm text-gray-500 sticky left-0 bg-white z-10 border-r shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)]">{idx + 1}</td>
                      <td className="px-4 py-3 sticky left-[4rem] bg-white z-10 border-r min-w-[200px] shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)]">
                        <button onClick={() => navigate(`/academics/student-report?studentId=${student.student_id}`)} className="text-left hover:text-teal-600 transition-colors">
                          <div className="text-sm font-medium text-gray-900">{student.student_name}</div>
                          <div className="text-xs text-gray-500">{student.admission_no || "—"}</div>
                        </button>
                      </td>
                      {gradeBook.gradedItems.map((item, itemIdx) => {
                        const itemKey = `${item.item_type}_${item.item_id}`;
                        const result = student.items[itemKey];
                        return (
                          <td key={`cell-${itemKey}-${itemIdx}`} className="px-4 py-3 text-center">
                            {result ? (
                              <span className={`inline-block px-2 py-1 rounded-full text-xs font-bold ${getGradeColor(result.percentage)}`}>
                                {result.score}/{result.max_score} ({result.grade_letter || "-"})
                              </span>
                            ) : (
                              <span className="text-gray-400 text-xs">—</span>
                            )}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="bg-gray-50 px-4 py-3 border-t text-sm text-gray-500 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Users className="w-4 h-4 inline" /> {gradeBook.stats.totalStudents} students
                <span className="text-gray-300">|</span>
                <BookOpen className="w-4 h-4 inline" /> {gradeBook.stats.totalItems} graded items
              </div>
              {gradeBook.stats.classAverage && (
                <div className="font-semibold">Class Average: {gradeBook.stats.classAverage.toFixed(1)}%</div>
              )}
            </div>
          </div>
        )}

        {!loading && gradeBook && gradeBook.students.length === 0 && (
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <Users className="w-12 h-12 mx-auto mb-4 text-gray-300" />
            <p className="text-gray-500">No students enrolled in this class.</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default GradeBookPage;