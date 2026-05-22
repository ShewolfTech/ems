import { Request, Response } from "express";
import { admissionsService } from "./service.js";

export class AdmissionsController {
  // 🛡️ Helper to extract context from authMiddleware
  private getContext(req: Request) {
    const user = (req as any).user;
    if (!user || !user.schoolId) return null;
    return { schoolId: Number(user.schoolId), userId: Number(user.userId) };
  }

  // ==================== STATUSES ====================

  async getAllStatuses(req: Request, res: Response) {
    try {
      const context = this.getContext(req);
      if (!context) {
        console.log('[STATUSES] No context, user:', (req as any).user);
        return res.status(401).json({ success: false, message: "No school context" });
      }

      console.log('[STATUSES] Context:', context);
      const result = await admissionsService.findAllStatuses(context);
      console.log('[STATUSES] Result:', result);
      res.json({ success: true, data: result || [] });
    } catch (error: any) {
      console.error('ERROR in getAllStatuses:', error.message);
      // Return empty array instead of 500 if table doesn't exist or is empty
      res.status(200).json({ success: true, data: [] });
    }
  }

  // ==================== TYPES ====================

  async getAllTypes(req: Request, res: Response) {
    try {
      const context = this.getContext(req);
      if (!context) return res.status(401).json({ success: false, message: "No school context" });

      const result = await admissionsService.findAllTypes(context);
      res.json({ success: true, data: result });
    } catch (error: any) {
      console.error('ERROR in getAllTypes:', error.message);
      res.status(500).json({ success: false, message: error.message });
    }
  }

  // ==================== APPLICANTS ====================

  async getAllApplicants(req: Request, res: Response) {
    try {
      const context = this.getContext(req);
      if (!context) return res.status(401).json({ success: false, message: "No school context" });

      const filters = {
        search: req.query.search as string,
        page: req.query.page ? Number(req.query.page) : 1,
        limit: req.query.limit ? Number(req.query.limit) : 20,
      };

      const result = await admissionsService.findAllApplicants(context, filters);
      res.json({ success: true, data: result });
    } catch (error: any) {
      console.error('ERROR in getAllApplicants:', error.message);
      res.status(500).json({ success: false, message: error.message });
    }
  }

  async getApplicantById(req: Request, res: Response) {
    try {
      const context = this.getContext(req);
      if (!context) return res.status(401).json({ success: false, message: "No school context" });

      const result = await admissionsService.findApplicantById(context, req.params.id);
      res.json({ success: true, data: result });
    } catch (error: any) {
      console.error('ERROR in getApplicantById:', error.message);
      res.status(500).json({ success: false, message: error.message });
    }
  }

  async createApplicant(req: Request, res: Response) {
    try {
      const context = this.getContext(req);
      if (!context) {
        console.error('[CREATE_APPLICANT] No context, user:', (req as any).user);
        return res.status(401).json({ success: false, message: "No school context" });
      }

      console.log('[CREATE_APPLICANT] Context:', context);
      console.log('[CREATE_APPLICANT] Request body:', req.body);

      const result = await admissionsService.createApplicant(context, req.body);
      
      console.log('[CREATE_APPLICANT] Result:', result);
      
      // Return 200 instead of 201 to avoid axios issues
      res.status(200).json({ 
        success: true, 
        data: result,
        message: 'Applicant created successfully'
      });
    } catch (error: any) {
      console.error('[CREATE_APPLICANT] ERROR:', error.message);
      console.error('[CREATE_APPLICANT] Stack:', error.stack);
      res.status(400).json({ 
        success: false, 
        message: error.message,
        details: error.details || error.code
      });
    }
  }

  async updateApplicant(req: Request, res: Response) {
    try {
      const context = this.getContext(req);
      if (!context) return res.status(401).json({ success: false, message: "No school context" });

      const result = await admissionsService.updateApplicant(context, req.params.id, req.body);
      res.json({ success: true, data: result });
    } catch (error: any) {
      console.error('ERROR in updateApplicant:', error.message);
      res.status(400).json({ success: false, message: error.message });
    }
  }

  async deleteApplicant(req: Request, res: Response) {
    try {
      const context = this.getContext(req);
      if (!context) return res.status(401).json({ success: false, message: "No school context" });

      const result = await admissionsService.deleteApplicant(context, req.params.id);
      res.json({ success: true, data: result });
    } catch (error: any) {
      console.error('ERROR in deleteApplicant:', error.message);
      res.status(400).json({ success: false, message: error.message });
    }
  }

  // ==================== APPLICATIONS ====================

  async getAllApplications(req: Request, res: Response) {
    try {
      const context = this.getContext(req);
      if (!context) {
        console.log('[APPLICATIONS] No context, user:', (req as any).user);
        return res.status(401).json({ success: false, message: "No school context" });
      }

      console.log('[APPLICATIONS] Context:', context);

      const filters = {
        status: req.query.status && req.query.status !== '' ? req.query.status as string : undefined,
        search: req.query.search && req.query.search !== '' ? req.query.search as string : undefined,
        page: req.query.page ? Number(req.query.page) : 1,
        limit: req.query.limit ? Number(req.query.limit) : 20,
      };

      console.log('[APPLICATIONS] Filters:', filters);

      const result = await admissionsService.findAllApplications(context, filters);
      console.log('[APPLICATIONS] Result count:', result?.data?.length);
      res.json({ success: true, data: result });
    } catch (error: any) {
      console.error('ERROR in getAllApplications:', error.message);
      console.error('Stack:', error.stack);
      res.status(500).json({ success: false, message: error.message });
    }
  }

  async getApplicationById(req: Request, res: Response) {
    try {
      const context = this.getContext(req);
      if (!context) return res.status(401).json({ success: false, message: "No school context" });

      const id = Number(req.params.id);
      if (isNaN(id) || id <= 0) {
        return res.status(400).json({ success: false, message: "Invalid application ID" });
      }

      const result = await admissionsService.findApplicationById(context, id);
      res.json({ success: true, data: result });
    } catch (error: any) {
      console.error('ERROR in getApplicationById:', error.message);
      res.status(500).json({ success: false, message: error.message });
    }
  }

  async createApplication(req: Request, res: Response) {
    try {
      const context = this.getContext(req);
      if (!context) return res.status(401).json({ success: false, message: "No school context" });

      const result = await admissionsService.createApplication(context, req.body);
      res.status(201).json({ success: true, data: result });
    } catch (error: any) {
      console.error('ERROR in createApplication:', error.message);
      res.status(400).json({ success: false, message: error.message });
    }
  }

  async updateApplication(req: Request, res: Response) {
    try {
      const context = this.getContext(req);
      if (!context) return res.status(401).json({ success: false, message: "No school context" });

      const result = await admissionsService.updateApplication(context, req.params.id, req.body);
      res.json({ success: true, data: result });
    } catch (error: any) {
      console.error('ERROR in updateApplication:', error.message);
      res.status(400).json({ success: false, message: error.message });
    }
  }

  async deleteApplication(req: Request, res: Response) {
    try {
      const context = this.getContext(req);
      if (!context) return res.status(401).json({ success: false, message: "No school context" });

      const result = await admissionsService.deleteApplication(context, req.params.id);
      res.json({ success: true, data: result });
    } catch (error: any) {
      console.error('ERROR in deleteApplication:', error.message);
      res.status(400).json({ success: false, message: error.message });
    }
  }

  async convertEnquiry(req: Request, res: Response) {
    try {
      const context = this.getContext(req);
      if (!context) return res.status(401).json({ success: false, message: "No school context" });

      const { enquiry_id, ...applicationData } = req.body;
      const result = await admissionsService.convertEnquiryToApplication(context, enquiry_id, applicationData);
      res.status(201).json({ success: true, data: result });
    } catch (error: any) {
      console.error('ERROR in convertEnquiry:', error.message);
      res.status(400).json({ success: false, message: error.message });
    }
  }

  // ==================== STATISTICS ====================

  async getStatistics(req: Request, res: Response) {
    try {
      const context = this.getContext(req);
      if (!context) return res.status(401).json({ success: false, message: "No school context" });

      const filters = {
        startDate: req.query.startDate as string | undefined,
        endDate: req.query.endDate as string | undefined,
        statusId: req.query.statusId as string | undefined,
      };

      const result = await admissionsService.getStatistics(context, filters);
      res.json({ success: true, data: result });
    } catch (error: any) {
      console.error('ERROR in getStatistics:', error.message);
      res.status(500).json({ success: false, message: error.message });
    }
  }

  async getDashboardStats(req: Request, res: Response) {
    try {
      const context = this.getContext(req);
      if (!context) return res.status(401).json({ success: false, message: "No school context" });

      const result = await admissionsService.getDashboardStats(context);
      res.json({ success: true, data: result });
    } catch (error: any) {
      console.error('ERROR in getDashboardStats:', error.message);
      res.status(500).json({ success: false, message: error.message });
    }
  }
}

export const admissionsController = new AdmissionsController();
