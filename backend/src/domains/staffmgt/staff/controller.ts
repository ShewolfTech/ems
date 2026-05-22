import { Request, Response } from "express";
import { staffService } from "./service.js";

export class StaffController {

  // 🛡️ Helper to extract context from authMiddleware
  private getContext(req: Request) {
    const user = (req as any).user;
    if (!user || !user.schoolId) return null;
    const schoolId = Number(user.schoolId);
    const userId = Number(user.userId);
    if (isNaN(schoolId) || isNaN(userId)) {
      console.error("[staff] Invalid schoolId or userId:", { schoolId: user.schoolId, userId: user.userId });
      return null;
    }
    return { schoolId, userId };
  }

  async getPermissionsMeta(req: Request, res: Response) {
    try {
      const context = this.getContext(req);
      if (!context) return res.status(401).json({ success: false, message: "Unauthorized: No school context" });

      const data = await staffService.findAll(context, req.query);
      const enriched = (data || []).slice(0, 1).map((p: any) => ({
        display_name: p.studentName || p.assessmentTitle || p.name || "Staff",
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
      res.json({ success: true, data: { show_in_sidebar: true, label: "Staff" } });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  async getAll(req: Request, res: Response) {
    try {
      const context = this.getContext(req);
      if (!context) return res.status(401).json({ success: false, message: "No school context" });

      const result = await staffService.findAll(context, req.query);
      res.json({ success: true, data: result.data, pagination: result.pagination });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  async getById(req: Request, res: Response) {
    try {
      const context = this.getContext(req);
      if (!context) return res.status(401).json({ success: false, message: "No school context" });

      const result = await staffService.findById(context, req.params.id);
      res.json({ success: true, data: result });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  async create(req: Request, res: Response) {
    try {
      const context = this.getContext(req);
      if (!context) return res.status(401).json({ success: false, message: "No school context" });

      const result = await staffService.create(context, req.body);
      res.status(201).json({ success: true, data: result });
    } catch (error: any) {
      res.status(400).json({ success: false, message: error.message });
    }
  }

  async update(req: Request, res: Response) {
    try {
      const context = this.getContext(req);
      if (!context) return res.status(401).json({ success: false, message: "No school context" });

      const result = await staffService.update(context, req.params.id, req.body);
      res.json({ success: true, data: result });
    } catch (error: any) {
      res.status(400).json({ success: false, message: error.message });
    }
  }

  async delete(req: Request, res: Response) {
    try {
      const context = this.getContext(req);
      if (!context) return res.status(401).json({ success: false, message: "No school context" });

      const result = await staffService.delete(context, req.params.id);
      res.json({ success: true, data: result });
    } catch (error: any) {
      res.status(400).json({ success: false, message: error.message });
    }
  }

  async getStatistics(req: Request, res: Response) {
    try {
      const context = this.getContext(req);
      if (!context) return res.status(401).json({ success: false, message: "No school context" });

      const result = await staffService.getStatistics(context);
      res.json({ success: true, data: result });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  async getRoles(req: Request, res: Response) {
    try {
      const context = this.getContext(req);
      if (!context) return res.status(401).json({ success: false, message: "No school context" });

      const result = await staffService.getRoles(context);
      res.json({ success: true, data: result });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  async getDepartments(req: Request, res: Response) {
    try {
      const context = this.getContext(req);
      if (!context) return res.status(401).json({ success: false, message: "No school context" });

      const result = await staffService.getDepartments(context);
      res.json({ success: true, data: result });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  async transfer(req: Request, res: Response) {
    try {
      const context = this.getContext(req);
      if (!context) return res.status(401).json({ success: false, message: "No school context" });

      const { staff_id, new_department_id, transfer_date, remarks } = req.body;
      
      if (!staff_id || !new_department_id) {
        return res.status(400).json({ success: false, message: "staff_id and new_department_id are required" });
      }

      const result = await staffService.transfer(context, staff_id, {
        new_department_id,
        transfer_date,
        remarks,
        transferred_by: context.userId
      });
      res.json({ success: true, data: result });
    } catch (error: any) {
      res.status(400).json({ success: false, message: error.message });
    }
  }

  async promote(req: Request, res: Response) {
    try {
      const context = this.getContext(req);
      if (!context) return res.status(401).json({ success: false, message: "No school context" });

      const { staff_id, new_role_id, promotion_date, reason, remarks } = req.body;
      
      if (!staff_id || !new_role_id) {
        return res.status(400).json({ success: false, message: "staff_id and new_role_id are required" });
      }

      const result = await staffService.promote(context, staff_id, {
        new_role_id,
        promotion_date,
        reason,
        remarks,
        promoted_by: context.userId
      });
      res.json({ success: true, data: result });
    } catch (error: any) {
      res.status(400).json({ success: false, message: error.message });
    }
  }

  async getTransferHistory(req: Request, res: Response) {
    try {
      const context = this.getContext(req);
      if (!context) return res.status(401).json({ success: false, message: "No school context" });

      const result = await staffService.getTransferHistory(context, req.params.id);
      res.json({ success: true, data: result });
    } catch (error: any) {
      res.status(400).json({ success: false, message: error.message });
    }
  }

  async getPromotionHistory(req: Request, res: Response) {
    try {
      const context = this.getContext(req);
      if (!context) return res.status(401).json({ success: false, message: "No school context" });

      const result = await staffService.getPromotionHistory(context, req.params.id);
      res.json({ success: true, data: result });
    } catch (error: any) {
      res.status(400).json({ success: false, message: error.message });
    }
  }
}
export const staffController = new StaffController();
