import axios from "axios";
import dotenv from "dotenv";

dotenv.config();

const PAYSTACK_SECRET = process.env.PAYSTACK_SECRET;

// Initialize a payment
export const initializePayment = async (req, res) => {
    try {
        const { email, amount } = req.body;
        const response = await axios.post(
            "https://api.paystack.co/transaction/initialize",
            {
                email,
                amount: amount * 100, // Convert to kobo
                currency: "GHS",
                callback_url: "https://yourwebsite.com/payment/callback",
            },
            {
                headers: {
                    Authorization: `Bearer ${PAYSTACK_SECRET}`,
                    "Content-Type": "application/json",
                },
            }
        );
        res.json(response.data);
    } catch (error) {
        console.error("Paystack Error:", error.response?.data || error.message);
        res.status(500).json({ error: "Payment initialization failed" });
    }
};

// Verify payment
export const verifyPayment = async (req, res) => {
    try {
        const { reference } = req.query;
        const response = await axios.get(
            `https://api.paystack.co/transaction/verify/${reference}`,
            {
                headers: {
                    Authorization: `Bearer ${PAYSTACK_SECRET}`,
                    "Content-Type": "application/json",
                },
            }
        );
        res.json(response.data);
    } catch (error) {
        console.error("Verification Error:", error.response?.data || error.message);
        res.status(500).json({ error: "Payment verification failed" });
    }
};
