import { Request, Response } from "express";
import service from "./service.js";

async function getAll(req: Request, res: Response) {
  const attendance = await service.getAll(req.query);
  res.json(attendance);
}

async function getById(req: Request, res: Response) {
  const attendance = await service.getById(Number(req.params.id));
  res.json(attendance);
}

async function create(req: Request, res: Response) {
  const attendance = await service.create(req.body);
  res.status(201).json(attendance);
}

async function update(req: Request, res: Response) {
  const attendance = await service.update(Number(req.params.id), req.body);
  res.json(attendance);
}

async function clockIn(req: Request, res: Response) {
  const { staff_id, device_id } = req.body;
  const attendance = await service.clockIn(staff_id, device_id);
  res.json(attendance);
}

async function clockOut(req: Request, res: Response) {
  const { staff_id, device_id } = req.body;
  const attendance = await service.clockOut(staff_id, device_id);
  res.json(attendance);
}

async function todaySummary(req: Request, res: Response) {
  const { school_id } = req.query;
  const summary = await service.todaySummary(Number(school_id));
  res.json(summary);
}

async function deleteAttendance(req: Request, res: Response) {
  await service.delete(Number(req.params.id));
  res.status(204).send();
}

export default { getAll, getById, create, update, clockIn, clockOut, todaySummary, delete: deleteAttendance };