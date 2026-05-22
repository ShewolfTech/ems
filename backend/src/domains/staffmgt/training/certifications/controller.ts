import { Request, Response } from "express";
import service from "./service.js";

async function getAll(req: Request, res: Response) {
  const certs = await service.getAll(req.query);
  res.json(certs);
}

async function getById(req: Request, res: Response) {
  const cert = await service.getById(Number(req.params.id));
  res.json(cert);
}

async function create(req: Request, res: Response) {
  const cert = await service.create(req.body);
  res.status(201).json(cert);
}

async function update(req: Request, res: Response) {
  const cert = await service.update(Number(req.params.id), req.body);
  res.json(cert);
}

async function deleteCertification(req: Request, res: Response) {
  await service.delete(Number(req.params.id));
  res.status(204).send();
}

export default { getAll, getById, create, update, delete: deleteCertification };