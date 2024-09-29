import { z } from "zod";
// import * as Constants from "./tableOccupations.constants";
import { PaginationResponse } from "../commons/dto";

export const OccupyTableRequest = z.object({
  body: z.object({
    table_id: z.string().uuid(),
    started_at: z.string().datetime({message: "must be in ISO string format. Example: '2023-09-28T14:45:00Z"}).optional(),
    finished_at: z.string().datetime().optional(),
  })
});

export type TableResponse = {
  id: string,
  number: number,
  brand: string,
  created_at: Date,
  updated_at: Date,
}