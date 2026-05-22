import { Request, Response } from "express";
import { HttpError } from "../../../helpers/error.js";
import service from "./service.js";

async function getAll(req: Request, res: Response) {
  const jobs = await service.getAll();
  res.json(jobs);
}

async function getById(req: Request, res: Response) {
  const job = await service.getById(Number(req.params.id));
  res.json(job);
}

async function create(req: Request, res: Response) {
  const job = await service.create(req.body);
  res.status(201).json(job);
}

async function update(req: Request, res: Response) {
  const job = await service.update(Number(req.params.id), req.body);
  res.json(job);
}

async function deleteJob(req: Request, res: Response) {
  await service.delete(Number(req.params.id));
  res.status(204).send();
}

export default { getAll, getById, create, update, delete: deleteJob };