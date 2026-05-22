import React, { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Download, TrendingUp, TrendingDown, Minus, Award, Users } from "lucide-react";
import api from "@/utils/api.js";

interface StudentReport {
  student_id: number;
  student_name: string;
  admission_no: string;
  class_name: string;
  assessments: Array<{
    id: number;
    title: string;
    score: number | null;
    max_score: number;
    grade_letter: string | null;
    grade_point: number | null;
    percentage: number | null;
    date: string;
    weight: number;
  }>;
  overall_average: number | null;
  total_assessments: number;
  completed_assessments: number;
  highest_score: number | null;
  lowest_score: number | null;
  trend: 'improving' | 'declining' | 'stable';
}

export function StudentReportPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const studentId = searchParams.get("studentId");
  const [report, setReport] = useState<StudentReport | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (studentId) loadReport();
  }, [studentId]);

  const loadReport = async () => {
    setLoading(true);
    try {
      const { data } = await api.get(`/academics/assessments/student-report?student_id=${studentId}`);
      setReport(data.data);
    } catch (err) {
      console.error("Failed to load report", err);
    } finally {
      setLoading(false);
    }
  };

  const exportPDF = () => {
    if (!report) return;
    const content = `
STUDENT PERFORMANCE REPORT
==========================
Student: ${report.student_name}
Admission No: ${report.admission_no}
Class: ${report.class_name}

ASSESSMENT RESULTS
==================
${report.assessments.map(a => `${a.title}: ${a.score !== null ? a.score + '/' + a.max_score + ' (' + a.grade_letter + ')' : 'N/A'}`).join('\n')}

SUMMARY
=======
Overall Average: ${report.overall_average ? report.overall_average.toFixed(1) + '%' : 'N/A'}
Total Assessments: ${report.total_assessments}
Completed: ${report.completed_assessments}
Highest Score: ${report.highest_score !== null ? report.highest_score + '%' : 'N/A'}
Lowest Score: ${report.lowest_score !== null ? report.lowest_score + '%' : 'N/A'}
    `;
    const blob = new Blob([content], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${report.student_name.replace(/\s+/g, '_')}_report.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'improving': return <TrendingUp className="w-4 h-4 text-green-600" />;
      case 'declining': return <TrendingDown className="w-4 h-4 text-red-600" />;
      default: return <Minus className="w-4 h-4 text-gray-400" />;
    }
  };

  const getGradeColor = (percentage: number | null) => {
    if (percentage === null) return "bg-gray-100 text-gray-400";
    if (percentage >= 90) return "bg-green-100 text-green-800";
    if (percentage >= 70) return "bg-blue-100 text-blue-800";
    if (percentage >= 50) return "bg-yellow-100 text-yellow-800";
    return "bg-red-100 text-red-800";
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-teal-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-500">Loading report...</p>
        </div>
      </div>
    );
  }

  if (!report) {
    return (
      <div className="min-h-screen bg-gray-100">
        <div className="p-6">
          <div className="flex items-center gap-4 mb-6">
            <button onClick={() => navigate(-1)} className="p-2 hover:bg-white rounded-lg">
              <ArrowLeft className="w-5 h-5" />
            </button>
            <h1 className="text-2xl font-bold text-gray-800">Student Report</h1>
          </div>
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <Award className="w-12 h-12 mx-auto mb-4 text-gray-300" />
            <p className="text-gray-500">Select a student to view their report.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <button onClick={() => navigate(-1)} className="p-2 hover:bg-white rounded-lg">
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-2xl font-bold text-gray-800">Student Performance Report</h1>
              <p className="text-sm text-gray-500">{report.student_name} • {report.class_name}</p>
            </div>
          </div>
          <button
            onClick={exportPDF}
            className="px-4 py-2 bg-teal-600 text-white rounded-md hover:bg-teal-700 flex items-center gap-2"
          >
            <Download className="w-4 h-4" /> Export
          </button>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
          <div className="bg-white rounded-lg shadow p-4">
            <p className="text-sm text-gray-500">Overall Average</p>
            <p className="text-2xl font-bold text-gray-800">
              {report.overall_average ? `${report.overall_average.toFixed(1)}%` : "—"}
            </p>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <p className="text-sm text-gray-500">Completed</p>
            <p className="text-2xl font-bold text-blue-600">
              {report.completed_assessments}/{report.total_assessments}
            </p>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <p className="text-sm text-gray-500">Highest</p>
            <p className="text-2xl font-bold text-green-600">
              {report.highest_score !== null ? `${report.highest_score}%` : "—"}
            </p>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <p className="text-sm text-gray-500">Lowest</p>
            <p className="text-2xl font-bold text-red-600">
              {report.lowest_score !== null ? `${report.lowest_score}%` : "—"}
            </p>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <p className="text-sm text-gray-500">Trend</p>
            <div className="flex items-center gap-2">
              {getTrendIcon(report.trend)}
              <span className="text-lg font-bold capitalize">{report.trend}</span>
            </div>
          </div>
        </div>

        {/* Assessment Results Table */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="p-4 border-b">
            <h3 className="text-lg font-semibold text-gray-800">Assessment Results</h3>
          </div>
          <div className="overflow-auto max-h-[60vh]">
            <table className="w-full">
              <thead className="bg-gray-50 border-b sticky top-0 z-10">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">#</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Assessment</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Date</th>
                  <th className="px-4 py-3 text-center text-xs font-semibold text-gray-500 uppercase">Score</th>
                  <th className="px-4 py-3 text-center text-xs font-semibold text-gray-500 uppercase">Grade</th>
                  <th className="px-4 py-3 text-center text-xs font-semibold text-gray-500 uppercase">%</th>
                  <th className="px-4 py-3 text-center text-xs font-semibold text-gray-500 uppercase">Weight</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {report.assessments.map((a, idx) => (
                  <tr key={a.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm text-gray-500">{idx + 1}</td>
                    <td className="px-4 py-3 text-sm font-medium text-gray-900">{a.title}</td>
                    <td className="px-4 py-3 text-sm text-gray-500">
                      {a.date ? new Date(a.date).toLocaleDateString() : "—"}
                    </td>
                    <td className="px-4 py-3 text-center">
                      {a.score !== null ? (
                        <span className="text-sm font-medium">{a.score}/{a.max_score}</span>
                      ) : (
                        <span className="text-gray-400 text-sm">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-center">
                      {a.grade_letter ? (
                        <span className={`inline-block px-2 py-1 rounded-full text-xs font-bold ${getGradeColor(a.percentage)}`}>
                          {a.grade_letter}
                        </span>
                      ) : (
                        <span className="text-gray-400 text-sm">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-center">
                      {a.percentage !== null ? (
                        <span className={`text-sm font-bold ${
                          a.percentage >= 70 ? 'text-green-600' : a.percentage >= 50 ? 'text-yellow-600' : 'text-red-600'
                        }`}>
                          {a.percentage.toFixed(1)}%
                        </span>
                      ) : (
                        <span className="text-gray-400 text-sm">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-center text-sm text-gray-500">{a.weight}x</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

export default StudentReportPage;
