import { NextFunction, Request, Response } from "express";
import { ZodSchema } from "zod";
import { ApiError } from "./error";

export function validateBody(schema: ZodSchema) {
  return (req: Request, _res: Response, next: NextFunction) => {
    const result = schema.safeParse(req.body);
    if (!result.success) {
      const message = result.error.errors.map((e) => `${e.path.join(".")}: ${e.message}`).join("; ");
      return next(new ApiError(400, "validation_error", message));
    }
    req.body = result.data;
    next();
  };
}
