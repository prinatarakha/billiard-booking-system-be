import express from "express";
import validateRequest from "../middlewares/validateRequest";
import * as DTO from "./waitingList.dto";
import * as Handlers from "./waitingList.handlers";

const router = express.Router();

router.post("/v1/waiting-list", validateRequest(DTO.CreateWaitingListEntryRequest), Handlers.createWaitingListEntry);
// router.get("/v1/waiting-list", validateRequest(DTO.GetWaitingListEntriesRequest), Handlers.getWaitingListEntries);
// router.get("/v1/waiting-list/:id", validateRequest(DTO.GetTableRequest), Handlers.getTable);
// router.delete("/v1/waiting-list/:id", validateRequest(DTO.DeleteTableRequest), Handlers.deleteTable);
// router.put("/v1/waiting-list", validateRequest(DTO.UpdateTablesRequest), Handlers.updateTables);

export default router;