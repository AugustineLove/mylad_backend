
import { Router } from "express";
import { addStudent, getAllStudents, promoteAllStudents, } from "../controllers/studentController.mjs";

const studentRoutes = Router();

studentRoutes.post('/add', addStudent);
studentRoutes.post('/:schoolId', promoteAllStudents);
studentRoutes.get('/:schoolId', getAllStudents)

export default studentRoutes;