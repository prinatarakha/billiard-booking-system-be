import express from "express";
import validateRequest from "../middlewares/validateRequest";
import * as DTO from "./waitingList.dto";
import * as Handlers from "./waitingList.handlers";

const router = express.Router();

router.post("/v1/waiting-list", validateRequest(DTO.CreateWaitingListEntryRequest), Handlers.createWaitingListEntry);
router.get("/v1/waiting-list", validateRequest(DTO.GetWaitingListEntriesRequest), Handlers.getWaitingListEntries);
router.get("/v1/waiting-list/:id", validateRequest(DTO.GetWaitingListEntryRequest), Handlers.getWaitingListEntry);
router.delete("/v1/waiting-list/:id", validateRequest(DTO.DeleteWaitingListEntryRequest), Handlers.deleteWaitingListEntry); // not recommended. Just update the status to cancelled
router.put("/v1/waiting-list/:id", validateRequest(DTO.UpdateWaitingListEntryRequest), Handlers.updateWaitingListEntry);

// NOTES: Fulfilling a waiting list entry means creating a new table occupation. Although creating new table occupation has its own API,
//        it is done in this module for avoiding circular dependency. Because, if we add 'waiting_list_id' in req body of create table occupation 
//        API, then we need to check the existence of the waiting list entry, which involves importing the waiting list module in table
//        occupation module, resulting in circular dependency because table occupation module is already imported here.
router.post("/v1/waiting-list/:id/fulfill", validateRequest(DTO.FulfillWaitingListEntryRequest), Handlers.fulfillWaitingListEntry);

export default router;