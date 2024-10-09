import { Prisma } from "@prisma/client";
import { BadRequestResponse, InternalServerErrorResponse, NotFoundResponse, UnprocessableEntityResponse } from "../commons/exceptions";
import { log, logError } from "../commons/log";
import { APIResponse, ErrorResponse } from "../commons/response";
import * as DAO from "./tables.dao";
import { GetTablesResponse, TableResponse, UpdateTablesResponse } from "./tables.dto";
import prismaClient from "../db";

export const createTable = async (params: {
  number: number,
  brand: string,
}) => {
  log(`create_table: params=${JSON.stringify(params)}`);
  try {
    const existingTables = await DAO.getTables({number: params.number});
    if (existingTables.length) return new UnprocessableEntityResponse(`Table with number='${params.number}' has exists with id='${existingTables[0].id}'`);
    const table = await DAO.createTable(params);
    log(`create_table: created=${JSON.stringify(table)}`);

    const response: TableResponse = {
      id: table.id,
      number: table.number,
      brand: table.brand,
      created_at: table.createdAt,
      updated_at: table.updatedAt,
    }
    return new APIResponse(201, response).generate();
  } catch (err) {
    logError(`create_table: params=${JSON.stringify(params)} - error: '${err}'`);
    return new InternalServerErrorResponse(`Failed to create new table`).generate();
  }
}

export const getTables = async (params: {
  page?: number,
  pageSize?: number, // same as "limit" in API request, and "take" in Prisma
}) => {
  if (!params.page) params.page = 1;
  if (!params.pageSize) params.pageSize = 10;

  log(`get_tables: params=${JSON.stringify(params)}`);

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
    logError(`get_tables: params=${JSON.stringify(params)} - error: '${err}'`);
    return new InternalServerErrorResponse(`Failed to get tables`).generate();
  }
}

export const getTable = async (params: { id: string }) => {
  log(`get_table: params=${JSON.stringify(params)}`);

  try {
    const table = await DAO.getTable({id: params.id});
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
    logError(`get_table: params=${JSON.stringify(params)} - error: '${err}'`);
    return new InternalServerErrorResponse(`Failed to get a table with id='${params.id}'`).generate();
  }
}

export const deleteTable = async (params: { id: string }) => {
  log(`delete_table: params=${JSON.stringify(params)}`);

  try {
    const table = await DAO.getTable({id: params.id});
    if (!table) return new NotFoundResponse(`Table with id='${params.id}' is not found`);
    
    await DAO.deleteTable({id: params.id});

    const response: TableResponse = {
      id: table.id,
      number: table.number,
      brand: table.brand,
      created_at: table.createdAt,
      updated_at: table.updatedAt,
    }
    return new APIResponse(200, response).generate();
  } catch (err) {
    logError(`delete_table: params=${JSON.stringify(params)} - error: '${err}'`);
    return new InternalServerErrorResponse(`Failed to delete a table with id='${params.id}'`).generate();
  }
}

export const updateTables = async (params: { 
  tables: {
    id: string,
    number?: number,
    brand?: string,
  }[]
}) => {
  log(`update_tables: params=${JSON.stringify(params)}`);

  try {
    // check if there's nothing to update
    const notUpdatedTable = params.tables.find((table) => !table.number && !table.brand);
    if (notUpdatedTable) return new BadRequestResponse(`Nothing to update table with id='${notUpdatedTable.id}'`);

    // check if a table has multiple update operations. A table can only have 1 update operation in a request.
    let duplicatedTableId = "";
    const updateTableMap = params.tables.reduce((map, table) => {
      if (map.get(table.id)) duplicatedTableId = table.id;
      map.set(table.id, table);
      return map;
    }, new Map<string, {
      id: string,
      number?: number,
      brand?: string,
    }>());
    if (duplicatedTableId) return new BadRequestResponse(`Table IDs must be unique. Multiple tables with id='${duplicatedTableId}' are found in update operations`);

    const tableIds = Object.keys(updateTableMap);

    const tables = await DAO.getTables({ids: tableIds});
    const existingTableMap = tables.reduce((map, table) => {
      map.set(table.id, table);
      return map;
    }, new Map<string, Prisma.TableGetPayload<{}>>());
    const inexistentTableId = tableIds.find((id) => !existingTableMap.get(id));
    if (inexistentTableId) return new NotFoundResponse(`Table with id='${inexistentTableId}' is not found`);

    const updatedTables: Prisma.TableGetPayload<{}>[] = [];

    await prismaClient.$transaction(async (trx) => {
      const result = await Promise.all(params.tables.map(
        (table) => DAO.updateTable(
          { id: table.id }, 
          table, 
          trx
        )
      ));
      updatedTables.push(...result);

      // validate if all table numbers are unique
      const tables = await DAO.getTables({ numbers: result.map(t => t.number) }, trx);
      tables.reduce((map, table) => {
        const existingTableId = map.get(table.number);
        if (existingTableId) throw new UnprocessableEntityResponse(`Duplicated Table number=${table.number} for tables with ids=['${existingTableId}', '${table.id}']`);
        map.set(table.number, table.id);
        return map;
      }, new Map<number, string>());

    });

    log(`update_tables: updated=${JSON.stringify(updatedTables)}`);

    const response: UpdateTablesResponse = { 
      updated_tables: updatedTables.map((table) => ({
        id: table.id,
        number: table.number,
        brand: table.brand,
        created_at: table.createdAt,
        updated_at: table.updatedAt,
      })),
    }

    return new APIResponse(200, response).generate();
  } catch (err) {
    if (err instanceof ErrorResponse) return err.generate();

    logError(`update_tables: params=${JSON.stringify(params)} - error: '${err}'`);
    return new InternalServerErrorResponse(`Failed to update tables`).generate();
  }
}