import { Prisma, PrismaClient } from '@prisma/client';
import prismaClient from "../db";
import { DefaultArgs } from '@prisma/client/runtime/library';

export const createTableOccupation = async (
  data: Prisma.TableOccupationCreateInput,
  trx: Omit<PrismaClient<Prisma.PrismaClientOptions, never, DefaultArgs>, "$connect" | "$disconnect" | "$on" | "$transaction" | "$use" | "$extends"> = prismaClient,
) => {
  const result = await trx.tableOccupation.create({
    data: data,
  });
  return result;
}