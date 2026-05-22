import { Request, Response } from "express";
import { decisionsService } from "./service.js";

export class DecisionsController {
  private getContext(req: Request) {
    const user = (req as any).user;
    if (!user || !user.schoolId) return null;
    return { schoolId: Number(user.schoolId), userId: Number(user.userId) };
  }

  // ==================== DECISIONS ====================

  async makeDecision(req: Request, res: Response) {
    try {
      const context = this.getContext(req);
      if (!context) return res.status(401).json({ success: false, message: "No school context" });

      const { application_id, decision_type, offer_details, rejection_reason, waitlist_position } = req.body;
      
      const result = await decisionsService.makeDecision(context, application_id, {
        decision_type,
        offer_details,
        rejection_reason,
        waitlist_position,
      });

      res.json({ success: true, data: result });
    } catch (error: any) {
      console.error('ERROR in makeDecision:', error.message);
      res.status(400).json({ success: false, message: error.message });
    }
  }

  async getDecision(req: Request, res: Response) {
    try {
      const context = this.getContext(req);
      if (!context) return res.status(401).json({ success: false, message: "No school context" });

      const result = await decisionsService.getDecisionByApplication(context, Number(req.params.applicationId));
      res.json({ success: true, data: result });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  async updateDecisionResponse(req: Request, res: Response) {
    try {
      const context = this.getContext(req);
      if (!context) return res.status(401).json({ success: false, message: "No school context" });

      const { response, response_notes } = req.body;
      const result = await decisionsService.updateDecisionResponse(context, Number(req.params.decisionId), response, response_notes);
      res.json({ success: true, data: result });
    } catch (error: any) {
      res.status(400).json({ success: false, message: error.message });
    }
  }

  // ==================== ENROLLMENTS ====================

  async createEnrollment(req: Request, res: Response) {
    try {
      const context = this.getContext(req);
      if (!context) return res.status(401).json({ success: false, message: "No school context" });

      const result = await decisionsService.createEnrollment(context, req.body);
      res.status(201).json({ success: true, data: result });
    } catch (error: any) {
      console.error('ERROR in createEnrollment:', error.message);
      res.status(400).json({ success: false, message: error.message });
    }
  }

  async completeEnrollment(req: Request, res: Response) {
    try {
      const context = this.getContext(req);
      if (!context) return res.status(401).json({ success: false, message: "No school context" });

      const result = await decisionsService.completeEnrollment(context, Number(req.params.enrollmentId), req.body);
      res.json({ success: true, data: result });
    } catch (error: any) {
      res.status(400).json({ success: false, message: error.message });
    }
  }

  async getEnrollment(req: Request, res: Response) {
    try {
      const context = this.getContext(req);
      if (!context) return res.status(401).json({ success: false, message: "No school context" });

      const result = await decisionsService.getEnrollmentByApplication(context, Number(req.params.applicationId));
      res.json({ success: true, data: result });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  // ==================== STATISTICS ====================

  async getPipelineStats(req: Request, res: Response) {
    try {
      const context = this.getContext(req);
      if (!context) return res.status(401).json({ success: false, message: "No school context" });

      const filters = {
        startDate: req.query.startDate as string | undefined,
        endDate: req.query.endDate as string | undefined,
      };

      const result = await decisionsService.getPipelineStatistics(context, filters);
      res.json({ success: true, data: result });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  async backfillEnrollments(req: Request, res: Response) {
    try {
      const context = this.getContext(req);
      if (!context) return res.status(401).json({ success: false, message: "No school context" });

      const result = await decisionsService.backfillEnrollments(context);
      res.json({ success: true, data: result });
    } catch (error: any) {
      console.error('ERROR in backfillEnrollments:', error.message);
      res.status(500).json({ success: false, message: error.message });
    }
  }
}

export const decisionsController = new DecisionsController();
