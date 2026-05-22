import { Request, Response, NextFunction } from "express";
import { permissionsService } from "./service.js";

export class PermissionsController {
  async getAll(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await permissionsService.findAll();
      res.json({ success: true, data });
    } catch (err) {
      next(err);
    }
  }

  async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await permissionsService.findById(req.params.id);
      res.json({ success: true, data });
    } catch (err) {
      next(err);
    }
  }

  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await permissionsService.create(req.body);
      res.status(201).json({ success: true, data });
    } catch (err) {
      next(err);
    }
  }

  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await permissionsService.update(req.params.id, req.body);
      res.json({ success: true, data });
    } catch (err) {
      next(err);
    }
  }

  async delete(req: Request, res: Response, next: NextFunction) {
    try {
      await permissionsService.delete(req.params.id);
      res.json({ success: true, message: "Permission deleted successfully" });
    } catch (err) {
      next(err);
    }
  }

  async getSidebar(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await permissionsService.getSidebar();
      res.json({ success: true, data });
    } catch (err) {
      next(err);
    }
  }
}

export const permissionsController = new PermissionsController();