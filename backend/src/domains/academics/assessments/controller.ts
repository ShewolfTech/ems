import { Request, Response } from "express";
import { assessmentsService } from "./service.js";

export class AssessmentsController {
  private getContext(req: Request) {
    const user = (req as any).user;
    if (!user || !user.schoolId) return null;
    return { schoolId: Number(user.schoolId), userId: Number(user.userId) };
  }

  async getPermissionsMeta(req: Request, res: Response) {
    try {
      const context = this.getContext(req);
      if (!context) return res.status(401).json({ success: false, message: "Unauthorized" });

      const data = await assessmentsService.findAll(context, req.query);
      const enriched = (data || []).slice(0, 1).map((p: any) => ({
        display_name: p.title || "Assessments",
        icon: "layout-grid",
        is_menu_item: true,
        display_order: 1,
      }));
      res.json({ success: true, permissions_meta: enriched });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  async getSidebar(req: Request, res: Response) {
    try {
      res.json({ success: true, data: { show_in_sidebar: true, label: "Assessments" } });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  async getAll(req: Request, res: Response) {
    try {
      const context = this.getContext(req);
      if (!context) return res.status(401).json({ success: false, message: "No school context" });

      const result = await assessmentsService.findAll(context, req.query);
      res.json({ success: true, data: result });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  async getById(req: Request, res: Response) {
    try {
      const context = this.getContext(req);
      if (!context) return res.status(401).json({ success: false, message: "No school context" });

      const result = await assessmentsService.findById(context, req.params.id);
      res.json({ success: true, data: result });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  async create(req: Request, res: Response) {
    try {
      const context = this.getContext(req);
      if (!context) return res.status(401).json({ success: false, message: "No school context" });

      const result = await assessmentsService.create(context, req.body);
      res.status(201).json({ success: true, data: result });
    } catch (error: any) {
      res.status(400).json({ success: false, message: error.message });
    }
  }

  async update(req: Request, res: Response) {
    try {
      const context = this.getContext(req);
      if (!context) return res.status(401).json({ success: false, message: "No school context" });

      const result = await assessmentsService.update(context, req.params.id, req.body);
      res.json({ success: true, data: result });
    } catch (error: any) {
      res.status(400).json({ success: false, message: error.message });
    }
  }

  async delete(req: Request, res: Response) {
    try {
      const context = this.getContext(req);
      if (!context) return res.status(401).json({ success: false, message: "No school context" });

      const result = await assessmentsService.delete(context, req.params.id);
      res.json({ success: true, data: result });
    } catch (error: any) {
      res.status(400).json({ success: false, message: error.message });
    }
  }

  async getAnalytics(req: Request, res: Response) {
    try {
      const context = this.getContext(req);
      if (!context) return res.status(401).json({ success: false, message: "No school context" });

      const result = await assessmentsService.getAnalytics(context, Number(req.params.id));
      res.json({ success: true, data: result });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  async getUnifiedGradeBook(req: Request, res: Response) {
    try {
      const context = this.getContext(req);
      if (!context) return res.status(401).json({ success: false, message: "No school context" });

      const { class_id, term_id, student_id, type, date_from, date_to } = req.query;
      if (!class_id) {
        return res.status(400).json({ success: false, message: "class_id is required" });
      }

      const result = await assessmentsService.getUnifiedGradeBook(
        context,
        Number(class_id),
        term_id ? Number(term_id) : undefined,
        student_id ? Number(student_id) : undefined,
        type ? String(type) : undefined,
        date_from ? String(date_from) : undefined,
        date_to ? String(date_to) : undefined,
      );
      res.json({ success: true, data: result });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  async getGradeBook(req: Request, res: Response) {
    try {
      const context = this.getContext(req);
      if (!context) return res.status(401).json({ success: false, message: "No school context" });

      const { class_id, term_id } = req.query;
      if (!class_id) {
        return res.status(400).json({ success: false, message: "class_id is required" });
      }

      const result = await assessmentsService.getGradeBook(context, Number(class_id), term_id ? Number(term_id) : undefined);
      res.json({ success: true, data: result });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  async getStudentReport(req: Request, res: Response) {
    try {
      const context = this.getContext(req);
      if (!context) return res.status(401).json({ success: false, message: "No school context" });

      const { student_id, academic_year_id, term_id } = req.query;
      if (!student_id) {
        return res.status(400).json({ success: false, message: "student_id is required" });
      }

      console.log('[getStudentReport] Request params:', { student_id, academic_year_id, term_id });

      const result = await assessmentsService.getStudentReport(context, Number(student_id), {
        academic_year_id: academic_year_id ? Number(academic_year_id) : undefined,
        term_id: term_id ? Number(term_id) : undefined,
      });
      res.json({ success: true, data: result });
    } catch (error: any) {
      console.error('[getStudentReport] Error:', error.message);
      res.status(500).json({ success: false, message: error.message });
    }
  }
}

export const assessmentsController = new AssessmentsController();
