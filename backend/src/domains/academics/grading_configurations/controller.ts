import { Request, Response } from "express";
import { gradingConfigurationsService } from "./service.js";

export class GradingConfigurationsController {
  private getContext(req: Request) {
    const user = (req as any).user;
    if (!user || !user.schoolId) return null;
    return { schoolId: Number(user.schoolId), userId: Number(user.userId) };
  }

  async getAll(req: Request, res: Response) {
    try {
      const context = this.getContext(req);
      if (!context) return res.status(401).json({ success: false, message: "No school context" });

      const result = await gradingConfigurationsService.findAll(context, req.query);
      res.json({ success: true, data: result });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  async getById(req: Request, res: Response) {
    try {
      const context = this.getContext(req);
      if (!context) return res.status(401).json({ success: false, message: "No school context" });

      const result = await gradingConfigurationsService.findById(context, req.params.id);
      res.json({ success: true, data: result });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  async getDefault(req: Request, res: Response) {
    try {
      const context = this.getContext(req);
      if (!context) return res.status(401).json({ success: false, message: "No school context" });

      const { academic_year_id } = req.query;
      const result = await gradingConfigurationsService.getDefaultConfig(
        context,
        academic_year_id ? Number(academic_year_id) : undefined
      );
      res.json({ success: true, data: result });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  async create(req: Request, res: Response) {
    try {
      const context = this.getContext(req);
      if (!context) return res.status(401).json({ success: false, message: "No school context" });

      const result = await gradingConfigurationsService.create(context, req.body);
      res.status(201).json({ success: true, data: result });
    } catch (error: any) {
      res.status(400).json({ success: false, message: error.message });
    }
  }

  async update(req: Request, res: Response) {
    try {
      const context = this.getContext(req);
      if (!context) return res.status(401).json({ success: false, message: "No school context" });

      const result = await gradingConfigurationsService.update(context, req.params.id, req.body);
      res.json({ success: true, data: result });
    } catch (error: any) {
      res.status(400).json({ success: false, message: error.message });
    }
  }

  async delete(req: Request, res: Response) {
    try {
      const context = this.getContext(req);
      if (!context) return res.status(401).json({ success: false, message: "No school context" });

      const result = await gradingConfigurationsService.delete(context, req.params.id);
      res.json({ success: true, data: result });
    } catch (error: any) {
      res.status(400).json({ success: false, message: error.message });
    }
  }

  async calculateGrade(req: Request, res: Response) {
    try {
      const context = this.getContext(req);
      if (!context) return res.status(401).json({ success: false, message: "No school context" });

      const { student_id, class_id, term_id, config_id } = req.query;
      
      if (!student_id || !class_id || !term_id) {
        return res.status(400).json({ 
          success: false, 
          message: "student_id, class_id, and term_id are required" 
        });
      }

      const result = await gradingConfigurationsService.calculateFinalGrade(
        context,
        Number(student_id),
        Number(class_id),
        Number(term_id),
        config_id ? Number(config_id) : undefined
      );

      res.json({ success: true, data: result });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }
}

export const gradingConfigurationsController = new GradingConfigurationsController();
