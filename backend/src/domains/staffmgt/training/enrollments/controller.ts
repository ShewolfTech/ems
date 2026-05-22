import { Request, Response } from "express";
import service from "./service.js";

async function getAll(req: Request, res: Response) {
  const enrollments = await service.getAll(req.query);
  res.json(enrollments);
}

async function getById(req: Request, res: Response) {
  const enrollment = await service.getById(Number(req.params.id));
  res.json(enrollment);
}

async function create(req: Request, res: Response) {
  const enrollment = await service.create(req.body);
  res.status(201).json(enrollment);
}

async function update(req: Request, res: Response) {
  const enrollment = await service.update(Number(req.params.id), req.body);
  res.json(enrollment);
}

async function complete(req: Request, res: Response) {
  const { grade, feedback } = req.body;
  const enrollment = await service.complete(Number(req.params.id), grade, feedback);
  res.json(enrollment);
}

async function deleteEnrollment(req: Request, res: Response) {
  await service.delete(Number(req.params.id));
  res.status(204).send();
}

export default { getAll, getById, create, update, complete, delete: deleteEnrollment };