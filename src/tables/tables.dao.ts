import { Prisma, PrismaClient } from '@prisma/client';
import prismaClient from "../db";
import { DefaultArgs } from '@prisma/client/runtime/library';

export const createTable = async (
  data: Prisma.TableCreateInput,
  trx: Omit<PrismaClient<Prisma.PrismaClientOptions, never, DefaultArgs>, "$connect" | "$disconnect" | "$on" | "$transaction" | "$use" | "$extends"> = prismaClient,
) => {
  const result = await trx.table.create({
    data: data,
  });
  return result;
}

export const getTables = async (
  filters: {
    skip?: number, 
    take?: number,
    orderBy?: {
      [x: string]: "asc" | "desc";
    }[],
    ids?: string[], // FIX ME: use Prisma.TableWhereInput
    number?: number,
    numbers?: number[],
  },
  trx: Omit<PrismaClient<Prisma.PrismaClientOptions, never, DefaultArgs>, "$connect" | "$disconnect" | "$on" | "$transaction" | "$use" | "$extends"> = prismaClient,
) => {
  const whereClause: any = {};
  if (filters.ids) whereClause.id = { in: filters.ids };
  if (filters.number) whereClause.number = filters.number;
  if (filters.numbers) whereClause.number = { in: filters.numbers };
  
  const tables = await trx.table.findMany({
    skip: filters.skip,  // Skip the previous pages
    take: filters.take,  // Limit the number of results per page
    orderBy: filters.orderBy ?? [{number: "asc"}],
    where: Object.keys(whereClause).length ? whereClause : undefined,
  });
  return tables;
}

export const countTables = async (
  trx: Omit<PrismaClient<Prisma.PrismaClientOptions, never, DefaultArgs>, "$connect" | "$disconnect" | "$on" | "$transaction" | "$use" | "$extends"> = prismaClient,
) => {
  const count = await trx.table.count()
  return count;
}

export const getTable = async (
  filters: Prisma.TableWhereUniqueInput, // where clause
  trx: Omit<PrismaClient<Prisma.PrismaClientOptions, never, DefaultArgs>, "$connect" | "$disconnect" | "$on" | "$transaction" | "$use" | "$extends"> = prismaClient,
) => {
  const table = await trx.table.findFirst({
    where: filters
  });
  return table;
}

export const deleteTable = async (
  filters: Prisma.TableWhereUniqueInput, // where clause
  trx: Omit<PrismaClient<Prisma.PrismaClientOptions, never, DefaultArgs>, "$connect" | "$disconnect" | "$on" | "$transaction" | "$use" | "$extends"> = prismaClient,
) => {
  const table = await trx.table.delete({
    where: {
      id: filters.id
    }
  });
  return table;
}

export const updateTable = async (
  filters: Prisma.TableWhereUniqueInput, // where clause
  data: Prisma.TableUpdateInput, 
  trx: Omit<PrismaClient<Prisma.PrismaClientOptions, never, DefaultArgs>, "$connect" | "$disconnect" | "$on" | "$transaction" | "$use" | "$extends"> = prismaClient,
) => {
  const updatedTable = await trx.table.update({
    where: filters,
    data: data,
  });
  return updatedTable;
}
