import { Request, Response } from "express";
import service from "./service.js";

async function getAll(req: Request, res: Response) {
  const payroll = await service.getAll(req.query);
  res.json(payroll);
}

async function getById(req: Request, res: Response) {
  const payroll = await service.getById(Number(req.params.id));
  res.json(payroll);
}

async function create(req: Request, res: Response) {
  const payroll = await service.create(req.body);
  res.status(201).json(payroll);
}

async function update(req: Request, res: Response) {
  const payroll = await service.update(Number(req.params.id), req.body);
  res.json(payroll);
}

async function deletePayroll(req: Request, res: Response) {
  await service.delete(Number(req.params.id));
  res.status(204).send();
}

export default { getAll, getById, create, update, delete: deletePayroll };