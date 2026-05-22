import { Request, Response } from "express";
import service from "./service.js";

async function getAll(req: Request, res: Response) {
  const promotions = await service.getAll(req.query);
  res.json(promotions);
}

async function getById(req: Request, res: Response) {
  const promotion = await service.getById(Number(req.params.id));
  res.json(promotion);
}

async function create(req: Request, res: Response) {
  const promotion = await service.create(req.body);
  res.status(201).json(promotion);
}

async function update(req: Request, res: Response) {
  const promotion = await service.update(Number(req.params.id), req.body);
  res.json(promotion);
}

async function deletePromotion(req: Request, res: Response) {
  await service.delete(Number(req.params.id));
  res.status(204).send();
}

export default { getAll, getById, create, update, delete: deletePromotion };