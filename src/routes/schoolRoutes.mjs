import { Router } from "express";
import { addFeeTypeToSchool, addSchool, editSchoolDetails, getAllSchools, getASchool, loginSchool } from "../controllers/schoolController.mjs";


const schoolRoutes = Router();

schoolRoutes.get('/', getAllSchools);
schoolRoutes.post("/add", addSchool);
schoolRoutes.post('/:schoolId/addFeeType', addFeeTypeToSchool);
schoolRoutes.get('/:schoolId', getASchool);
schoolRoutes.post('/login', loginSchool);
schoolRoutes.post('/edit', editSchoolDetails)


export default schoolRoutes;


