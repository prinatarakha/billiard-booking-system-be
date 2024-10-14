import * as DAO from "./tableOccupations.dao";

export const getActiveTableOccupation = async (params: {
  tableId: string,
  startedAt: Date,
}) => {
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

  return currentTableOccupations.length ? currentTableOccupations[0] : null;
}