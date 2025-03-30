import { Router } from "express";
import { createTransaction, getTransactions } from "../controllers/transactionController.mjs";

export const transactionRoutes = Router();

transactionRoutes.post('/:studentId', createTransaction)
transactionRoutes.get('/:studentId', getTransactions)