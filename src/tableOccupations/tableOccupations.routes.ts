import express from "express";
import validateRequest from "../middlewares/validateRequest";
// import * as DTO from "./tableOccupations.dto";
// import * as Handlers from "./tableOccupations.handlers";

const router = express.Router();

// router.post("/v1/table-occupations", validateRequest(DTO.CreateTableRequest), Handlers.createTable);
// router.get("/v1/table-occupations", validateRequest(DTO.GetTablesRequest), Handlers.getTables);
// router.get("/v1/table-occupations/:id", validateRequest(DTO.GetTableRequest), Handlers.getTable);
// router.delete("/v1/table-occupations/:id", validateRequest(DTO.DeleteTableRequest), Handlers.deleteTable);
// router.put("/v1/table-occupations", validateRequest(DTO.UpdateTablesRequest), Handlers.updateTables);

export default router;