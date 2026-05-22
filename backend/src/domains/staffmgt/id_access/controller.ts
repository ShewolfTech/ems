import { Request, Response } from "express";
import service from "./service.js";

async function getAll(req: Request, res: Response) {
  const access = await service.getAll(req.query);
  res.json(access);
}

async function getById(req: Request, res: Response) {
  const access = await service.getById(Number(req.params.id));
  res.json(access);
}

async function create(req: Request, res: Response) {
  const access = await service.create(req.body);
  res.status(201).json(access);
}

async function update(req: Request, res: Response) {
  const access = await service.update(Number(req.params.id), req.body);
  res.json(access);
}

async function deactivate(req: Request, res: Response) {
  const access = await service.deactivate(Number(req.params.id));
  res.json(access);
}

async function reactivate(req: Request, res: Response) {
  const access = await service.reactivate(Number(req.params.id));
  res.json(access);
}

async function deleteAccess(req: Request, res: Response) {
  await service.delete(Number(req.params.id));
  res.status(204).send();
}

export default { getAll, getById, create, update, deactivate, reactivate, delete: deleteAccess };