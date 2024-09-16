import { z } from "zod";
import * as Constants from "./tables.constants";
import { PaginationResponse } from "../commons/dto";

export const CreateTableRequest = z.object({
  body: z.object({
    number: z.number().int().min(1),
    brand: z.enum([Object.values(Constants.TableBrandsEnum)[0], ...Object.values(Constants.TableBrandsEnum).slice(1)]),
  })
});

export type TableResponse = {
  id: string,
  number: number,
  brand: string,
  created_at: Date,
  updated_at: Date,
}

export const GetTablesRequest = z.object({
  query: z.object({
    page: z
      .string()
      .transform((val) => parseInt(val, 10)).refine((val) => !isNaN(val) || val < 1, {
        message: `Page must be a positive integer value`
      })
      .optional(),
    limit: z
    .string()
    .transform((val) => parseInt(val, 10)).refine((val) => !isNaN(val) || val < 1, {
      message: `Limit must be a positive integer value`
    })
    .optional(),
  })
});

export type GetTablesResponse = PaginationResponse & {
  tables: TableResponse[]
}

export const GetTableRequest = z.object({
  params: z.object({
    id: z.string().uuid()
  })
});

export const DeleteTableRequest = z.object({
  params: z.object({
    id: z.string().uuid()
  })
});

export const UpdateTableRequest = z.object({
  params: z.object({
    id: z.string().uuid()
  })
});