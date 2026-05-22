import { useState, useEffect, useCallback } from "react";
import { getStudentReport, getStudentsForReport, getClassesForReport, getAcademicYearsForReport, getTermsForReport } from "../services.js";

export function useStudentReport({ autoFetch = true, params }: any = {}) {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadReport = useCallback(async (queryParams?: any) => {
    setLoading(true);
    setError(null);
    try {
      const response = await getStudentReport(queryParams || params);
      setData(response.data?.data || response.data);
    } catch (err: any) {
      setError(err.response?.data?.error || err.message || "Failed to load report");
    } finally {
      setLoading(false);
    }
  }, [params]);

  useEffect(() => {
    if (autoFetch && params?.student_id) {
      loadReport();
    }
  }, [autoFetch, params?.student_id, loadReport]);

  const reload = useCallback(() => {
    if (params?.student_id) {
      loadReport();
    }
  }, [params?.student_id, loadReport]);

  return { data, loading, error, reload };
}

export function useStudentReportOptions() {
  const [classes, setClasses] = useState<any[]>([]);
  const [academicYears, setAcademicYears] = useState<any[]>([]);
  const [terms, setTerms] = useState<any[]>([]);
  const [students, setStudents] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const loadOptions = useCallback(async () => {
    setLoading(true);
    try {
      const [classesRes, yearsRes] = await Promise.all([
        getClassesForReport().catch(err => {
          console.warn("Failed to load classes, using fallback:", err);
          return { data: { data: [] } };
        }),
        getAcademicYearsForReport().catch(err => {
          console.warn("Failed to load academic years, using fallback:", err);
          return { data: { data: [] } };
        }),
      ]);
      // Handle both response formats: { success: true, data: [...] } or direct array
      const classesData = classesRes.data?.data || classesRes.data || classesRes || [];
      const yearsData = yearsRes.data?.data || yearsRes.data || yearsRes || [];
      setClasses(Array.isArray(classesData) ? classesData : []);
      setAcademicYears(Array.isArray(yearsData) ? yearsData : []);
    } catch (err) {
      console.error("Failed to load options:", err);
      // Fallback to empty arrays on error
      setClasses([]);
      setAcademicYears([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const loadTerms = useCallback(async (academicYearId?: number) => {
    try {
      const response = await getTermsForReport(academicYearId).catch(err => {
        console.warn("Failed to load terms, using fallback:", err);
        return { data: { data: [] } };
      });
      const data = response.data?.data || response.data || response || [];
      setTerms(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Failed to load terms:", err);
      setTerms([]);
    }
  }, []);

  const searchStudents = useCallback(async (search: string, classId?: number) => {
    try {
      if (!classId) {
        setStudents([]);
        return;
      }
      const response = await getStudentsForReport({ class_id: classId, search }).catch(err => {
        console.warn("Failed to search students, using fallback:", err);
        return { data: { data: [] } };
      });
      // Extract students from class response
      const classData = response.data?.data || response.data || {};
      const studentsData = classData.students || [];
      // Filter by search term client-side
      const filteredStudents = search
        ? studentsData.filter((s: any) => 
            `${s.first_name} ${s.last_name}`.toLowerCase().includes(search.toLowerCase()) ||
            String(s.admission_no).toLowerCase().includes(search.toLowerCase())
          )
        : studentsData;
      setStudents(Array.isArray(filteredStudents) ? filteredStudents : []);
    } catch (err) {
      console.error("Failed to search students:", err);
      setStudents([]);
    }
  }, []);

  useEffect(() => {
    loadOptions();
  }, [loadOptions]);

  return { classes, academicYears, terms, students, loading, searchStudents, loadTerms, reloadOptions: loadOptions };
}