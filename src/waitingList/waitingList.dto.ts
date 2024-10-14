import { z } from "zod";
import * as Constants from "./waitingList.constants";
import { PaginationResponse } from "../commons/dto";
import { TableResponse } from "../tables/tables.dto";
import { TableOccupationResponse } from "../tableOccupations/tableOccupations.dto";

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
  table?: TableResponse,
  table_occupation?: TableOccupationResponse,
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

export const GetWaitingListEntryRequest = z.object({
  params: z.object({
    id: z.string().uuid(),
  }),
  query: z.object({
    with_table: z.enum(["true", "false"]).optional(),
    with_table_occupation: z.enum(["true", "false"]).optional(),
  })
});

export const DeleteWaitingListEntryRequest = z.object({
  params: z.object({
    id: z.string().uuid(),
  }),
});

export const UpdateWaitingListEntryRequest = z.object({
  params: z.object({
    id: z.string().uuid(),
  }),
  body: z.object({
    customer_name: z.string().optional(),
    customer_phone: z
      .string()
      .regex(/^\+?[1-9]\d{1,14}$/, {
        message: "Invalid phone number format",
      })
      .optional(),
    table_id: z.union([
      z.string().uuid(), // set new table
      z.null(), // remove preferred table
    ]).optional(),
    status: z.enum([
      Object.values(Constants.WaitingListStatusEnums)[0], 
      ...Object.values(Constants.WaitingListStatusEnums).slice(1)
    ]).optional(),
    table_occupation_id: z.union([
      z.string().uuid(), // set new table occupation
      z.null(), // remove table occupation
    ]).optional(),
  })
});

export const FulfillWaitingListEntryRequest = z.object({
  params: z.object({
    id: z.string().uuid(),
  }),
  body: z.object({
    table_id: z.string().uuid(),
    started_at: z.string().datetime({message: "must be in ISO string format. Example: '2023-09-28T14:45:00Z"}).optional(),
    finished_at: z.string().datetime().optional(),
  }),
});