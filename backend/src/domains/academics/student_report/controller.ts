import { studentreportService } from "./service.js";

export class StudentReportController {
  async getReport(req: any, res: any) {
    try {
      console.log('[StudentReport] getReport request:', req.query);
      const context = { schoolId: req.userContext?.schoolId, userId: req.userContext?.userId };
      const result = await studentreportService.getStudentReport(context, req.query);
      res.json({ success: true, data: result });
    } catch (error: any) {
      console.error('[StudentReport] getReport error:', error.message);
      console.error('[StudentReport] Stack:', error.stack);
      res.status(400).json({ success: false, error: error.message });
    }
  }

  async getStudents(req: any, res: any) {
    try {
      const context = { schoolId: req.userContext?.schoolId, userId: req.userContext?.userId };
      const result = await studentreportService.getStudentsForReport(context, req.query);
      res.json({ success: true, data: result });
    } catch (error: any) {
      res.status(400).json({ success: false, error: error.message });
    }
  }

  async getClasses(req: any, res: any) {
    try {
      const context = { schoolId: req.userContext?.schoolId, userId: req.userContext?.userId };
      const result = await studentreportService.getClassesForReport(context);
      res.json({ success: true, data: result });
    } catch (error: any) {
      res.status(400).json({ success: false, error: error.message });
    }
  }

  async getAcademicYears(req: any, res: any) {
    try {
      const context = { schoolId: req.userContext?.schoolId, userId: req.userContext?.userId };
      const result = await studentreportService.getAcademicYearsForReport(context);
      res.json({ success: true, data: result });
    } catch (error: any) {
      res.status(400).json({ success: false, error: error.message });
    }
  }

  async getTerms(req: any, res: any) {
    try {
      const context = { schoolId: req.userContext?.schoolId, userId: req.userContext?.userId };
      const { academic_year_id } = req.query;
      const result = await studentreportService.getTermsForReport(context, academic_year_id ? Number(academic_year_id) : undefined);
      res.json({ success: true, data: result });
    } catch (error: any) {
      res.status(400).json({ success: false, error: error.message });
    }
  }
}

export const studentreportController = new StudentReportController();