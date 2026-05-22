import React, { useState, useEffect, useRef } from "react";
import { useSearchParams } from "react-router-dom";
import api from "@/utils/api.js";
import {
  GraduationCap, Printer, Download, Calendar, User, Award,
  TrendingUp, Users, Clock, BookOpen, FileText, Star, CheckCircle,
  QrCode, Mail, BarChart3, MessageSquare
} from "lucide-react";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import { QRCodeSVG } from "qrcode.react";

export function StudentReportPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const studentId = searchParams.get("studentId");
  const reportRef = useRef<HTMLDivElement>(null);

  const [classes, setClasses] = useState<any[]>([]);
  const [academicYears, setAcademicYears] = useState<any[]>([]);
  const [terms, setTerms] = useState<any[]>([]);
  const [students, setStudents] = useState<any[]>([]);
  const [selectedClass, setSelectedClass] = useState("");
  const [selectedYear, setSelectedYear] = useState("");
  const [selectedTerm, setSelectedTerm] = useState("");
  const [selectedStudentId, setSelectedStudentId] = useState<string | null>(null);
  const [report, setReport] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [showDropdown, setShowDropdown] = useState(false);
  const [showAllTerms, setShowAllTerms] = useState(false);

  useEffect(() => {
    loadClasses();
    loadAcademicYears();
  }, []);

  useEffect(() => {
    if (selectedYear) loadTerms();
    else { setTerms([]); setSelectedTerm(""); }
  }, [selectedYear]);

  useEffect(() => {
    if (selectedClass) loadClassStudents();
  }, [selectedClass]);

  const loadClasses = async () => {
    try {
      const res = await api.get("/academics/classes");
      setClasses(res.data?.data || []);
    } catch (err) { console.error("Failed to load classes", err); }
  };

  const loadAcademicYears = async () => {
    try {
      const res = await api.get("/academics/academic-years");
      setAcademicYears(res.data?.data || []);
    } catch (err) { console.error("Failed to load academic years", err); }
  };

  const loadTerms = async () => {
    try {
      const params = selectedYear ? { academic_year_id: selectedYear } : {};
      const res = await api.get("/academics/terms", { params });
      setTerms(res.data?.data || []);
    } catch (err) { console.error("Failed to load terms", err); }
  };

  const loadClassStudents = async () => {
    if (!selectedClass) return;
    try {
      const res = await api.get(`/academics/classes/${selectedClass}`);
      const classData = res.data?.data;
      setStudents(classData?.students || []);
    } catch (err) { console.error("Failed to load students", err); }
  };

  const searchStudents = (search: string) => {
    if (!search || !students.length) return students;
    const lower = search.toLowerCase();
    return students.filter((s: any) =>
      `${s.first_name} ${s.last_name}`.toLowerCase().includes(lower) ||
      String(s.admission_no).toLowerCase().includes(lower)
    );
  };

  const selectStudent = (student: any) => {
    const studentId = student.student_id || student.id;
    setSearchTerm(`${student.first_name} ${student.last_name} (${student.admission_no})`);
    setSelectedStudentId(String(studentId));
    setShowDropdown(false);
  };

  const loadReport = async (id: number) => {
    setLoading(true);
    try {
      const params: any = { student_id: id };
      if (selectedYear) params.academic_year_id = selectedYear;
      if (selectedTerm) params.term_id = selectedTerm;
      if (showAllTerms) params.include_all_terms = true;

      const res = await api.get(`/academics/assessments/student-report`, { params });
      setReport(res.data?.data);
    } catch (err: any) {
      console.error("Failed to load report", err);
      setReport(null);
    } finally { setLoading(false); }
  };

  const getGradeColor = (grade: string) => {
    const colors: Record<string, string> = {
      A: "bg-green-100 text-green-800",
      B: "bg-cyan-100 text-cyan-800",
      C: "bg-teal-100 text-teal-800",
      D: "bg-orange-100 text-orange-800",
      E: "bg-yellow-100 text-yellow-800",
      F: "bg-red-100 text-red-800",
    };
    return colors[grade] || "bg-gray-100 text-gray-800";
  };

  const getMonthName = (monthNum: number) => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return months[monthNum - 1] || '';
  };

  const handlePrint = () => window.print();

  const handleExportPDF = async () => {
    if (!reportRef.current) return;
    try {
      const canvas = await html2canvas(reportRef.current, {
        scale: 2,
        useCORS: true,
        logging: false,
      });
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save(`ReportCard_${report.student.full_name.replace(/\s+/g, '_')}_${report.term?.name || 'Term'}.pdf`);
    } catch (err) {
      console.error("Failed to export PDF:", err);
      alert("Failed to export PDF. Please try printing instead.");
    }
  };

  const handleEmailReport = async () => {
    if (!report) return;
    alert(`Report card for ${report.student.full_name} will be emailed to parents.\n\nEmail integration requires backend email service setup (SendGrid, AWS SES, etc.).\n\nFor now, please use Print or Export PDF to send manually.`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6">
      {/* Header */}
      <div className="max-w-7xl mx-auto mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-3">
              <GraduationCap className="w-8 h-8 text-teal-600" />
              Student Report Card
            </h1>
            <p className="text-slate-600 mt-2">Generate comprehensive academic performance reports</p>
          </div>
          {report && (
            <div className="flex gap-3">
              <button
                onClick={handleEmailReport}
                className="flex items-center gap-2 px-4 py-2.5 border border-blue-600 text-blue-700 rounded-lg hover:bg-blue-50 transition-all font-medium"
              >
                <Mail className="w-5 h-5" />
                Email
              </button>
              <button
                onClick={handleExportPDF}
                className="flex items-center gap-2 px-4 py-2.5 border border-teal-600 text-teal-700 rounded-lg hover:bg-teal-50 transition-all font-medium"
              >
                <Download className="w-5 h-5" />
                Export PDF
              </button>
              <button
                onClick={handlePrint}
                className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-teal-600 to-cyan-600 text-white rounded-lg hover:from-teal-700 hover:to-cyan-700 transition-all font-medium shadow-lg"
              >
                <Printer className="w-5 h-5" />
                Print Report Card
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Filters */}
      <div className="max-w-7xl mx-auto bg-white rounded-2xl shadow-lg border border-slate-200 p-6 mb-6 no-print">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">Class</label>
            <select
              value={selectedClass}
              onChange={(e) => {
                setSelectedClass(e.target.value);
                setSelectedStudentId(null);
                setStudents([]);
                setSearchTerm("");
                setReport(null);
              }}
              className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
            >
              <option value="">Select class...</option>
              {classes.map((c: any) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">Academic Year</label>
            <select
              value={selectedYear}
              onChange={(e) => {
                setSelectedYear(e.target.value);
                setSelectedTerm("");
              }}
              className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
            >
              <option value="">All Years</option>
              {academicYears.map((y: any) => (
                <option key={y.id} value={y.id}>{y.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">Term</label>
            <select
              value={selectedTerm}
              onChange={(e) => setSelectedTerm(e.target.value)}
              className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
            >
              <option value="">All Terms</option>
              {terms.map((t: any) => (
                <option key={t.id} value={t.id}>{t.name}</option>
              ))}
            </select>
          </div>

          <div className="relative">
            <label className="block text-sm font-semibold text-slate-700 mb-2">Student</label>
            <input
              type="text"
              placeholder={selectedClass ? "Search students..." : "Select class first"}
              value={searchTerm}
              onChange={(e) => { setSearchTerm(e.target.value); setShowDropdown(true); }}
              onFocus={() => setShowDropdown(true)}
              onBlur={() => setTimeout(() => setShowDropdown(false), 200)}
              disabled={!selectedClass}
              className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent disabled:bg-slate-50 disabled:cursor-not-allowed ${
                selectedStudentId ? 'border-green-400 bg-green-50' : 'border-slate-300'
              }`}
            />
            {showDropdown && selectedClass && (
              <div className="absolute z-50 w-full mt-1 bg-white border border-slate-200 rounded-lg shadow-lg max-h-60 overflow-auto">
                {searchStudents(searchTerm).map((student: any) => {
                  const studentId = student.student_id || student.id;
                  return (
                    <button
                      key={studentId}
                      onMouseDown={() => selectStudent(student)}
                      className={`w-full text-left px-4 py-3 hover:bg-teal-50 border-b border-slate-100 last:border-0 ${
                        selectedStudentId === String(studentId) ? 'bg-teal-50 border-l-4 border-l-teal-600' : ''
                      }`}
                    >
                      <div className="font-medium text-slate-900">{student.first_name} {student.last_name}</div>
                      <div className="text-sm text-slate-500">{student.admission_no}</div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          <div className="flex flex-col gap-2">
            <label className="flex items-center gap-2 text-sm text-slate-700">
              <input
                type="checkbox"
                checked={showAllTerms}
                onChange={(e) => setShowAllTerms(e.target.checked)}
                className="w-4 h-4 text-teal-600 rounded"
              />
              Show All Terms
            </label>
            <button
              onClick={() => selectedStudentId && loadReport(Number(selectedStudentId))}
              disabled={!selectedStudentId || loading}
              className="w-full py-2.5 bg-gradient-to-r from-teal-600 to-cyan-600 text-white rounded-lg hover:from-teal-700 hover:to-cyan-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
            >
              {loading ? "Generating..." : "Generate Report"}
            </button>
          </div>
        </div>
      </div>

      {/* Report Card */}
      <div className="max-w-5xl mx-auto">
        {loading && (
          <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
            <div className="w-12 h-12 border-4 border-teal-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-slate-600">Generating report card...</p>
          </div>
        )}

        {report && report.student && (
          <div ref={reportRef} className="bg-white shadow-2xl border-2 border-slate-200">
            {/* Report Header */}
            <div className="bg-gradient-to-r from-teal-600 to-cyan-600 p-8 text-white print:bg-none print:text-black print:border-b-2 print:border-black">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  {/* School Logo */}
                  <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center print:bg-gray-200 overflow-hidden">
                    {report.school?.logo_url ? (
                      <img src={report.school.logo_url} alt="School Logo" className="w-full h-full object-cover" />
                    ) : (
                      <GraduationCap className="w-10 h-10 text-white print:text-gray-700" />
                    )}
                  </div>
                  <div>
                    <h1 className="text-3xl font-bold">{report.school?.name || "Nakwero Secondary School"}</h1>
                    <p className="text-teal-100 print:text-gray-600 text-sm">{report.school?.address || "P.O. Box 123, Kampala, Uganda"}</p>
                    <p className="text-teal-100 print:text-gray-600 text-sm">Tel: {report.school?.phone || "+256 123 456 789"} | {report.school?.email || "info@nakwero.ac.ug"}</p>
                    <h2 className="text-xl font-bold mt-2">STUDENT REPORT CARD</h2>
                  </div>
                </div>
                <div className="text-right print:text-black">
                  {report.school?.logo_url && (
                    <div className="mb-2">
                      <QRCodeSVG
                        value={`${window.location.origin}/student-portal/${report.student.id}`}
                        size={80}
                        bgColor="#ffffff"
                        fgColor="#000000"
                      />
                    </div>
                  )}
                  <p className="text-teal-100 print:text-gray-600 text-sm">Academic Year: {report.academic_year?.name || "-"}</p>
                  <p className="text-teal-100 print:text-gray-600 text-sm">Term: {report.term?.name || "All Terms"}</p>
                  <p className="text-teal-100 print:text-gray-600 text-sm">Date: {new Date().toLocaleDateString()}</p>
                </div>
              </div>
            </div>

            {/* Student Info */}
            <div className="p-6 border-b-2 border-slate-200 print:border-black">
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                <div>
                  <span className="text-xs font-bold text-slate-500 uppercase">Student Name</span>
                  <p className="font-semibold text-slate-900">{report.student.full_name}</p>
                </div>
                <div>
                  <span className="text-xs font-bold text-slate-500 uppercase">Admission No</span>
                  <p className="font-semibold text-slate-900">{report.student.admission_no}</p>
                </div>
                <div>
                  <span className="text-xs font-bold text-slate-500 uppercase">Class</span>
                  <p className="font-semibold text-slate-900">{report.student.class_name}</p>
                </div>
                <div>
                  <span className="text-xs font-bold text-slate-500 uppercase">Gender</span>
                  <p className="font-semibold text-slate-900">{report.student.gender || "-"}</p>
                </div>
                <div>
                  <span className="text-xs font-bold text-slate-500 uppercase">DOB</span>
                  <p className="font-semibold text-slate-900">{report.student.date_of_birth ? new Date(report.student.date_of_birth).toLocaleDateString() : "-"}</p>
                </div>
              </div>
            </div>

            {/* Term Comparison (if showing all terms) */}
            {report.term_comparison && report.term_comparison.length > 1 && (
              <div className="p-6 bg-slate-50 print:bg-gray-100 border-b-2 border-slate-200 print:border-black">
                <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-teal-600" />
                  Term Comparison
                </h3>
                <div className="grid grid-cols-3 gap-4">
                  {report.term_comparison.map((term: any) => (
                    <div key={term.term_id} className="bg-white p-4 rounded-lg border border-slate-200 print:border-gray-400">
                      <div className="font-bold text-slate-900">{term.term_name}</div>
                      <div className="text-2xl font-bold text-teal-600">{term.term_average?.toFixed(1) || "-"}%</div>
                      <div className="text-sm text-slate-600">Term Average</div>
                    </div>
                  ))}
                </div>
                {/* Trend Chart */}
                <div className="mt-4 bg-white p-4 rounded-lg border border-slate-200 print:border-gray-400">
                  <h4 className="text-sm font-bold text-slate-700 mb-2">Performance Trend</h4>
                  <div className="flex items-end gap-2 h-32">
                    {report.term_comparison.map((term: any, idx: number) => {
                      const maxAvg = Math.max(...report.term_comparison.map((t: any) => t.term_average || 0), 1);
                      const height = ((term.term_average || 0) / maxAvg) * 100;
                      return (
                        <div key={term.term_id} className="flex-1 flex flex-col items-center">
                          <span className="text-xs font-bold text-slate-700 mb-1">{term.term_average?.toFixed(0) || 0}%</span>
                          <div
                            className={`w-full rounded-t ${height >= 70 ? 'bg-green-500' : height >= 50 ? 'bg-teal-500' : 'bg-red-500'}`}
                            style={{ height: `${Math.max(height, 4)}%` }}
                          />
                          <span className="text-xs text-slate-600 mt-1">{term.term_name}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

            {/* Academic Performance Table */}
            <div className="p-6">
              <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                <Award className="w-5 h-5 text-teal-600" />
                Academic Performance {report.term ? `- ${report.term.name}` : ''}
              </h3>

              <div className="overflow-x-auto">
                <table className="w-full border-2 border-slate-300 print:border-black">
                  <thead className="bg-slate-100 print:bg-gray-200">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-bold text-slate-700 uppercase border-r border-slate-300 print:border-black">#</th>
                      <th className="px-4 py-3 text-left text-xs font-bold text-slate-700 uppercase border-r border-slate-300 print:border-black">Subject</th>
                      <th className="px-4 py-3 text-center text-xs font-bold text-slate-700 uppercase border-r border-slate-300 print:border-black">Assignments (40%)</th>
                      <th className="px-4 py-3 text-center text-xs font-bold text-slate-700 uppercase border-r border-slate-300 print:border-black">Exams (60%)</th>
                      <th className="px-4 py-3 text-center text-xs font-bold text-slate-700 uppercase border-r border-slate-300 print:border-black">Overall</th>
                      <th className="px-4 py-3 text-center text-xs font-bold text-slate-700 uppercase border-r border-slate-300 print:border-black">Grade</th>
                      <th className="px-4 py-3 text-center text-xs font-bold text-slate-700 uppercase border-r border-slate-300 print:border-black">Class Avg</th>
                      <th className="px-4 py-3 text-left text-xs font-bold text-slate-700 uppercase">Teacher</th>
                    </tr>
                  </thead>
                  <tbody>
                    {report.subjects.map((subject: any, idx: number) => (
                      <tr key={subject.subject_id} className={idx % 2 === 0 ? 'bg-white' : 'bg-slate-50 print:bg-gray-100'}>
                        <td className="px-4 py-3 text-slate-600 font-medium border-r border-slate-200 print:border-gray-400">{idx + 1}</td>
                        <td className="px-4 py-3 font-semibold text-slate-900 border-r border-slate-200 print:border-gray-400">
                          {subject.subject_name}
                          <span className="block text-xs text-slate-500 font-normal">{subject.subject_code}</span>
                        </td>
                        <td className="px-4 py-3 text-center text-slate-600 border-r border-slate-200 print:border-gray-400">
                          {subject.assignment_average !== null ? `${subject.assignment_average.toFixed(1)}%` : "-"}
                          <span className="block text-xs text-slate-500">({subject.assignments_count} tasks)</span>
                        </td>
                        <td className="px-4 py-3 text-center text-slate-600 border-r border-slate-200 print:border-gray-400">
                          {subject.exam_average !== null ? `${subject.exam_average.toFixed(1)}%` : "-"}
                          <span className="block text-xs text-slate-500">({subject.exams_count} exams)</span>
                        </td>
                        <td className="px-4 py-3 text-center font-bold text-slate-900 border-r border-slate-200 print:border-gray-400">
                          {subject.overall_score !== null ? `${subject.overall_score.toFixed(1)}%` : "-"}
                        </td>
                        <td className="px-4 py-3 text-center border-r border-slate-200 print:border-gray-400">
                          {subject.grade_letter ? (
                            <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold ${getGradeColor(subject.grade_letter)}`}>
                              {subject.grade_letter}
                            </span>
                          ) : "-"}
                        </td>
                        <td className="px-4 py-3 text-center text-slate-600 border-r border-slate-200 print:border-gray-400">
                          {subject.class_average !== null ? `${subject.class_average.toFixed(1)}%` : "-"}
                        </td>
                        <td className="px-4 py-3 text-slate-600 text-sm">{subject.teacher_name || "-"}</td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot className="bg-slate-100 print:bg-gray-200">
                    <tr>
                      <td colSpan={4} className="px-4 py-3 text-right font-bold text-slate-900">OVERALL AVERAGE:</td>
                      <td className="px-4 py-3 text-center font-bold text-lg text-teal-700 print:text-black">
                        {report.statistics?.overall_average?.toFixed(1) || "-"}%
                      </td>
                      <td colSpan={3}></td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>

            {/* Attendance Chart */}
            {report.statistics?.attendance?.monthly_breakdown && report.statistics.attendance.monthly_breakdown.length > 0 && (
              <div className="p-6 bg-slate-50 print:bg-gray-100 border-t-2 border-slate-200 print:border-black">
                <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                  <BarChart3 className="w-5 h-5 text-teal-600" />
                  Attendance Breakdown
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="bg-white p-4 rounded-lg border border-slate-200 print:border-gray-400">
                        <div className="text-2xl font-bold text-green-600">{report.statistics.attendance.present}</div>
                        <div className="text-sm text-slate-600">Days Present</div>
                      </div>
                      <div className="bg-white p-4 rounded-lg border border-slate-200 print:border-gray-400">
                        <div className="text-2xl font-bold text-red-600">{report.statistics.attendance.absent}</div>
                        <div className="text-sm text-slate-600">Days Absent</div>
                      </div>
                      <div className="bg-white p-4 rounded-lg border border-slate-200 print:border-gray-400">
                        <div className="text-2xl font-bold text-slate-900">{report.statistics.attendance.total}</div>
                        <div className="text-sm text-slate-600">Total Days</div>
                      </div>
                      <div className="bg-white p-4 rounded-lg border border-slate-200 print:border-gray-400">
                        <div className="text-2xl font-bold text-teal-600">{report.statistics.attendance.percentage.toFixed(1)}%</div>
                        <div className="text-sm text-slate-600">Attendance Rate</div>
                      </div>
                    </div>
                  </div>
                  {/* Monthly Chart */}
                  <div className="bg-white p-4 rounded-lg border border-slate-200 print:border-gray-400">
                    <h4 className="text-sm font-bold text-slate-700 mb-2">Monthly Attendance</h4>
                    <div className="flex items-end gap-2 h-32">
                      {report.statistics.attendance.monthly_breakdown.map((m: any) => (
                        <div key={m.month} className="flex-1 flex flex-col items-center">
                          <span className="text-xs font-bold text-slate-700 mb-1">{m.percentage.toFixed(0)}%</span>
                          <div
                            className={`w-full rounded-t ${m.percentage >= 80 ? 'bg-green-500' : m.percentage >= 60 ? 'bg-teal-500' : 'bg-red-500'}`}
                            style={{ height: `${Math.max(m.percentage, 4)}%` }}
                          />
                          <span className="text-xs text-slate-600 mt-1">{getMonthName(m.month)}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Teacher Comments */}
            {report.subjects.some((s: any) => s.teacher_comments) && (
              <div className="p-6 border-t-2 border-slate-200 print:border-black">
                <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                  <MessageSquare className="w-5 h-5 text-teal-600" />
                  Subject Teacher Comments
                </h3>
                <div className="space-y-3">
                  {report.subjects.filter((s: any) => s.teacher_comments).map((subject: any) => (
                    <div key={subject.subject_id} className="p-4 bg-slate-50 print:bg-gray-100 rounded-lg border border-slate-200 print:border-gray-400">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-bold text-slate-900">{subject.subject_name}</span>
                        <span className="text-sm text-slate-600">{subject.teacher_name}</span>
                      </div>
                      <p className="text-slate-700 italic">"{typeof subject.teacher_comments === 'string' ? subject.teacher_comments : JSON.stringify(subject.teacher_comments)}"</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Summary Statistics */}
            <div className="p-6 bg-slate-50 print:bg-gray-100 border-t-2 border-slate-200 print:border-black">
              <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-teal-600" />
                Summary Statistics
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                <div className="bg-white p-4 rounded-lg border border-slate-200 print:border-gray-400">
                  <div className="text-2xl font-bold text-teal-600">{report.statistics?.total_subjects || 0}</div>
                  <div className="text-sm text-slate-600">Total Subjects</div>
                </div>
                <div className="bg-white p-4 rounded-lg border border-slate-200 print:border-gray-400">
                  <div className="text-2xl font-bold text-teal-600">{report.statistics?.total_students || 0}</div>
                  <div className="text-sm text-slate-600">Students in Class</div>
                </div>
                <div className="bg-white p-4 rounded-lg border border-slate-200 print:border-gray-400">
                  <div className="text-2xl font-bold text-green-600">{report.statistics?.attendance?.percentage?.toFixed(1) || 0}%</div>
                  <div className="text-sm text-slate-600">Attendance</div>
                </div>
                <div className="bg-white p-4 rounded-lg border border-slate-200 print:border-gray-400">
                  <div className="text-2xl font-bold text-teal-600">{report.statistics?.scored_subjects || 0}/{report.statistics?.total_subjects || 0}</div>
                  <div className="text-sm text-slate-600">Subjects Graded</div>
                </div>
                <div className="bg-white p-4 rounded-lg border border-slate-200 print:border-gray-400">
                  <div className="text-2xl font-bold text-teal-600">{report.grading_scale?.E ? '6' : '5'}</div>
                  <div className="text-sm text-slate-600">Grade Scale</div>
                </div>
              </div>
            </div>

            {/* Grading Scale */}
            <div className="p-6 border-t-2 border-slate-200 print:border-black">
              <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                <Star className="w-5 h-5 text-teal-600" />
                Grading Scale
              </h3>
              <div className="grid grid-cols-5 md:grid-cols-6 gap-4">
                {Object.entries(report.grading_scale || {}).map(([grade, data]: [string, any]) => (
                  <div key={grade} className={`p-3 rounded-lg border-2 text-center ${getGradeColor(grade)} print:border-gray-400`}>
                    <div className="text-2xl font-bold">{grade}</div>
                    <div className="text-sm font-semibold">{data.min}-{data.max}%</div>
                    <div className="text-xs mt-1">{data.description}</div>
                    {data.point !== undefined && <div className="text-xs mt-1 font-bold">{data.point} pts</div>}
                  </div>
                ))}
              </div>
            </div>

            {/* Teacher Comments */}
            <div className="p-6 border-t-2 border-slate-200 print:border-black">
              <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                <FileText className="w-5 h-5 text-teal-600" />
                Teacher's Comments
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">Class Teacher's Comment:</label>
                  <div className="p-4 border-2 border-slate-200 rounded-lg min-h-[80px] print:border-gray-400">
                    <p className="text-slate-700 italic">
                      {report.class_teacher_comment || "_________________________________________________"}
                    </p>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">Head Teacher's Comment:</label>
                  <div className="p-4 border-2 border-slate-200 rounded-lg min-h-[80px] print:border-gray-400">
                    <p className="text-slate-700 italic">
                      {report.head_teacher_comment || "_________________________________________________"}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Next Term Info */}
            {report.next_term && (
              <div className="p-6 bg-teal-50 print:bg-gray-100 border-t-2 border-slate-200 print:border-black">
                <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-teal-600" />
                  Next Term Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-white p-4 rounded-lg border border-slate-200 print:border-gray-400">
                    <div className="text-sm text-slate-600">Next Term</div>
                    <div className="text-xl font-bold text-teal-700">{report.next_term.name}</div>
                  </div>
                  <div className="bg-white p-4 rounded-lg border border-slate-200 print:border-gray-400">
                    <div className="text-sm text-slate-600">Opening Date</div>
                    <div className="text-xl font-bold text-teal-700">
                      {report.next_term.start_date ? new Date(report.next_term.start_date).toLocaleDateString() : "TBA"}
                    </div>
                  </div>
                  <div className="bg-white p-4 rounded-lg border border-slate-200 print:border-gray-400">
                    <div className="text-sm text-slate-600">Closing Date</div>
                    <div className="text-xl font-bold text-teal-700">
                      {report.next_term.end_date ? new Date(report.next_term.end_date).toLocaleDateString() : "TBA"}
                    </div>
                  </div>
                </div>
                <div className="mt-4 bg-white p-4 rounded-lg border border-slate-200 print:border-gray-400">
                  <div className="text-sm text-slate-600 mb-2">Fees Balance: <span className="font-bold text-red-600">_______________</span></div>
                  <div className="text-sm text-slate-600">Requirements: <span className="font-bold text-slate-900">_________________________________________________</span></div>
                </div>
              </div>
            )}

            {/* Signatures */}
            <div className="p-6 border-t-2 border-slate-200 print:border-black bg-slate-50 print:bg-gray-100">
              <div className="grid grid-cols-3 gap-8">
                <div className="text-center">
                  <div className="border-b-2 border-slate-400 mb-2 h-16"></div>
                  <p className="text-sm font-bold text-slate-700">Class Teacher's Signature</p>
                  <p className="text-xs text-slate-500">Date: _______________</p>
                </div>
                <div className="text-center">
                  <div className="border-b-2 border-slate-400 mb-2 h-16"></div>
                  <p className="text-sm font-bold text-slate-700">Head Teacher's Signature</p>
                  <p className="text-xs text-slate-500">Date: _______________</p>
                </div>
                <div className="text-center">
                  <div className="border-b-2 border-slate-400 mb-2 h-16"></div>
                  <p className="text-sm font-bold text-slate-700">Parent/Guardian's Signature</p>
                  <p className="text-xs text-slate-500">Date: _______________</p>
                </div>
              </div>
            </div>

            {/* Footer with QR Code */}
            <div className="p-4 bg-teal-600 text-white text-center text-sm print:bg-gray-200 print:text-black print:border-t-2 print:border-black">
              <div className="flex items-center justify-center gap-4">
                <div className="bg-white p-2 rounded">
                  <QRCodeSVG
                    value={`${window.location.origin}/student-portal/${report.student.id}`}
                    size={60}
                    bgColor="#ffffff"
                    fgColor="#000000"
                  />
                </div>
                <div>
                  <p className="font-semibold">Scan to view online report | Next Term Opens: {report.next_term?.start_date ? new Date(report.next_term.start_date).toLocaleDateString() : "TBA"} | Fees Balance: _______________</p>
                  <p className="text-teal-100 print:text-gray-600 mt-1">{report.school?.name || "Nakwero Secondary School"} - Excellence in Education</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {!report && !loading && (
          <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-12 text-center">
            <GraduationCap className="w-16 h-16 mx-auto mb-4 text-slate-300" />
            <h3 className="text-lg font-semibold text-slate-800 mb-2">Select a Student</h3>
            <p className="text-slate-600">Choose a class, select academic year and term, then search and select a student to generate their report card.</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default StudentReportPage;
