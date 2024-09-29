import { Prisma } from "@prisma/client";
import { BadRequestResponse, InternalServerErrorResponse, NotFoundResponse, UnprocessableEntityResponse } from "../commons/exceptions";
import { log, logError } from "../commons/log";
import { APIResponse, ErrorResponse } from "../commons/response";
import * as DAO from "./tableOccupations.dao";
// import { GetTablesResponse, TableResponse, UpdateTablesResponse } from "./tableOccupations.dto";
import prismaClient from "../db";
import * as TableDAO from "../tables/tables.dao";
import dayjs from "dayjs";

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

    return new APIResponse(201, tableOccupation).generate();
  } catch (err) {
    logError(`occupy_table: params=${JSON.stringify(params)} - error: '${err}'`);
    return new InternalServerErrorResponse(err).generate();
  }
}