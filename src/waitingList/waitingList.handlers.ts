import { Request, Response } from "express";
import * as Services from "./waitingList.services";

export const createWaitingListEntry = async (req: Request, res: Response) => {
  const params = { 
    customerName: req.body.customer_name as string, 
    customerPhone: req.body.customer_phone as string | undefined,
    tableId: req.body.table_id as string | undefined, 
  };
  const response = await Services.createWaitingListEntry(params);
  return res.status(response.status).json(response.data);
}

export const getWaitingListEntries = async (req: Request, res: Response) => {
  const statuses = req.query.statuses 
    ? (Array.isArray(req.query.statuses)
      ? req.query.statuses.join(",")
      : req.query.statuses)
    : "";

  const params = { 
    page: req.query.page ? parseInt(req.query.page as string) : undefined, 
    pageSize: req.query.limit ? parseInt(req.query.limit as string) : undefined, 
    tableId: req.query.table_id as string | undefined, 
    statuses: statuses ? (statuses as string).split(",") : [],
  };
  const response = await Services.getWaitingListEntries(params);
  return res.status(response.status).json(response.data);
}