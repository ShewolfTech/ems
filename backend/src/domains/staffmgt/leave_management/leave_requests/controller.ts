import { Request, Response } from "express";
import service from "./service.js";

async function getAll(req: Request, res: Response) {
  const requests = await service.getAll(req.query);
  res.json(requests);
}

async function getById(req: Request, res: Response) {
  const request = await service.getById(Number(req.params.id));
  res.json(request);
}

async function create(req: Request, res: Response) {
  const request = await service.create(req.body);
  res.status(201).json(request);
}

async function update(req: Request, res: Response) {
  const request = await service.update(Number(req.params.id), req.body);
  res.json(request);
}

async function approve(req: Request, res: Response) {
  const { approved_by } = req.body;
  const request = await service.approve(Number(req.params.id), approved_by);
  res.json(request);
}

async function reject(req: Request, res: Response) {
  const { approved_by, reason } = req.body;
  const request = await service.reject(Number(req.params.id), approved_by, reason);
  res.json(request);
}

async function deleteRequest(req: Request, res: Response) {
  await service.delete(Number(req.params.id));
  res.status(204).send();
}

export default { getAll, getById, create, update, approve, reject, delete: deleteRequest };