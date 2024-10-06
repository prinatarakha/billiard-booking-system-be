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