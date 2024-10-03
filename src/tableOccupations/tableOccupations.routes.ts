import express from "express";
import validateRequest from "../middlewares/validateRequest";
import * as DTO from "./tableOccupations.dto";
import * as Handlers from "./tableOccupations.handlers";

const router = express.Router();

router.post("/v1/table-occupations", validateRequest(DTO.OccupyTableRequest), Handlers.occupyTable);
router.get("/v1/table-occupations", validateRequest(DTO.GetTableOccupationsRequest), Handlers.getTableOccupations);
router.get("/v1/table-occupations/:id", validateRequest(DTO.GetTableOccupationRequest), Handlers.getTableOccupation);
router.delete("/v1/table-occupations/:id", validateRequest(DTO.DeleteTableOccupationRequest), Handlers.deleteTableOccupation);
// router.put("/v1/table-occupations", validateRequest(DTO.UpdateTablesRequest), Handlers.updateTables);

export default router;