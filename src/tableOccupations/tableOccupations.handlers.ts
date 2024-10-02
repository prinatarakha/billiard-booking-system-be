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

export const getTableOccupations = async (req: Request, res: Response) => {
  const params = { 
    page: req.query.page ? parseInt(req.query.page as string) : undefined, 
    pageSize: req.query.limit ? parseInt(req.query.limit as string) : undefined, 
    tableId: req.query.table_id as string | undefined,
    sort: req.query.sort as string || "started_at:desc",
  }
  const response = await Services.getTableOccupations(params);
  return res.status(response.status).json(response.data);
}

export const getTableOccupation = async (req: Request, res: Response) => {
  const params = { id: req.params.id as string };
  const response = await Services.getTableOccupation(params);
  return res.status(response.status).json(response.data);
}