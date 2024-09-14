import { z } from "zod";
import { Request, Response, NextFunction } from "express";
import { InternalServerErrorResponse } from "../commons";

const validateRequest = (schema: z.Schema) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      await schema.parseAsync({
        body: req.body,
        query: req.query,
        params: req.params,
      });
      next();
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({
          message: "Validation errors in your request",
          errors: error.issues,
        });
      } else {
        const errorResponse = new InternalServerErrorResponse().generate();
        return res.status(errorResponse.status).json(errorResponse.data)
      }
    }
  };
};
export default validateRequest;