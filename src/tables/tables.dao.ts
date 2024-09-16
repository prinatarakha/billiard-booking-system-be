import { Prisma } from '@prisma/client';
import prismaClient from "../db";

export const createTable = async (data: Prisma.TableCreateInput) => {
  const result = await prismaClient.table.create({
    data: data,
  });
  return result;
}

export const getTableByNumber = async (number: number) => {
  const table = await prismaClient.table.findFirst({
    where: {
      number: number
    }
  });
  return table;
}

export const getTables = async (filters: {
  skip: number, 
  take: number,
  orderBy?: {
    [x: string]: "asc" | "desc";
  }[],
}) => {
  const tables = await prismaClient.table.findMany({
    skip: filters.skip,  // Skip the previous pages
    take: filters.take,  // Limit the number of results per page
    orderBy: filters.orderBy ?? [{number: "asc"}],
  });
  return tables;
}

export const countTables = async () => {
  const count = await prismaClient.table.count()
  return count;
}

export const getTableById = async (id: string) => {
  const table = await prismaClient.table.findFirst({
    where: {
      id: id
    }
  });
  return table;
}