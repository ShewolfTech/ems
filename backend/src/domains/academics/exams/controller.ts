import { Request, Response } from "express";
import { examsService } from "./service.js";

export class ExamsController {
  private getContext(req: Request) {
    const user = (req as any).user;
    if (!user || !user.schoolId) return null;
    return { schoolId: Number(user.schoolId), userId: Number(user.userId) };
  }

  async getPermissionsMeta(req: Request, res: Response) {
    try {
      const context = this.getContext(req);
      if (!context) return res.status(401).json({ success: false, message: "Unauthorized" });

      const data = await examsService.findAll(context, req.query);
      const enriched = (data || []).slice(0, 1).map((p: any) => ({
        display_name: p.title || "Exams",
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
      res.json({ success: true, data: { show_in_sidebar: true, label: "Exams" } });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  async getAll(req: Request, res: Response) {
    try {
      const context = this.getContext(req);
      if (!context) return res.status(401).json({ success: false, message: "No school context" });

      const result = await examsService.findAll(context, req.query);
      res.json({ success: true, data: result });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  async getById(req: Request, res: Response) {
    try {
      const context = this.getContext(req);
      if (!context) return res.status(401).json({ success: false, message: "No school context" });

      const result = await examsService.findById(context, req.params.id);
      res.json({ success: true, data: result });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  async create(req: Request, res: Response) {
    try {
      const context = this.getContext(req);
      if (!context) return res.status(401).json({ success: false, message: "No school context" });

      const result = await examsService.create(context, req.body);
      res.status(201).json({ success: true, data: result });
    } catch (error: any) {
      res.status(400).json({ success: false, message: error.message });
    }
  }

  async update(req: Request, res: Response) {
    try {
      const context = this.getContext(req);
      if (!context) return res.status(401).json({ success: false, message: "No school context" });

      console.log('UPDATE exam ID:', req.params.id, 'Body:', JSON.stringify(req.body, null, 2));
      const result = await examsService.update(context, req.params.id, req.body);
      res.json({ success: true, data: result });
    } catch (error: any) {
      console.error('UPDATE error:', error.message);
      if (error.errors) {
        console.error('Validation errors:', JSON.stringify(error.errors, null, 2));
      }
      res.status(400).json({ success: false, message: error.message });
    }
  }

  async delete(req: Request, res: Response) {
    try {
      const context = this.getContext(req);
      if (!context) return res.status(401).json({ success: false, message: "No school context" });

      const result = await examsService.delete(context, req.params.id);
      res.json({ success: true, data: result });
    } catch (error: any) {
      res.status(400).json({ success: false, message: error.message });
    }
  }

  async bulkCreateResults(req: Request, res: Response) {
    try {
      const context = this.getContext(req);
      if (!context) return res.status(401).json({ success: false, message: "No school context" });

      const result = await examsService.bulkCreateResults(context, req.body);
      res.status(201).json({ success: true, data: result });
    } catch (error: any) {
      res.status(400).json({ success: false, message: error.message });
    }
  }

  async getAnalytics(req: Request, res: Response) {
    try {
      const context = this.getContext(req);
      if (!context) return res.status(401).json({ success: false, message: "No school context" });

      const { class_id, term_id } = req.query;
      if (!class_id) {
        return res.status(400).json({ success: false, message: "class_id is required" });
      }

      const result = await examsService.getAnalytics(
        context, 
        Number(class_id), 
        term_id ? Number(term_id) : undefined
      );
      res.json({ success: true, data: result });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }
}

export const examsController = new ExamsController();
