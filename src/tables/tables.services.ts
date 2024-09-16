import { InternalServerErrorResponse, NotFoundResponse, UnprocessableEntityResponse } from "../commons/exceptions";
import { log, logError } from "../commons/log";
import { APIResponse } from "../commons/response";
import * as DAO from "./tables.dao";
import { GetTablesResponse, TableResponse } from "./tables.dto";

export const createTable = async (params: {
  number: number,
  brand: string,
}) => {
  try {
    const existingTable = await DAO.getTableByNumber(params.number);
    if (existingTable) return new UnprocessableEntityResponse(`Table with number='${params.number}' has exists with id='${existingTable.id}'`);
    const table = await DAO.createTable(params);
    log(`create_table: table=${JSON.stringify(table)}`);

    const response: TableResponse = {
      id: table.id,
      number: table.number,
      brand: table.brand,
      created_at: table.createdAt,
      updated_at: table.updatedAt,
    }
    return new APIResponse(201, response).generate();
  } catch (err) {
    logError(`create_table: params: ${JSON.stringify(params)} - error: '${err}'`);
    return new InternalServerErrorResponse(err).generate();
  }
}

export const getTables = async (params: {
  page?: number,
  pageSize?: number, // same as "limit" in API request, and "take" in Prisma
}) => {
  if (!params.page) params.page = 1;
  if (!params.pageSize) params.pageSize = 10;

  try {
    const tables = await DAO.getTables({
      skip: (params.page - 1) * params.pageSize,  // Skip the previous pages
      take: params.pageSize,
    });
    const count = await DAO.countTables();
    const totalPages = Math.ceil(count / params.pageSize);
    const response: GetTablesResponse = {
      page: params.page,
      limit: params.pageSize,
      count: count,
      total_pages: totalPages,
      tables: tables.map((table) => ({
        id: table.id,
        number: table.number,
        brand: table.brand,
        created_at: table.createdAt,
        updated_at: table.updatedAt,
      } as TableResponse)),
    }
    return new APIResponse(200, response).generate();
  } catch (err) {
    logError(`get_tables - params: ${JSON.stringify(params)} - error: '${err}'`);
    return new InternalServerErrorResponse(err).generate();
  }
}

export const getTable = async (params: { id: string }) => {
  try {
    const table = await DAO.getTableById(params.id);
    if (!table) return new NotFoundResponse(`Table with id='${params.id}' is not found`);

    const response: TableResponse = {
      id: table.id,
      number: table.number,
      brand: table.brand,
      created_at: table.createdAt,
      updated_at: table.updatedAt,
    }
    return new APIResponse(200, response).generate();
  } catch (err) {
    logError(`get_table - params: ${JSON.stringify(params)} - error: '${err}'`);
    return new InternalServerErrorResponse(err).generate();
  }
}