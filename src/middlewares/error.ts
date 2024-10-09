import { NextFunction, Request, Response } from "express";
import ErrorHandler from "../utils/utitlity-class.js";
import { ControllerType } from "../types/types.js";
export function errorMiddleware(
  err: ErrorHandler,
  req: Request,
  res: Response,
  next: NextFunction
) {
  if(err.name === "CastError") err.message = "Invalid Id";
  res
    .status(err.statusCode || 500)
    .json({ message: err.message || "Internal Server Error" });
}

export const TryCatch =
  (func: ControllerType) =>
  (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(func(req, res, next)).catch(next);
  };