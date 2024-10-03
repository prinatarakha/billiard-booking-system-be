import { z } from "zod";
// import * as Constants from "./tableOccupations.constants";
import { PaginationResponse } from "../commons/dto";
import { TableResponse } from "../tables/tables.dto";
import { SORT_DIRECTIONS } from "../commons/constants";

export const OccupyTableRequest = z.object({
  body: z.object({
    table_id: z.string().uuid(),
    started_at: z.string().datetime({message: "must be in ISO string format. Example: '2023-09-28T14:45:00Z"}).optional(),
    finished_at: z.string().datetime().optional(),
  })
});

export const GetTableOccupationRequest = z.object({
  params: z.object({
    id: z.string().uuid(),
  }),
  query: z.object({
    with_table: z.string().optional(),
  })
});

export const DeleteTableOccupationRequest = z.object({
  params: z.object({
    id: z.string().uuid(),
  })
});

export type TableOccupationResponse = {
  id: string,
  table_id: string,
  started_at: Date,
  finished_at: Date | null,
  created_at: Date,
  updated_at: Date,
  table?: TableResponse
}

export const GetTableOccupationsRequest = z.object({
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
    sort: z
      .string()
      .refine((val) => {
        const arr = val.split(":");
        return arr.length === 2 && SORT_DIRECTIONS.includes(arr[1])
      }, {
        message: `Sort query must be in this format: '<field>:<asc/desc>'`
      })
      .optional(),
  })
});

export type GetTableOccupationsResponse = PaginationResponse & {
  table_id: string | null,
  table_occupations: TableOccupationResponse[],
}