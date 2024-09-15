import express from "express";
import validateRequest from "../middlewares/validateRequest";
import * as DTO from "./tables.dto";
import * as Handlers from "./tables.handlers";

const router = express.Router();

router.post("", validateRequest(DTO.createTableDto), Handlers.createTable);
router.get("", validateRequest(DTO.getTablesDto), Handlers.getTables);

export default router;