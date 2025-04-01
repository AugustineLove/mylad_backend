
import { Router } from "express";
import { addStudent, debitAStudent, deleteStudents, getAllStudents, payIntoStudentAccount, promoteAllStudents, updateClassFees, } from "../controllers/studentController.mjs";

const studentRoutes = Router();

studentRoutes.post('/add', addStudent);
studentRoutes.post('/:schoolId', promoteAllStudents);
studentRoutes.get('/:schoolId', getAllStudents)
studentRoutes.post('/addClassFees/:schoolId', updateClassFees)
studentRoutes.post('/pay/:studentId', payIntoStudentAccount)
studentRoutes.post('/debit/:studentId', debitAStudent)
studentRoutes.post('/deletion/students', deleteStudents);

export default studentRoutes;