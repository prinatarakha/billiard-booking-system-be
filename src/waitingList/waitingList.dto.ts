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

export const GetWaitingListEntriesRequest = z.object({
  query: z.object({
    page: z
      .string()
      .transform((val) => parseInt(val, 10))
      .refine((val) => !isNaN(val) && val > 0, {
        message: `Page must be a positive integer value`
      })
      .optional(),
    limit: z
      .string()
      .transform((val) => parseInt(val, 10))
      .refine((val) => !isNaN(val) && val > 0, {
        message: `Limit must be a positive integer value`
      })
      .optional(),
    table_id: z.string().uuid().optional(),
    statuses: z
      .string()
      .refine((val) => {
        const statuses = val.split(",");
        const waitingListStatuses = Object.values(Constants.WaitingListStatusEnums);
        const isNotValid = statuses.some((status) => {
          const cleanedStatus = status.charAt(0) === "!" ? status.slice(1) : status; // "!" means NOT operator
          return !waitingListStatuses.includes(cleanedStatus)
        });
        return !isNotValid;
      }, {
        message: `Invalid waiting list status!`
      })
      .optional(),
  })
});

export type GetWaitingListEntriesResponse = PaginationResponse & {
  table_id: string | null,
  statuses: string[],
  waiting_list_entries: WaitingListEntryResponse[],
}
