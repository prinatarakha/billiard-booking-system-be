import { Prisma } from "@prisma/client";
import { BadRequestResponse, InternalServerErrorResponse, NotFoundResponse, UnprocessableEntityResponse } from "../commons/exceptions";
import { log, logError } from "../commons/log";
import { APIResponse, ErrorResponse } from "../commons/response";
import * as DAO from "./waitingList.dao";
import * as Constants from "./waitingList.constants";
import * as TableDAO from "../tables/tables.dao";
import * as TableOccupationDAO from "../tableOccupations/tableOccupations.dao";
import * as TableOccupationHelpers from "../tableOccupations/tableOccupations.helpers";
import { GetWaitingListEntriesResponse, WaitingListEntryResponse } from "./waitingList.dto";
import prismaClient from "../db";
import { TableResponse } from "../tables/tables.dto";
import { TableOccupationResponse } from "../tableOccupations/tableOccupations.dto";
import dayjs from "dayjs";

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
      if (!table) return new NotFoundResponse(`Table with id='${params.tableId}' is not found`).generate();
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
  customerName?: string,
  customerPhone?: string,
  startDate?: Date,
  endDate?: Date,
}) => {
  if (!params.page) params.page = 1;
  if (!params.pageSize) params.pageSize = 10;

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

    if (params.customerName) {
      filters.customerName = {
        contains: params.customerName, // LIKE '%<name>%'
        mode: 'insensitive', // case-insensitive
      }
    }

    if (params.customerPhone) {
      filters.customerPhone = {
        contains: params.customerPhone, // LIKE '%<phone>%'
        mode: 'insensitive', // case-insensitive
      }
    }

    const createdAtFilter: Prisma.DateTimeFilter<"WaitingList"> = {
      gte: params.startDate,
      lte: params.endDate,
    };
    filters.createdAt = createdAtFilter;

    // prioritize the oldest waiting list
    const sort = {
      fieldName: "createdAt",
      order: "asc",
    }

    const waitingListEntries = await DAO.getWaitingListEntries({
      skip: (params.page - 1) * params.pageSize,  // Skip the previous pages
      take: params.pageSize,
      filters,
      sort,
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

export const getWaitingListEntry = async (params: {
  id: string,
  withTable?: boolean,
  withTableOccupation?: boolean,
}) => {
  log(`get_waiting_list_entry: params=${JSON.stringify(params)}`);

  try {
    const waitingListEntry = await DAO.getWaitingListEntry({ filters: {id: params.id} });
    if (!waitingListEntry) {
      log(`get_waiting_list_entry: waiting list entry with id='${params.id}' is not found`);
      return new NotFoundResponse(`Waiting list entry with id='${params.id}' is not found`).generate();
    }
    
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

    if (waitingListEntry.tableId && params.withTable) {
      const table = await TableDAO.getTable({ id: waitingListEntry.tableId });
      if (!table) throw new Error(`Table with id='${waitingListEntry.tableId}' of waiting list entry with id='${waitingListEntry.id}' is not found.`);

      response.table = {
        id: table.id,
        number: table.number,
        brand: table.brand,
        created_at: table.createdAt,
        updated_at: table.updatedAt,
      } as TableResponse
    }

    if (waitingListEntry.tableOccupationId && params.withTableOccupation) {
      const tableOccupation = await TableOccupationDAO.getTableOccupation({ filters: {id: waitingListEntry.tableOccupationId} });
      if (!tableOccupation) throw new Error(`Table occupation with id='${waitingListEntry.tableOccupationId}' of waiting list entry with id='${waitingListEntry.id}' is not found.`);

      response.table_occupation = {
        id: tableOccupation.id,
        table_id: tableOccupation.tableId,
        started_at: tableOccupation.startedAt,
        finished_at: tableOccupation.finishedAt,
        created_at: tableOccupation.createdAt,
        updated_at: tableOccupation.updatedAt,
      } as TableOccupationResponse
    }

    return new APIResponse(200, response).generate();
  } catch (err) {
    logError(`get_waiting_list_entry: params=${JSON.stringify(params)} - error: '${err}'`);
    return new InternalServerErrorResponse(`Failed to get waiting list entry`).generate();
  }
}

export const deleteWaitingListEntry = async (params: {
  id: string,
}) => {
  log(`delete_waiting_list_entry: params=${JSON.stringify(params)}`);

  try {
    const waitingListEntry = await DAO.getWaitingListEntry({ filters: {id: params.id} });
    if (!waitingListEntry) return new NotFoundResponse(`Waiting list entry with id='${params.id}' is not found`).generate();

    await DAO.deleteWaitingListEntry({ filters: {id: params.id} });
    
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

    return new APIResponse(200, response).generate();
  } catch (err) {
    logError(`delete_waiting_list_entry: params=${JSON.stringify(params)} - error: '${err}'`);
    return new InternalServerErrorResponse(`Failed to delete waiting list entry`).generate();
  }
}

export const updateWaitingListEntry = async (params: {
  id: string,
  customerName: string | undefined, 
  customerPhone: string | undefined,
  tableId: string | null | undefined, // null means removing table
  tableOccupationId: string | null | undefined, // null means removing table occupation
  status: string | undefined,
}) => {
  log(`update_waiting_list_entry: params=${JSON.stringify(params)}`);

  try {
    const waitingListEntry = await DAO.getWaitingListEntry({ filters: {id: params.id} });
    if (!waitingListEntry) {
      log(`update_waiting_list_entry: waiting list entry with id='${params.id}' is not found`);
      return new NotFoundResponse(`Waiting list entry with id='${params.id}' is not found`).generate();
    }

    let isUpdated = false;
    
    if (params.customerName && waitingListEntry.customerName !== params.customerName) {
      waitingListEntry.customerName = params.customerName;
      isUpdated = true;
    }

    if (params.customerPhone && waitingListEntry.customerPhone !== params.customerPhone) {
      waitingListEntry.customerPhone = params.customerPhone;
      isUpdated = true;
    }

    // change preferred table
    if (params.tableId && waitingListEntry.tableId !== params.tableId) {
      const table = await TableDAO.getTable({ id: params.tableId });
      if (!table) return new NotFoundResponse(`Table with id='${params.tableId}' is not found`).generate();
      waitingListEntry.tableId = params.tableId;
      isUpdated = true;
    }

    // remove preferred table
    if (params.tableId === null && waitingListEntry.tableId !== null) {
      waitingListEntry.tableId = null;
      isUpdated = true;
    }

    // change table occupation
    if (params.tableOccupationId && waitingListEntry.tableOccupationId !== params.tableOccupationId) {
      // check if table occupation exists
      const tableOccupation = await TableOccupationDAO.getTableOccupation({ filters: {id: params.tableOccupationId} });
      if (!tableOccupation) return new NotFoundResponse(`Table occupation with id='${params.tableOccupationId}' is not found`).generate();
      
      // check if other waiting list entry has been linked to the same table occupation
      const otherEntry = await DAO.getWaitingListEntry({ filters: {tableOccupationId: params.tableOccupationId} });
      if (otherEntry) return new UnprocessableEntityResponse(`Table occupation with id='${params.tableOccupationId}' has been linked to waiting list entry with id='${otherEntry.id}'`).generate();
      
      waitingListEntry.tableOccupationId = params.tableOccupationId;
      isUpdated = true;
    }

    // remove table occupation
    if (params.tableOccupationId === null && waitingListEntry.tableOccupationId !== null) {
      waitingListEntry.tableOccupationId = null;
      isUpdated = true;
    }

    if (params.status && waitingListEntry.status !== params.status) {
      if (params.status === Constants.WaitingListStatusEnums.FULFILLED && 
        !waitingListEntry.tableOccupationId
      ) {
        return new UnprocessableEntityResponse(`Fulfilled waiting list entry must have table occupation`).generate();
      }

      waitingListEntry.status = params.status;
      isUpdated = true;
    }

    if (waitingListEntry.status !== Constants.WaitingListStatusEnums.FULFILLED) {
      // queued, cancelled, and expired status can't have table occupation
      if (waitingListEntry.tableOccupationId)
        log(`update_waiting_list_entry: changing entry with id='${waitingListEntry.id}' status to '${waitingListEntry.status}': removing table occupation with id='${waitingListEntry.tableOccupationId}'`);
      
      waitingListEntry.tableOccupationId = null;
    }

    if (isUpdated) {
      waitingListEntry.updatedAt = new Date();
      
      await DAO.updateWaitingListEntry({
        filters: {id: params.id},
        data: {
          customerName: waitingListEntry.customerName,
          customerPhone: waitingListEntry.customerPhone,
          table: waitingListEntry.tableId
            ? { connect: {id: waitingListEntry.tableId } }
            : { disconnect: true },
          tableOccupation: waitingListEntry.tableOccupationId
            ? { connect: {id: waitingListEntry.tableOccupationId } }
            : { disconnect: true },
          status: waitingListEntry.status,
          updatedAt: waitingListEntry.updatedAt,
        }
      });

      log(`update_waiting_list_entry: updated_entry=${JSON.stringify(waitingListEntry)}`);
    }

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

    return new APIResponse(200, response).generate();
  } catch (err) {
    logError(`update_waiting_list_entry: params=${JSON.stringify(params)} - error: '${err}'`);
    return new InternalServerErrorResponse(`Failed to update waiting list entry`).generate();
  }
}

export const fulfillWaitingListEntry = async (params: {
  id: string,
  tableId: string,
  startedAt?: Date,
  finishedAt?: Date,
}) => {
  const now = new Date();
  if (!params.startedAt) params.startedAt = now;
  log(`fulfill_waiting_list_entry: params=${JSON.stringify(params)}`);

  try {
    if (dayjs(params.startedAt).isBefore(dayjs(now))) {
      return new UnprocessableEntityResponse(`'started_at' must be greater than or equal to the current time.`).generate();
    }
    if (params.finishedAt && dayjs(params.finishedAt).isBefore(dayjs(params.startedAt))) {
      return new UnprocessableEntityResponse(`'finished_at' must be after ${params.startedAt.toISOString()}.`).generate();
    }

    const waitingListEntry = await DAO.getWaitingListEntry({ filters: {id: params.id} });
    if (!waitingListEntry) {
      log(`fulfill_waiting_list_entry: waiting list entry with id='${params.id}' is not found`);
      return new NotFoundResponse(`Waiting list entry with id='${params.id}' is not found`).generate();
    }

    // can only fulfill waiting list entry with 'queued' status
    if (waitingListEntry.status !== Constants.WaitingListStatusEnums.QUEUED) {
      log(`fulfill_waiting_list_entry: can't fulfill waiting list entry with id='${params.id}' and status='${waitingListEntry.status}' (not 'queued')`);
      return new UnprocessableEntityResponse(`Can't fulfill waiting list entry with id='${params.id}' and status not 'queued'`).generate();
    }

    const table = await TableDAO.getTable({ id: params.tableId });
    if (!table) return new NotFoundResponse(`Table with id='${params.tableId}' is not found`).generate();
    
    const currentOccupation = await TableOccupationHelpers.getActiveTableOccupation({
      tableId: params.tableId,
      startedAt: params.startedAt ?? now,
    })
    if (currentOccupation) return new UnprocessableEntityResponse(`Table with id='${currentOccupation.tableId}' is currently occupied ${currentOccupation.finishedAt ? `until ${currentOccupation.finishedAt.toISOString()}.`: 'with no time limit.'}`).generate();
    
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

    await prismaClient.$transaction(async (trx) => {
      const tableOccupation = await TableOccupationDAO.createTableOccupation({
        data: {
          startedAt: params.startedAt,
          finishedAt: params.finishedAt,
          table: { connect: {id: table.id } },
        },
        trx: trx,
      });
      log(`fulfill_waiting_list_entry: entry with id='${params.id}': created table occupation=${JSON.stringify(tableOccupation)}`);

      waitingListEntry.tableOccupationId = tableOccupation.id;
      waitingListEntry.status = Constants.WaitingListStatusEnums.FULFILLED;
      waitingListEntry.updatedAt = new Date();

      await DAO.updateWaitingListEntry({
        filters: {id: params.id},
        data: {
          tableOccupation: waitingListEntry.tableOccupationId
            ? { connect: {id: waitingListEntry.tableOccupationId } }
            : { disconnect: true },
          status: waitingListEntry.status,
          updatedAt: waitingListEntry.updatedAt,
        },
        trx: trx,
      });
      log(`fulfill_waiting_list_entry: updated_entry=${JSON.stringify(waitingListEntry)}`);

      response.table_occupation_id = waitingListEntry.tableOccupationId;
      response.status = waitingListEntry.status;
      response.updated_at = waitingListEntry.updatedAt;

      response.table_occupation = {
        id: tableOccupation.id,
        table_id: tableOccupation.tableId,
        started_at: tableOccupation.startedAt,
        finished_at: tableOccupation.finishedAt,
        created_at: tableOccupation.createdAt,
        updated_at: tableOccupation.updatedAt,
      } as TableOccupationResponse
    });

    return new APIResponse(200, response).generate();
  } catch (err) {
    logError(`fulfill_waiting_list_entry: params=${JSON.stringify(params)} - error: '${err}'`);
    return new InternalServerErrorResponse(`Failed to fulfill waiting list entry`).generate();
  }
}