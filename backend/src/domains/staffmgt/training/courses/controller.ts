import { Request, Response } from "express";
import service from "./service.js";

async function getAll(req: Request, res: Response) {
  const courses = await service.getAll(req.query);
  res.json(courses);
}

async function getById(req: Request, res: Response) {
  const course = await service.getById(Number(req.params.id));
  res.json(course);
}

async function create(req: Request, res: Response) {
  const course = await service.create(req.body);
  res.status(201).json(course);
}

async function update(req: Request, res: Response) {
  const course = await service.update(Number(req.params.id), req.body);
  res.json(course);
}

async function deleteCourse(req: Request, res: Response) {
  await service.delete(Number(req.params.id));
  res.status(204).send();
}

export default { getAll, getById, create, update, delete: deleteCourse };