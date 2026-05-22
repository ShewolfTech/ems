import { Request, Response } from "express";
import { timetablesService } from "./service.js";

export class TimetablesController {

  // 🛡️ Helper to extract context from authMiddleware
  private getContext(req: Request) {
    const user = (req as any).user;
    if (!user || !user.schoolId) return null;
    return { schoolId: Number(user.schoolId), userId: Number(user.userId) };
  }

  async getPermissionsMeta(req: Request, res: Response) {
    try {
      const context = this.getContext(req);
      if (!context) return res.status(401).json({ success: false, message: "Unauthorized: No school context" });

      const data = await timetablesService.findAll(context, req.query);
      const enriched = (data || []).slice(0, 1).map((p: any) => ({
        display_name: p.studentName || p.assessmentTitle || p.name || "Timetables",
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
      res.json({ success: true, data: { show_in_sidebar: true, label: "Timetables" } });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  async getAll(req: Request, res: Response) {
    try {
      const context = this.getContext(req);
      if (!context) return res.status(401).json({ success: false, message: "No school context" });

      const result = await timetablesService.findAll(context, req.query);
      res.json({ success: true, data: result });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  async getById(req: Request, res: Response) {
    try {
      const context = this.getContext(req);
      if (!context) return res.status(401).json({ success: false, message: "No school context" });

      const result = await timetablesService.findById(context, req.params.id);
      res.json({ success: true, data: result });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  async create(req: Request, res: Response) {
    try {
      const context = this.getContext(req);
      if (!context) return res.status(401).json({ success: false, message: "No school context" });

      const result = await timetablesService.create(context, req.body);
      res.status(201).json({ success: true, data: result });
    } catch (error: any) {
      res.status(400).json({ success: false, message: error.message });
    }
  }

  async update(req: Request, res: Response) {
    try {
      const context = this.getContext(req);
      if (!context) return res.status(401).json({ success: false, message: "No school context" });

      const result = await timetablesService.update(context, req.params.id, req.body);
      res.json({ success: true, data: result });
    } catch (error: any) {
      res.status(400).json({ success: false, message: error.message });
    }
  }

  async delete(req: Request, res: Response) {
    try {
      const context = this.getContext(req);
      if (!context) return res.status(401).json({ success: false, message: "No school context" });

      const result = await timetablesService.delete(context, req.params.id);
      res.json({ success: true, data: result });
    } catch (error: any) {
      res.status(400).json({ success: false, message: error.message });
    }
  }

  async addEntry(req: Request, res: Response) {
    try {
      const context = this.getContext(req);
      if (!context) return res.status(401).json({ success: false, message: "No school context" });

      const { dayOfWeek, startTime, endTime, subjectId, teacherId, room } = req.body;
      const result = await timetablesService.addEntry(context, Number(req.params.id), {
        dayOfWeek, startTime, endTime, subjectId, teacherId, room,
      });
      res.status(201).json({ success: true, data: result });
    } catch (error: any) {
      res.status(400).json({ success: false, message: error.message });
    }
  }

  async updateEntry(req: Request, res: Response) {
    try {
      const context = this.getContext(req);
      if (!context) return res.status(401).json({ success: false, message: "No school context" });

      const { dayOfWeek, startTime, endTime, subjectId, teacherId, room } = req.body;
      const result = await timetablesService.updateEntry(context, Number(req.params.id), Number(req.params.entryId), {
        dayOfWeek, startTime, endTime, subjectId, teacherId, room,
      });
      res.json({ success: true, data: result });
    } catch (error: any) {
      res.status(400).json({ success: false, message: error.message });
    }
  }

  async deleteEntry(req: Request, res: Response) {
    try {
      const context = this.getContext(req);
      if (!context) return res.status(401).json({ success: false, message: "No school context" });

      const result = await timetablesService.deleteEntry(context, Number(req.params.id), Number(req.params.entryId));
      res.json({ success: true, data: result });
    } catch (error: any) {
      res.status(400).json({ success: false, message: error.message });
    }
  }

  async clone(req: Request, res: Response) {
    try {
      const context = this.getContext(req);
      if (!context) return res.status(401).json({ success: false, message: "No school context" });

      const { source_timetable_id } = req.body;
      const targetTimetableId = Number(req.params.id);

      if (!source_timetable_id) {
        return res.status(400).json({ success: false, message: "source_timetable_id is required" });
      }

      const result = await timetablesService.clone(context, Number(source_timetable_id), targetTimetableId);
      res.json({ success: true, data: result });
    } catch (error: any) {
      res.status(400).json({ success: false, message: error.message });
    }
  }

  async generateSmart(req: Request, res: Response) {
    try {
      const context = this.getContext(req);
      if (!context) return res.status(401).json({ success: false, message: "No school context" });

      const result = await timetablesService.generateSmartTimetable(context, Number(req.params.id));
      res.json({ success: true, data: result });
    } catch (error: any) {
      res.status(400).json({ success: false, message: error.message });
    }
  }

  async copyTimetable(req: Request, res: Response) {
    try {
      const context = this.getContext(req);
      if (!context) return res.status(401).json({ success: false, message: "No school context" });

      const { toClassId, toTermId, name } = req.body;
      if (!toClassId || !toTermId || !name) {
        return res.status(400).json({ success: false, message: "toClassId, toTermId, and name are required" });
      }

      const result = await timetablesService.copyTimetable(context, Number(req.params.id), toClassId, toTermId, name);
      res.status(201).json({ success: true, data: result });
    } catch (error: any) {
      res.status(400).json({ success: false, message: error.message });
    }
  }

  async getSchoolWorkload(req: Request, res: Response) {
    try {
      const context = this.getContext(req);
      if (!context) return res.status(401).json({ success: false, message: "No school context" });

      const result = await timetablesService.getSchoolWorkload(context);
      res.json({ success: true, data: result });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }
}
export const timetablesController = new TimetablesController();
