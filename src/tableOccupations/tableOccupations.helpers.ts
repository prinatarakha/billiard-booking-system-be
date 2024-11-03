import * as DAO from "./tableOccupations.dao";

/**
 * Get the table occupation that meets the filter criterias including the current occupation
 * @param filters - The filters to apply to the query
 * @returns The table occupation that meets the filter criterias including the current occupation
 */
export const getActiveTableOccupation = async (filters: {
  tableId: string,
  startedAt: Date,
  finishedAt?: Date | null,
  idIsNot?: string,
}) => {
  const currentTableOccupations = await DAO.getTableOccupations({
    filters: {
      tableId: filters.tableId,
      id: filters.idIsNot ? { not: filters.idIsNot } : undefined,
      OR: [
        // check if params.startedAt is between startedAt and finishedAt
        {
          startedAt: { lte: filters.startedAt },
          OR: [
            { finishedAt: { gte: filters.startedAt } },
            { finishedAt: null }, // open table
          ]
        },
        // check if params.finishedAt is between startedAt and finishedAt
        filters.finishedAt ? {
          startedAt: { lte: filters.finishedAt },
          OR: [
            { finishedAt: { gte: filters.finishedAt } },
            { finishedAt: null }, // open table
          ]
        } : {},
        // Validating if an open table occupation can be created/updated.
        // check if occupation with startedAt greater than params.startedAt exists if params.finishedAt is null (open table).
        filters.finishedAt === null ? {
          startedAt: { gte: filters.startedAt },
        } : {},
      ],
    },
    take: 1,
  });

  return currentTableOccupations.length ? currentTableOccupations[0] : null;
}