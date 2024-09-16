import { z } from "zod";
import * as Constants from "./tables.constants";

export const createTableDto = z.object({
  body: z.object({
    number: z.number().int().min(1),
    brand: z.enum([Constants.TableBrandsEnum.MRSUNG, ...Object.values(Constants.TableBrandsEnum)]),
  })
});

export const getTablesDto = z.object({
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

export const getTableDto = z.object({
  params: z.object({
    id: z.string().uuid()
  })
});