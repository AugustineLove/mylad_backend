import { Router } from "express";
import schoolRoutes from "./schoolRoutes.mjs";
import classRoutes from "./classRoutes.mjs";
import studentRoutes from "./studentRoutes.mjs";
import parentRoutes from "./parentRoutes.mjs";
import { transactionRoutes } from "./transactionRoutes.mjs";
import otpRoutes from "./otpRoutes.mjs";

const router = Router();

router.use('/api/schools', schoolRoutes); 
router.use('/api/classes', classRoutes);
router.use('/api/students', studentRoutes);
router.use('/api/parents', parentRoutes);
router.use('/api/transactions', transactionRoutes)
router.use('/api/otp', otpRoutes);

export default router;
