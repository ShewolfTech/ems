import { Request, Response } from "express";
import service from "./service.js";

async function getAll(req: Request, res: Response) {
  const reviews = await service.getAll(req.query);
  res.json(reviews);
}

async function getById(req: Request, res: Response) {
  const review = await service.getById(Number(req.params.id));
  res.json(review);
}

async function create(req: Request, res: Response) {
  const review = await service.create(req.body);
  res.status(201).json(review);
}

async function update(req: Request, res: Response) {
  const review = await service.update(Number(req.params.id), req.body);
  res.json(review);
}

async function deleteReview(req: Request, res: Response) {
  await service.delete(Number(req.params.id));
  res.status(204).send();
}

export default { getAll, getById, create, update, delete: deleteReview };