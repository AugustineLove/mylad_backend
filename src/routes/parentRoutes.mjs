import { Router } from "express";
import { getAllChildren } from "../controllers/parentController.mjs";

const parentRoutes = Router();

parentRoutes.get("/:parentNumber", getAllChildren)
export default parentRoutes;