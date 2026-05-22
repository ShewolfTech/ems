import { Request, Response } from "express";
import { interviewsService } from "./service.js";

export class InterviewsController {
  private getContext(req: Request) {
    const user = (req as any).user;
    if (!user || !user.schoolId) return null;
    return { schoolId: Number(user.schoolId), userId: Number(user.userId) };
  }

  async getAll(req: Request, res: Response) {
    try {
      const context = this.getContext(req);
      if (!context) return res.status(401).json({ success: false, message: "No school context" });

      const result = await interviewsService.findAll(context, req.query);
      res.json({ success: true, data: result });
    } catch (error: any) {
      console.error('ERROR in getAll:', error.message);
      res.status(500).json({ success: false, message: error.message });
    }
  }

  async getById(req: Request, res: Response) {
    try {
      const context = this.getContext(req);
      if (!context) return res.status(401).json({ success: false, message: "No school context" });

      const result = await interviewsService.findById(context, req.params.id);
      res.json({ success: true, data: result });
    } catch (error: any) {
      console.error('ERROR in getById:', error.message);
      res.status(500).json({ success: false, message: error.message });
    }
  }

  async create(req: Request, res: Response) {
    try {
      const context = this.getContext(req);
      if (!context) return res.status(401).json({ success: false, message: "No school context" });

      const result = await interviewsService.create(context, req.body);
      res.status(201).json({ success: true, data: result });
    } catch (error: any) {
      console.error('ERROR in create:', error.message);
      res.status(400).json({ success: false, message: error.message });
    }
  }

  async update(req: Request, res: Response) {
    try {
      const context = this.getContext(req);
      if (!context) return res.status(401).json({ success: false, message: "No school context" });

      const result = await interviewsService.update(context, req.params.id, req.body);
      res.json({ success: true, data: result });
    } catch (error: any) {
      console.error('ERROR in update:', error.message);
      res.status(400).json({ success: false, message: error.message });
    }
  }

  async complete(req: Request, res: Response) {
    try {
      const context = this.getContext(req);
      if (!context) return res.status(401).json({ success: false, message: "No school context" });

      const { outcome, score, notes, outcome_notes } = req.body;
      const result = await interviewsService.complete(context, req.params.id, {
        outcome,
        score,
        notes,
        outcome_notes
      });
      res.json({ success: true, data: result });
    } catch (error: any) {
      console.error('ERROR in complete:', error.message);
      res.status(400).json({ success: false, message: error.message });
    }
  }

  async delete(req: Request, res: Response) {
    try {
      const context = this.getContext(req);
      if (!context) return res.status(401).json({ success: false, message: "No school context" });

      const result = await interviewsService.delete(context, req.params.id);
      res.json({ success: true, data: result });
    } catch (error: any) {
      console.error('ERROR in delete:', error.message);
      res.status(400).json({ success: false, message: error.message });
    }
  }

  async getStatistics(req: Request, res: Response) {
    try {
      const context = this.getContext(req);
      if (!context) return res.status(401).json({ success: false, message: "No school context" });

      const filters = {
        startDate: req.query.startDate as string | undefined,
        endDate: req.query.endDate as string | undefined,
      };

      const result = await interviewsService.getStatistics(context, filters);
      res.json({ success: true, data: result });
    } catch (error: any) {
      console.error('ERROR in getStatistics:', error.message);
      res.status(500).json({ success: false, message: error.message });
    }
  }

  async getPendingInterviews(req: Request, res: Response) {
    try {
      const context = this.getContext(req);
      if (!context) return res.status(401).json({ success: false, message: "No school context" });

      const result = await interviewsService.getPendingInterviews(context);
      res.json({ success: true, data: result });
    } catch (error: any) {
      console.error('ERROR in getPendingInterviews:', error.message);
      res.status(500).json({ success: false, message: error.message });
    }
  }
}

export const interviewsController = new InterviewsController();
