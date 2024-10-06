import { Prisma } from "@prisma/client";
import { BadRequestResponse, InternalServerErrorResponse, NotFoundResponse, UnprocessableEntityResponse } from "../commons/exceptions";
import { log, logError } from "../commons/log";
import { APIResponse, ErrorResponse } from "../commons/response";
import * as DAO from "./waitingList.dao";
import * as Constants from "./waitingList.constants";
import * as TableDAO from "../tables/tables.dao";
import { WaitingListEntryResponse } from "./waitingList.dto";
import prismaClient from "../db";

export const createWaitingListEntry = async (params: {
  customerName: string,
  customerPhone?: string,
  tableId?: string,
}) => {
  log(`create_waiting_list_entry: params=${JSON.stringify(params)}`);
  const now = new Date();
  try {

    const waitingListEntryInput: Prisma.WaitingListCreateInput = {
      customerName: params.customerName,
      customerPhone: params.customerPhone,
      status: Constants.WaitingListEntryStatuses.QUEUED,
      createdAt: now,
      updatedAt: now,
    }

    if (params.tableId) {
      const table = await TableDAO.getTable({ id: params.tableId });
      if (!table) return new NotFoundResponse(`Table with id='${params.tableId}' is not found`);
      waitingListEntryInput.table = { connect: {id: table.id } };
    }

    const waitingListEntry = await DAO.createWaitingListEntry(waitingListEntryInput);
    log(`create_waiting_list_entry: created=${JSON.stringify(waitingListEntry)}`);

    const response: WaitingListEntryResponse = {
      id: waitingListEntry.id,
      customer_name: waitingListEntry.customerName,
      customer_phone: waitingListEntry.customerPhone,
      status: waitingListEntry.status,
      table_id: waitingListEntry.tableId,
      table_occupation_id: waitingListEntry.tableOccupationId,
      created_at: waitingListEntry.createdAt,
      updated_at: waitingListEntry.updatedAt,
    }
    return new APIResponse(201, response).generate();
  } catch (err) {
    logError(`create_waiting_list_entry: params=${JSON.stringify(params)} - error: '${err}'`);
    return new InternalServerErrorResponse(`Failed to create new waiting list entry`).generate();
  }
}

// export const getTables = async (params: {
//   page?: number,
//   pageSize?: number, // same as "limit" in API request, and "take" in Prisma
// }) => {
//   if (!params.page) params.page = 1;
//   if (!params.pageSize) params.pageSize = 10;

//   try {
//     const tables = await DAO.getTables({
//       skip: (params.page - 1) * params.pageSize,  // Skip the previous pages
//       take: params.pageSize,
//     });
//     const count = await DAO.countTables();
//     const totalPages = Math.ceil(count / params.pageSize);
//     const response: GetTablesResponse = {
//       page: params.page,
//       limit: params.pageSize,
//       count: count,
//       total_pages: totalPages,
//       tables: tables.map((table) => ({
//         id: table.id,
//         number: table.number,
//         brand: table.brand,
//         created_at: table.createdAt,
//         updated_at: table.updatedAt,
//       } as WaitingListEntryResponse)),
//     }
//     return new APIResponse(200, response).generate();
//   } catch (err) {
//     logError(`get_tables: params=${JSON.stringify(params)} - error: '${err}'`);
//     return new InternalServerErrorResponse(`Failed to get tables`).generate();
//   }
// }