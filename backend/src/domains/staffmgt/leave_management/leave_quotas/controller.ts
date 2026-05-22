import { Request, Response } from "express";
import service from "./service.js";

async function getAll(req: Request, res: Response) {
  const quotas = await service.getAll(req.query);
  res.json(quotas);
}

async function getById(req: Request, res: Response) {
  const quota = await service.getById(Number(req.params.id));
  res.json(quota);
}

async function create(req: Request, res: Response) {
  const quota = await service.create(req.body);
  res.status(201).json(quota);
}

async function update(req: Request, res: Response) {
  const quota = await service.update(Number(req.params.id), req.body);
  res.json(quota);
}

async function deleteQuota(req: Request, res: Response) {
  await service.delete(Number(req.params.id));
  res.status(204).send();
}

export default { getAll, getById, create, update, delete: deleteQuota };