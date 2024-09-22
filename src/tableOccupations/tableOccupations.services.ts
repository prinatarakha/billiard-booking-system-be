import { Prisma } from "@prisma/client";
import { BadRequestResponse, InternalServerErrorResponse, NotFoundResponse, UnprocessableEntityResponse } from "../commons/exceptions";
import { log, logError } from "../commons/log";
import { APIResponse, ErrorResponse } from "../commons/response";
// import * as DAO from "./tableOccupations.dao";
// import { GetTablesResponse, TableResponse, UpdateTablesResponse } from "./tableOccupations.dto";
import prismaClient from "../db";

export const createTableOccupation = async (params: {
  number: number,
  brand: string,
}) => {
  log(`create_table: params=${JSON.stringify(params)}`);
  try {
    // const existingTables = await DAO.getTables({number: params.number});
    // if (existingTables.length) return new UnprocessableEntityResponse(`Table with number='${params.number}' has exists with id='${existingTables[0].id}'`);
    // const table = await DAO.createTable(params);
    // log(`create_table: created=${JSON.stringify(table)}`);

    // const response: TableResponse = {
    //   id: table.id,
    //   number: table.number,
    //   brand: table.brand,
    //   created_at: table.createdAt,
    //   updated_at: table.updatedAt,
    // }
    return new APIResponse(201, {}).generate();
  } catch (err) {
    logError(`create_table: params=${JSON.stringify(params)} - error: '${err}'`);
    return new InternalServerErrorResponse(err).generate();
  }
}