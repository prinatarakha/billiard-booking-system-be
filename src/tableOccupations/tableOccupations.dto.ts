import { z } from "zod";
// import * as Constants from "./tableOccupations.constants";
import { PaginationResponse } from "../commons/dto";

export const CreateTableRequest = z.object({
  body: z.object({
    number: z.number().int().min(1),
    // brand: z.enum([Object.values(Constants.TableBrandsEnum)[0], ...Object.values(Constants.TableBrandsEnum).slice(1)]),
  })
});

export type TableResponse = {
  id: string,
  number: number,
  brand: string,
  created_at: Date,
  updated_at: Date,
}