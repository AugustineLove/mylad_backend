import { Router } from "express";
import { addClass, getAllClasses, getAllStudentsInClass, } from "../controllers/classController.mjs";

const classRoutes = Router();

classRoutes.post('/add',addClass);

classRoutes.get('/:schoolId', getAllClasses)
classRoutes.get('/:classId/students', getAllStudentsInClass)

export default classRoutes;