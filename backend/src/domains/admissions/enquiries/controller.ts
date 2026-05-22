import { Request, Response } from "express";
import { enquiriesService } from "./service.js";

export class EnquiriesController {
  // 🛡️ Helper to extract context from authMiddleware
  private getContext(req: Request) {
    const user = (req as any).user;
    if (!user || !user.schoolId) return null;
    return { schoolId: Number(user.schoolId), userId: Number(user.userId) };
  }

  // ==================== META ENDPOINTS ====================

  async getPermissionsMeta(req: Request, res: Response) {
    try {
      const context = this.getContext(req);
      if (!context) return res.status(401).json({ success: false, message: "Unauthorized: No school context" });

      const data = await enquiriesService.findAll(context, { limit: 1 });
      const enriched = (data?.data || []).slice(0, 1).map((p: any) => ({
        display_name: p.subject || "Enquiries",
        icon: "message-square",
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
      res.json({ success: true, data: { show_in_sidebar: true, label: "Enquiries" } });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  // ==================== MAIN ENQUIRIES ====================

  async getAll(req: Request, res: Response) {
    try {
      const context = this.getContext(req);
      if (!context) return res.status(401).json({ success: false, message: "No school context" });

      const filters = {
        status: req.query.status as string,
        priority: req.query.priority as string,
        enquiry_type_id: req.query.enquiry_type_id ? Number(req.query.enquiry_type_id) : undefined,
        enquiry_source_id: req.query.enquiry_source_id ? Number(req.query.enquiry_source_id) : undefined,
        assigned_to: req.query.assigned_to ? Number(req.query.assigned_to) : undefined,
        search: req.query.search as string,
        date_from: req.query.date_from as string,
        date_to: req.query.date_to as string,
        page: req.query.page ? Number(req.query.page) : 1,
        limit: req.query.limit ? Number(req.query.limit) : 20,
      };

      const result = await enquiriesService.findAll(context, filters);
      res.json({ success: true, data: result });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  async getById(req: Request, res: Response) {
    try {
      const context = this.getContext(req);
      if (!context) return res.status(401).json({ success: false, message: "No school context" });

      const result = await enquiriesService.findById(context, req.params.id);
      if (!result) {
        return res.status(404).json({ success: false, message: "Enquiry not found" });
      }
      res.json({ success: true, data: result });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  async create(req: Request, res: Response) {
    try {
      const context = this.getContext(req);
      if (!context) return res.status(401).json({ success: false, message: "No school context" });

      const result = await enquiriesService.create(context, req.body);
      res.status(201).json({ success: true, data: result });
    } catch (error: any) {
      res.status(400).json({ success: false, message: error.message });
    }
  }

  async update(req: Request, res: Response) {
    try {
      const context = this.getContext(req);
      if (!context) return res.status(401).json({ success: false, message: "No school context" });

      const result = await enquiriesService.update(context, req.params.id, req.body);
      if (!result) {
        return res.status(404).json({ success: false, message: "Enquiry not found" });
      }
      res.json({ success: true, data: result });
    } catch (error: any) {
      res.status(400).json({ success: false, message: error.message });
    }
  }

  async delete(req: Request, res: Response) {
    try {
      const context = this.getContext(req);
      if (!context) return res.status(401).json({ success: false, message: "No school context" });

      const result = await enquiriesService.delete(context, req.params.id);
      res.json({ success: true, data: result });
    } catch (error: any) {
      res.status(400).json({ success: false, message: error.message });
    }
  }

  // ==================== ENQUIRY ACTIONS ====================

  async assign(req: Request, res: Response) {
    try {
      const context = this.getContext(req);
      if (!context) return res.status(401).json({ success: false, message: "No school context" });

      const { assigned_to } = req.body;
      if (!assigned_to) {
        return res.status(400).json({ success: false, message: "assigned_to is required" });
      }

      const result = await enquiriesService.assign(context, req.params.id, assigned_to);
      res.json({ success: true, data: result });
    } catch (error: any) {
      res.status(400).json({ success: false, message: error.message });
    }
  }

  async updateStatus(req: Request, res: Response) {
    try {
      const context = this.getContext(req);
      if (!context) return res.status(401).json({ success: false, message: "No school context" });

      const { status } = req.body;
      if (!status) {
        return res.status(400).json({ success: false, message: "status is required" });
      }

      const result = await enquiriesService.updateStatus(context, req.params.id, status);
      res.json({ success: true, data: result });
    } catch (error: any) {
      res.status(400).json({ success: false, message: error.message });
    }
  }

  async convertToStudent(req: Request, res: Response) {
    try {
      const context = this.getContext(req);
      if (!context) return res.status(401).json({ success: false, message: "No school context" });

      const { student_id } = req.body;
      if (!student_id) {
        return res.status(400).json({ success: false, message: "student_id is required" });
      }

      const result = await enquiriesService.convertToStudent(context, req.params.id, student_id);
      res.json({ success: true, data: result });
    } catch (error: any) {
      res.status(400).json({ success: false, message: error.message });
    }
  }

  async getStatistics(req: Request, res: Response) {
    try {
      const context = this.getContext(req);
      if (!context) return res.status(401).json({ success: false, message: "No school context" });

      const { date_from, date_to } = req.query;
      const result = await enquiriesService.getStatistics(
        context,
        date_from as string,
        date_to as string
      );
      res.json({ success: true, data: result });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  // ==================== ENQUIRY TYPES ====================

  async getAllTypes(req: Request, res: Response) {
    try {
      const context = this.getContext(req);
      if (!context) return res.status(401).json({ success: false, message: "No school context" });

      const result = await enquiriesService.findAllTypes(context);
      res.json({ success: true, data: result });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  async createType(req: Request, res: Response) {
    try {
      const context = this.getContext(req);
      if (!context) return res.status(401).json({ success: false, message: "No school context" });

      const result = await enquiriesService.createType(context, req.body);
      res.status(201).json({ success: true, data: result });
    } catch (error: any) {
      res.status(400).json({ success: false, message: error.message });
    }
  }

  async updateType(req: Request, res: Response) {
    try {
      const context = this.getContext(req);
      if (!context) return res.status(401).json({ success: false, message: "No school context" });

      const result = await enquiriesService.updateType(context, req.params.id, req.body);
      res.json({ success: true, data: result });
    } catch (error: any) {
      res.status(400).json({ success: false, message: error.message });
    }
  }

  async deleteType(req: Request, res: Response) {
    try {
      const context = this.getContext(req);
      if (!context) return res.status(401).json({ success: false, message: "No school context" });

      const result = await enquiriesService.deleteType(context, req.params.id);
      res.json({ success: true, data: result });
    } catch (error: any) {
      res.status(400).json({ success: false, message: error.message });
    }
  }

  // ==================== ENQUIRY SOURCES ====================

  async getAllSources(req: Request, res: Response) {
    try {
      const context = this.getContext(req);
      if (!context) return res.status(401).json({ success: false, message: "No school context" });

      const result = await enquiriesService.findAllSources(context);
      res.json({ success: true, data: result });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  async createSource(req: Request, res: Response) {
    try {
      const context = this.getContext(req);
      if (!context) return res.status(401).json({ success: false, message: "No school context" });

      const result = await enquiriesService.createSource(context, req.body);
      res.status(201).json({ success: true, data: result });
    } catch (error: any) {
      res.status(400).json({ success: false, message: error.message });
    }
  }

  async updateSource(req: Request, res: Response) {
    try {
      const context = this.getContext(req);
      if (!context) return res.status(401).json({ success: false, message: "No school context" });

      const result = await enquiriesService.updateSource(context, req.params.id, req.body);
      res.json({ success: true, data: result });
    } catch (error: any) {
      res.status(400).json({ success: false, message: error.message });
    }
  }

  async deleteSource(req: Request, res: Response) {
    try {
      const context = this.getContext(req);
      if (!context) return res.status(401).json({ success: false, message: "No school context" });

      const result = await enquiriesService.deleteSource(context, req.params.id);
      res.json({ success: true, data: result });
    } catch (error: any) {
      res.status(400).json({ success: false, message: error.message });
    }
  }

  // ==================== ENQUIRY NOTES ====================

  async getNotes(req: Request, res: Response) {
    try {
      const context = this.getContext(req);
      if (!context) return res.status(401).json({ success: false, message: "No school context" });

      const result = await enquiriesService.findNotesByEnquiryId(context, req.params.enquiryId);
      res.json({ success: true, data: result });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  async createNote(req: Request, res: Response) {
    try {
      const context = this.getContext(req);
      if (!context) return res.status(401).json({ success: false, message: "No school context" });

      const { enquiry_id, ...noteData } = req.body;
      const result = await enquiriesService.createNote(context, { ...noteData, enquiry_id: Number(enquiry_id) });
      res.status(201).json({ success: true, data: result });
    } catch (error: any) {
      res.status(400).json({ success: false, message: error.message });
    }
  }

  async updateNote(req: Request, res: Response) {
    try {
      const context = this.getContext(req);
      if (!context) return res.status(401).json({ success: false, message: "No school context" });

      const result = await enquiriesService.updateNote(context, req.params.id, req.body);
      res.json({ success: true, data: result });
    } catch (error: any) {
      res.status(400).json({ success: false, message: error.message });
    }
  }

  async deleteNote(req: Request, res: Response) {
    try {
      const context = this.getContext(req);
      if (!context) return res.status(401).json({ success: false, message: "No school context" });

      const result = await enquiriesService.deleteNote(context, req.params.id);
      res.json({ success: true, data: result });
    } catch (error: any) {
      res.status(400).json({ success: false, message: error.message });
    }
  }

  // ==================== ENQUIRY ATTACHMENTS ====================

  async getAttachments(req: Request, res: Response) {
    try {
      const context = this.getContext(req);
      if (!context) return res.status(401).json({ success: false, message: "No school context" });

      const result = await enquiriesService.findAttachmentsByEnquiryId(context, req.params.enquiryId);
      res.json({ success: true, data: result });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  async createAttachment(req: Request, res: Response) {
    try {
      const context = this.getContext(req);
      if (!context) return res.status(401).json({ success: false, message: "No school context" });

      const { enquiry_id, ...attachmentData } = req.body;
      const result = await enquiriesService.createAttachment(context, { ...attachmentData, enquiry_id });
      res.status(201).json({ success: true, data: result });
    } catch (error: any) {
      res.status(400).json({ success: false, message: error.message });
    }
  }

  async deleteAttachment(req: Request, res: Response) {
    try {
      const context = this.getContext(req);
      if (!context) return res.status(401).json({ success: false, message: "No school context" });

      const result = await enquiriesService.deleteAttachment(context, req.params.id);
      res.json({ success: true, data: result });
    } catch (error: any) {
      res.status(400).json({ success: false, message: error.message });
    }
  }

  // ==================== ENQUIRY STATUS TYPES ====================

  async getAllStatusTypes(req: Request, res: Response) {
    try {
      const context = this.getContext(req);
      if (!context) return res.status(401).json({ success: false, message: "No school context" });
      const result = await enquiriesService.findAllStatusTypes(context);
      res.json({ success: true, data: result });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  async createStatusType(req: Request, res: Response) {
    try {
      const context = this.getContext(req);
      if (!context) return res.status(401).json({ success: false, message: "No school context" });
      const result = await enquiriesService.createStatusType(context, req.body);
      res.status(201).json({ success: true, data: result });
    } catch (error: any) {
      res.status(400).json({ success: false, message: error.message });
    }
  }

  async updateStatusType(req: Request, res: Response) {
    try {
      const context = this.getContext(req);
      if (!context) return res.status(401).json({ success: false, message: "No school context" });
      const result = await enquiriesService.updateStatusType(context, req.params.id, req.body);
      res.json({ success: true, data: result });
    } catch (error: any) {
      res.status(400).json({ success: false, message: error.message });
    }
  }

  async deleteStatusType(req: Request, res: Response) {
    try {
      const context = this.getContext(req);
      if (!context) return res.status(401).json({ success: false, message: "No school context" });
      const result = await enquiriesService.deleteStatusType(context, req.params.id);
      res.json({ success: true, data: result });
    } catch (error: any) {
      res.status(400).json({ success: false, message: error.message });
    }
  }

  // ==================== ENQUIRY PRIORITY LEVELS ====================

  async getAllPriorityLevels(req: Request, res: Response) {
    try {
      const context = this.getContext(req);
      if (!context) return res.status(401).json({ success: false, message: "No school context" });
      const result = await enquiriesService.findAllPriorityLevels(context);
      res.json({ success: true, data: result });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  async createPriorityLevel(req: Request, res: Response) {
    try {
      const context = this.getContext(req);
      if (!context) return res.status(401).json({ success: false, message: "No school context" });
      const result = await enquiriesService.createPriorityLevel(context, req.body);
      res.status(201).json({ success: true, data: result });
    } catch (error: any) {
      res.status(400).json({ success: false, message: error.message });
    }
  }

  async updatePriorityLevel(req: Request, res: Response) {
    try {
      const context = this.getContext(req);
      if (!context) return res.status(401).json({ success: false, message: "No school context" });
      const result = await enquiriesService.updatePriorityLevel(context, req.params.id, req.body);
      res.json({ success: true, data: result });
    } catch (error: any) {
      res.status(400).json({ success: false, message: error.message });
    }
  }

  async deletePriorityLevel(req: Request, res: Response) {
    try {
      const context = this.getContext(req);
      if (!context) return res.status(401).json({ success: false, message: "No school context" });
      const result = await enquiriesService.deletePriorityLevel(context, req.params.id);
      res.json({ success: true, data: result });
    } catch (error: any) {
      res.status(400).json({ success: false, message: error.message });
    }
  }

  // ==================== ENQUIRY SUBJECTS ====================

  async getAllSubjects(req: Request, res: Response) {
    try {
      const context = this.getContext(req);
      if (!context) return res.status(401).json({ success: false, message: "No school context" });
      const result = await enquiriesService.findAllSubjects(context);
      res.json({ success: true, data: result });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  async createSubject(req: Request, res: Response) {
    try {
      const context = this.getContext(req);
      if (!context) return res.status(401).json({ success: false, message: "No school context" });
      const result = await enquiriesService.createSubject(context, req.body);
      res.status(201).json({ success: true, data: result });
    } catch (error: any) {
      res.status(400).json({ success: false, message: error.message });
    }
  }

  async updateSubject(req: Request, res: Response) {
    try {
      const context = this.getContext(req);
      if (!context) return res.status(401).json({ success: false, message: "No school context" });
      const result = await enquiriesService.updateSubject(context, req.params.id, req.body);
      res.json({ success: true, data: result });
    } catch (error: any) {
      res.status(400).json({ success: false, message: error.message });
    }
  }

  async deleteSubject(req: Request, res: Response) {
    try {
      const context = this.getContext(req);
      if (!context) return res.status(401).json({ success: false, message: "No school context" });
      const result = await enquiriesService.deleteSubject(context, req.params.id);
      res.json({ success: true, data: result });
    } catch (error: any) {
      res.status(400).json({ success: false, message: error.message });
    }
  }
}

export const enquiriesController = new EnquiriesController();
