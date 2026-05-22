// backend/src/infrastructure/session.ts

import { Request } from "express";

export function getSession(req: Request) {
  return req.user; // hydrated by middleware
}

export function endSession(req: Request) {
  req.user = undefined;
}
