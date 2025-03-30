import { Router } from "express";
import { getAllChildren, verifyParentNumber } from "../controllers/parentController.mjs";

const parentRoutes = Router();

parentRoutes.get("/:parentNumber", getAllChildren)
parentRoutes.post("/verify", verifyParentNumber)
export default parentRoutes;