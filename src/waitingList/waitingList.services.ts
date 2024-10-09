import { Prisma } from "@prisma/client";
import { BadRequestResponse, InternalServerErrorResponse, NotFoundResponse, UnprocessableEntityResponse } from "../commons/exceptions";
import { log, logError } from "../commons/log";
import { APIResponse, ErrorResponse } from "../commons/response";
import * as DAO from "./waitingList.dao";
import * as Constants from "./waitingList.constants";
import * as TableDAO from "../tables/tables.dao";
import { GetWaitingListEntriesResponse, WaitingListEntryResponse } from "./waitingList.dto";
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
      status: Constants.WaitingListStatusEnums.QUEUED,
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

export const getWaitingListEntries = async (params: {
  page?: number,
  pageSize?: number, // same as "limit" in API request, and "take" in Prisma
  tableId?: string,
  statuses: string[],
}) => {
  if (!params.page) params.page = 1;
  if (!params.pageSize) params.pageSize = 10;
  if (!params.statuses.length) params.statuses.push(Constants.WaitingListStatusEnums.QUEUED); // default status query is "queued"

  log(`get_waiting_list_entries: params=${JSON.stringify(params)}`);

  try {
    const filters: Prisma.WaitingListWhereInput = {};
    if (params.tableId) {
      filters.tableId = params.tableId;
    }
    if (params.statuses.length) {
      const andOperator = filters.AND 
        ? Array.isArray(filters.AND) ? filters.AND : [filters.AND]
        : [];
      params.statuses.forEach((status) => {
        if (status.charAt(0) === "!") {
          andOperator.push({ NOT: {status: status}});
        } else {
          andOperator.push({status: status});
        }
      });
      filters.AND = andOperator;
    }

    const waitingListEntries = await DAO.getWaitingListEntries({
      skip: (params.page - 1) * params.pageSize,  // Skip the previous pages
      take: params.pageSize,
      filters,
    });

    const count = await DAO.countWaitingListEntries({filters});
    const totalPages = Math.ceil(count / params.pageSize);

    const response: GetWaitingListEntriesResponse = {
      page: params.page,
      limit: params.pageSize,
      count: count,
      total_pages: totalPages,
      table_id: params.tableId || null,
      statuses: params.statuses,
      waiting_list_entries: waitingListEntries.map((waitingListEntry) => ({
        id: waitingListEntry.id,
        customer_name: waitingListEntry.customerName,
        customer_phone: waitingListEntry.customerPhone,
        status: waitingListEntry.status,
        table_id: waitingListEntry.tableId,
        table_occupation_id: waitingListEntry.tableOccupationId,
        created_at: waitingListEntry.createdAt,
        updated_at: waitingListEntry.updatedAt,
      } as WaitingListEntryResponse)),
    }
    
    return new APIResponse(200, response).generate();
  } catch (err) {
    logError(`get_waiting_list_entries: params=${JSON.stringify(params)} - error: '${err}'`);
    return new InternalServerErrorResponse(`Failed to get waiting list entries`).generate();
  }
}