import { Request, Response } from "express";
import * as Services from "./tableOccupations.services";

export const createTableOccupation = async (req: Request, res: Response) => {
  const params = { number: req.body.number, brand: req.body.brand };
  const response = await Services.createTableOccupation(params);
  return res.status(response.status).json(response.data);
}