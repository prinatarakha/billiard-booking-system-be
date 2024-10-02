import { Prisma } from "@prisma/client";
import { BadRequestResponse, InternalServerErrorResponse, NotFoundResponse, UnprocessableEntityResponse } from "../commons/exceptions";
import { log, logError } from "../commons/log";
import { APIResponse, ErrorResponse } from "../commons/response";
import * as DAO from "./tableOccupations.dao";
// import { GetTablesResponse, TableResponse, UpdateTablesResponse } from "./tableOccupations.dto";
import prismaClient from "../db";
import * as TableDAO from "../tables/tables.dao";
import dayjs from "dayjs";
import { GetTableOccupationsResponse, TableOccupationResponse } from "./tableOccupations.dto";
import { TableResponse } from "../tables/tables.dto";
import { camelCase } from 'change-case-all';

export const occupyTable = async (params: {
  tableId: string,
  startedAt?: Date,
  finishedAt?: Date,
}) => {
  const now = new Date();
  if (!params.startedAt) params.startedAt = now;
  log(`occupy_table: params=${JSON.stringify(params)}`);

  try {
    if (dayjs(params.startedAt).isBefore(dayjs(now))) {
      return new UnprocessableEntityResponse(`'started_at' must be greater than or equal to the current time.`).generate();
    }
    if (params.finishedAt && dayjs(params.finishedAt).isBefore(dayjs(params.startedAt))) {
      return new UnprocessableEntityResponse(`'finished_at' must be after ${params.startedAt.toISOString()}.`).generate();
    }

    const table = await TableDAO.getTable({ id: params.tableId });
    if (!table) return new NotFoundResponse(`Table with id='${params.tableId}' is not found.`).generate();

    const currentTableOccupations = await DAO.getTableOccupations({
      filters: {
        tableId: params.tableId,
        startedAt: { lte: params.startedAt },
        OR: [
          { finishedAt: { gte: params.startedAt } },
          { finishedAt: null }, // open table
        ]
      },
      take: 1,
    });

    if (currentTableOccupations.length) {
      const currentOccupation = currentTableOccupations[0];
      return new UnprocessableEntityResponse(`Table with id='${currentOccupation.id}' is currently occupied ${currentOccupation.finishedAt ? `until ${currentOccupation.finishedAt.toISOString()}.`: 'with no time limit.'}`).generate();
    }

    const tableOccupation = await DAO.createTableOccupation({data: {
      startedAt: params.startedAt,
      finishedAt: params.finishedAt,
      table: { connect: {id: table.id } },
    }});

    log(`occupy_table: created=${JSON.stringify(tableOccupation)}`);

    const response = {
      id: tableOccupation.id,
      table_id: tableOccupation.tableId,
      started_at: tableOccupation.startedAt,
      finished_at: tableOccupation.finishedAt,
      created_at: tableOccupation.createdAt,
      updated_at: tableOccupation.updatedAt,
    } as TableOccupationResponse

    return new APIResponse(201, response).generate();
  } catch (err) {
    logError(`occupy_table: params=${JSON.stringify(params)} - error: '${err}'`);
    return new InternalServerErrorResponse(err).generate();
  }
}

export const getTableOccupations = async (params: {
  page: number | undefined;
  pageSize: number | undefined;
  tableId: string | undefined;
  sort: string;
}) => {
  log(`get_table_occupations: params=${JSON.stringify(params)}`);

  const [fieldInSnakeCase, order] = params.sort.split(":");
  const field = camelCase(fieldInSnakeCase);
  const validFields = Object.keys(prismaClient.tableOccupation.fields);
  if (!validFields.includes(field)) return new BadRequestResponse(`Invalid field name in sort query`).generate();

  if (!params.page) params.page = 1;
  if (!params.pageSize) params.pageSize = 10;

  try {
    const tableOccupations = await DAO.getTableOccupations({
      filters: { tableId: params.tableId },
      skip: (params.page - 1) * params.pageSize,  // Skip the previous pages
      take: params.pageSize,
      sort: { fieldName: field, order: order },
    });

    const count = await DAO.countTableOccupations({
      filters: { tableId: params.tableId },
    });
    const totalPages = Math.ceil(count / params.pageSize);

    const formattedTableOccupations: TableOccupationResponse[] = tableOccupations.map((tableOccupation) => ({
      id: tableOccupation.id,
      table_id: tableOccupation.tableId,
      started_at: tableOccupation.startedAt,
      finished_at: tableOccupation.finishedAt,
      created_at: tableOccupation.createdAt,
      updated_at: tableOccupation.updatedAt,
    }));

    const response: GetTableOccupationsResponse = {
      page: params.page,
      limit: params.pageSize,
      count: count,
      total_pages: totalPages,
      table_id: params.tableId ?? null,
      table_occupations: formattedTableOccupations, 
    }

    return new APIResponse(200, response).generate();
  } catch (err) {
    logError(`get_table_occupations: params=${JSON.stringify(params)} - error: '${err}'`);
    return new InternalServerErrorResponse(err).generate();
  }
}

export const getTableOccupation = async (params: {
  id: string,
  withTable?: boolean,
}) => {
  log(`get_table_occupation: params=${JSON.stringify(params)}`);

  try {
    const tableOccupation = await DAO.getTableOccupation({
      filters: { id: params.id }
    });
    if (!tableOccupation) return new NotFoundResponse(`Table occupation with id='${params.id}' is not found.`).generate();

    const response: TableOccupationResponse = {
      id: tableOccupation.id,
      table_id: tableOccupation.tableId,
      started_at: tableOccupation.startedAt,
      finished_at: tableOccupation.finishedAt,
      created_at: tableOccupation.createdAt,
      updated_at: tableOccupation.updatedAt,
    }

    if (params.withTable) {
      const table = await TableDAO.getTable({ id: tableOccupation.tableId });
      if (!table) throw new Error(`Table with id='${tableOccupation.tableId}' of table occupation with id='${tableOccupation.id}' is not found.`);

      response.table = {
        id: table.id,
        number: table.number,
        brand: table.brand,
        created_at: table.createdAt,
        updated_at: table.updatedAt,
      } as TableResponse
    }

    return new APIResponse(200, response).generate();
  } catch (err) {
    logError(`get_table_occupation: params=${JSON.stringify(params)} - error: '${err}'`);
    return new InternalServerErrorResponse(err).generate();
  }
}