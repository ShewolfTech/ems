import { Request, Response } from "express";
import { staffmgtpromotionhistoryviewService } from "./service.js";

export class StaffmgtPromotionHistoryViewController {

  // 🛡️ Helper to extract context from authMiddleware
  private getContext(req: Request) {
    const user = (req as any).user;
    if (!user || !user.schoolId) return null;
    const schoolId = Number(user.schoolId);
    const userId = Number(user.userId);
    if (isNaN(schoolId) || isNaN(userId)) return null;
    return { schoolId, userId };
  }

  async getPermissionsMeta(req: Request, res: Response) {
    try {
      const context = this.getContext(req);
      if (!context) return res.status(401).json({ success: false, message: "Unauthorized: No school context" });

      const data = await staffmgtpromotionhistoryviewService.findAll(context, req.query);
      const enriched = (data || []).slice(0, 1).map((p: any) => ({
        display_name: p.studentName || p.assessmentTitle || p.name || "StaffmgtPromotionHistoryView",
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
      res.json({ success: true, data: { show_in_sidebar: true, label: "StaffmgtPromotionHistoryView" } });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  async getAll(req: Request, res: Response) {
    try {
      const context = this.getContext(req);
      if (!context) return res.status(401).json({ success: false, message: "No school context" });

      const result = await staffmgtpromotionhistoryviewService.findAll(context, req.query);
      res.json({ success: true, data: result });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  async getById(req: Request, res: Response) {
    try {
      const context = this.getContext(req);
      if (!context) return res.status(401).json({ success: false, message: "No school context" });

      const result = await staffmgtpromotionhistoryviewService.findById(context, req.params.id);
      res.json({ success: true, data: result });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }
}
export const staffmgtpromotionhistoryviewController = new StaffmgtPromotionHistoryViewController();
