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
      : req.query.statuses as string)
    : "";

  const params = { 
    page: req.query.page ? parseInt(req.query.page as string) : undefined, 
    pageSize: req.query.limit ? parseInt(req.query.limit as string) : undefined, 
    tableId: req.query.table_id as string | undefined, 
    statuses: statuses ? (statuses as string).split(",") : [],
    customerName: req.query.customer_name as string | undefined,
    customerPhone: req.query.customer_phone as string | undefined,
    startDate: req.query.start_date ? new Date(req.query.start_date as string) : undefined,
    endDate: req.query.end_date ? new Date(req.query.end_date as string) : undefined,
  };
  const response = await Services.getWaitingListEntries(params);
  return res.status(response.status).json(response.data);
}

export const getWaitingListEntry = async (req: Request, res: Response) => {
  const params = { 
    id: req.params.id as string,
    withTable: req.query.with_table === "true",
    withTableOccupation: req.query.with_table_occupation === "true",
  };
  const response = await Services.getWaitingListEntry(params);
  return res.status(response.status).json(response.data);
}

export const deleteWaitingListEntry = async (req: Request, res: Response) => {
  const params = { id: req.params.id as string };
  const response = await Services.deleteWaitingListEntry(params);
  return res.status(response.status).json(response.data);
}

export const updateWaitingListEntry = async (req: Request, res: Response) => {
  const params = { 
    id: req.params.id as string,
    customerName: req.body.customer_name as string | undefined, 
    customerPhone: req.body.customer_phone as string | undefined,
    tableId: req.body.table_id as string | null | undefined, 
    tableOccupationId: req.body.table_occupation_id as string | null | undefined,
    status: req.body.status as string | undefined,
  };
  const response = await Services.updateWaitingListEntry(params);
  return res.status(response.status).json(response.data);
}

export const fulfillWaitingListEntry = async (req: Request, res: Response) => {
  const startedAt = new Date(req.body.started_at);
  const finishedAt = new Date(req.body.finished_at);
  const params = { 
    id: req.params.id as string,
    tableId: req.body.table_id as string, 
    startedAt: !isNaN(startedAt.getTime()) ? startedAt : undefined, 
    finishedAt: !isNaN(finishedAt.getTime()) ? finishedAt : undefined, 
  };
  const response = await Services.fulfillWaitingListEntry(params);
  return res.status(response.status).json(response.data);
}