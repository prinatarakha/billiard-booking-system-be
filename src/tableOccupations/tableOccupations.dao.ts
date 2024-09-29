import { Prisma, PrismaClient } from '@prisma/client';
import prismaClient from "../db";
import { DefaultArgs } from '@prisma/client/runtime/library';

export const createTableOccupation = async (params: {
  data: Prisma.TableOccupationCreateInput,
  trx?: Omit<PrismaClient<Prisma.PrismaClientOptions, never, DefaultArgs>, "$connect" | "$disconnect" | "$on" | "$transaction" | "$use" | "$extends">,
}) => {
  if (!params.trx) params.trx = prismaClient;

  const result = await params.trx.tableOccupation.create({
    data: params.data,
  });
  return result;
}

export const getTableOccupations = async (params: {
  filters?: Prisma.TableOccupationWhereInput,
  skip?: number,
  take?: number,
  trx?: Omit<PrismaClient<Prisma.PrismaClientOptions, never, DefaultArgs>, "$connect" | "$disconnect" | "$on" | "$transaction" | "$use" | "$extends">,
}) => {
  if (!params.take) params.take = 10;
  if (!params.trx) params.trx = prismaClient;

  const result = await params.trx.tableOccupation.findMany({
    where: params.filters,
    skip: params.skip,  // Skip the previous pages
    take: params.take,  // Limit the number of results per page
  });
  return result;
}