import { Router } from "express";
import { sendScheduledSMS, sendTemplateSMS } from "../controllers/otpController.mjs";

const otpRoutes = Router();

otpRoutes.post('/send-otp', sendTemplateSMS);
otpRoutes.post('/verify-otp', sendScheduledSMS);

export default otpRoutes;