import { Request, Response } from "express";
import service from "./service.js";

async function getAll(req: Request, res: Response) {
  const records = await service.getAll(req.query);
  res.json(records);
}

async function getById(req: Request, res: Response) {
  const record = await service.getById(Number(req.params.id));
  res.json(record);
}

async function create(req: Request, res: Response) {
  const record = await service.create(req.body);
  res.status(201).json(record);
}

async function update(req: Request, res: Response) {
  const record = await service.update(Number(req.params.id), req.body);
  res.json(record);
}

async function resolve(req: Request, res: Response) {
  const { resolved_by, resolution_notes, action_taken } = req.body;
  const record = await service.resolve(Number(req.params.id), resolved_by, resolution_notes, action_taken);
  res.json(record);
}

async function deleteRecord(req: Request, res: Response) {
  await service.delete(Number(req.params.id));
  res.status(204).send();
}

export default { getAll, getById, create, update, resolve, delete: deleteRecord };