import { Request, Response } from "express";
import service from "./service.js";

async function getAll(req: Request, res: Response) {
  const contracts = await service.getAll(req.query);
  res.json(contracts);
}

async function getById(req: Request, res: Response) {
  const contract = await service.getById(Number(req.params.id));
  res.json(contract);
}

async function create(req: Request, res: Response) {
  const contract = await service.create(req.body);
  res.status(201).json(contract);
}

async function update(req: Request, res: Response) {
  const contract = await service.update(Number(req.params.id), req.body);
  res.json(contract);
}

async function renew(req: Request, res: Response) {
  const contract = await service.renew(Number(req.params.id));
  res.json(contract);
}

async function deleteContract(req: Request, res: Response) {
  await service.delete(Number(req.params.id));
  res.status(204).send();
}

async function terminate(req: Request, res: Response) {
  const { termination_date, reason } = req.body;
  const contract = await service.terminate(Number(req.params.id), termination_date, reason);
  res.json(contract);
}

export default { getAll, getById, create, update, renew, delete: deleteContract, terminate };