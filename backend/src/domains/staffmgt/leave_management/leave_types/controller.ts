import { Request, Response } from "express";
import service from "./service.js";

async function getAll(req: Request, res: Response) {
  const types = await service.getAll(req.query);
  res.json(types);
}

async function getById(req: Request, res: Response) {
  const type = await service.getById(Number(req.params.id));
  res.json(type);
}

async function create(req: Request, res: Response) {
  const type = await service.create(req.body);
  res.status(201).json(type);
}

async function update(req: Request, res: Response) {
  const type = await service.update(Number(req.params.id), req.body);
  res.json(type);
}

async function deleteLeaveType(req: Request, res: Response) {
  await service.delete(Number(req.params.id));
  res.status(204).send();
}

export default { getAll, getById, create, update, delete: deleteLeaveType };