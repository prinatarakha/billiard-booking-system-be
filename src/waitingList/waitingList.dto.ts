import { z } from "zod";
import * as Constants from "./waitingList.constants";
import { PaginationResponse } from "../commons/dto";

export const CreateWaitingListEntryRequest = z.object({
  body: z.object({
    customer_name: z.string(),
    customer_phone: z
      .string()
      .regex(/^\+?[1-9]\d{1,14}$/, {
        message: "Invalid phone number format",
      })
      .optional(),
    table_id: z.string().uuid().optional(),
  })
});

export type WaitingListEntryResponse = {
  id: string,
  customer_name: string,
  customer_phone: string | null,
  status: string,
  table_id: string | null,
  table_occupation_id: string | null,
  created_at: Date,
  updated_at: Date,
}
