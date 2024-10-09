import { Prisma, PrismaClient } from '@prisma/client';
import prismaClient from "../db";
import { DefaultArgs } from '@prisma/client/runtime/library';

export const createWaitingListEntry = async (
  data: Prisma.WaitingListCreateInput,
  trx: Omit<PrismaClient<Prisma.PrismaClientOptions, never, DefaultArgs>, "$connect" | "$disconnect" | "$on" | "$transaction" | "$use" | "$extends"> = prismaClient,
) => {
  const result = await trx.waitingList.create({
    data: data,
  });
  return result;
}

export const getWaitingListEntries = async (params: {
  filters?: Prisma.WaitingListWhereInput,
  skip?: number,
  take?: number,
  sort?: { fieldName: string, order: string },
  trx?: Omit<PrismaClient<Prisma.PrismaClientOptions, never, DefaultArgs>, "$connect" | "$disconnect" | "$on" | "$transaction" | "$use" | "$extends">,
}) => {
  if (!params.take) params.take = 10;
  if (!params.trx) params.trx = prismaClient;

  const result = await params.trx.waitingList.findMany({
    where: params.filters,
    skip: params.skip,  // Skip the previous pages
    take: params.take,  // Limit the number of results per page
    orderBy: params.sort ? { [params.sort.fieldName]: params.sort.order } : undefined,
  });
  return result;
}

export const countWaitingListEntries = async (params: {
  filters?: Prisma.WaitingListWhereInput,
  trx?: Omit<PrismaClient<Prisma.PrismaClientOptions, never, DefaultArgs>, "$connect" | "$disconnect" | "$on" | "$transaction" | "$use" | "$extends">,
}) => {
  if (!params.trx) params.trx = prismaClient;
  const count = await params.trx.waitingList.count({
    where: params.filters,
  });
  return count;
}

export const getWaitingListEntry = async (params: {
  filters: Prisma.WaitingListWhereUniqueInput,
  trx?: Omit<PrismaClient<Prisma.PrismaClientOptions, never, DefaultArgs>, "$connect" | "$disconnect" | "$on" | "$transaction" | "$use" | "$extends">,
}) => {
  if (!params.trx) params.trx = prismaClient;
  const result = await params.trx.waitingList.findFirst({
    where: params.filters,
  });
  return result;
}

export const deleteWaitingListEntry = async (params: {
  filters: Prisma.WaitingListWhereUniqueInput,
  trx?: Omit<PrismaClient<Prisma.PrismaClientOptions, never, DefaultArgs>, "$connect" | "$disconnect" | "$on" | "$transaction" | "$use" | "$extends">,
}) => {
  if (!params.trx) params.trx = prismaClient;
  const result = await params.trx.waitingList.delete({
    where: params.filters,
  });
  return result;
}