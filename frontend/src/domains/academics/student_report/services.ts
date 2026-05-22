import api from "@/utils/api.js";

export const getStudentReport = (params: any) => {
  const queryParams = params ? Object.fromEntries(
    Object.entries(params).filter(([key]) => !['autoFetch', 'onSuccess'].includes(key))
  ) : {};
  return api.get("/academics/student-report/report", { params: queryParams });
};

// Get students by class using the existing working classes endpoint
export const getStudentsForReport = (params?: any) => {
  const { class_id, search } = params || {};
  if (class_id) {
    return api.get(`/academics/classes/${class_id}`);
  }
  return api.get("/academics/classes").then(res => {
    const classes = res.data?.data || res.data || [];
    // If no class selected, get first class's students as default
    if (classes.length > 0) {
      return api.get(`/academics/classes/${classes[0].id}`);
    }
    return { data: { data: [] } };
  });
};

// Use existing working endpoints from academics module
export const getClassesForReport = () =>
  api.get("/academics/classes");

export const getAcademicYearsForReport = () =>
  api.get("/academics/academic-years");

export const getTermsForReport = (academicYearId?: number) => {
  const params = academicYearId ? { academic_year_id: academicYearId } : {};
  return api.get("/academics/terms", { params });
};