import { Router } from "express";
import { addSchool, getAllSchools } from "../controllers/schoolController.mjs";

const schoolRoutes = Router();

schoolRoutes.get('/', getAllSchools)

schoolRoutes.post("/add", addSchool);
export default schoolRoutes;


