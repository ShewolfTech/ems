import { Request, Response } from "express";
import service from "./service.js";

async function getAll(req: Request, res: Response) {
  const applications = await service.getAll(req.query);
  res.json(applications);
}

async function getById(req: Request, res: Response) {
  const application = await service.getById(Number(req.params.id));
  res.json(application);
}

async function create(req: Request, res: Response) {
  const application = await service.create(req.body);
  res.status(201).json(application);
}

async function update(req: Request, res: Response) {
  const application = await service.update(Number(req.params.id), req.body);
  res.json(application);
}

async function deleteApplication(req: Request, res: Response) {
  await service.delete(Number(req.params.id));
  res.status(204).send();
}

export default { getAll, getById, create, update, delete: deleteApplication };