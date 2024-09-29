import { Request, Response } from "express";
import * as Services from "./tableOccupations.services";

export const occupyTable = async (req: Request, res: Response) => {
  const startedAt = new Date(req.body.started_at);
  const finishedAt = new Date(req.body.finished_at);
  const params = { 
    tableId: req.body.table_id as string, 
    startedAt: !isNaN(startedAt.getTime()) ? startedAt : undefined, 
    finishedAt: !isNaN(finishedAt.getTime()) ? finishedAt : undefined, 
  };
  const response = await Services.occupyTable(params);
  return res.status(response.status).json(response.data);
}