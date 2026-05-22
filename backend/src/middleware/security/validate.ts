// backend/src/middleware/security/validate.ts

import { Request, Response, NextFunction } from "express";
import { body, validationResult } from "express-validator";

// Accept either email or username for login
export const validateLogin = [
  body("password").isLength({ min: 6 }).withMessage("Password must be at least 6 chars"),
  body("schoolId").isNumeric().withMessage("schoolId must be a number"),
  body().custom(value => {
    if (!value.email && !value.username) {
      throw new Error("Either email or username is required");
    }
    return true;
  }),
  (req: Request, res: Response, next: NextFunction) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  },
];

export const validateRegister = [
  body("email").isEmail().withMessage("Valid email required"),
  body("password").isLength({ min: 6 }).withMessage("Password must be at least 6 chars"),
  body("username").notEmpty().withMessage("Username is required"),
  body("schoolId").isNumeric().withMessage("schoolId must be a number"),
  body("name").notEmpty().withMessage("Name is required"),
  (req: Request, res: Response, next: NextFunction) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  },
];
