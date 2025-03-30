import { Transaction } from "../schemas/transactionSchema.mjs";

export const createTransaction = async (req, res) => {
    try {
      console.log("Creating transaction in backend")
      const { studentId, amount, feeType, date, transactionType } = req.body;

      console.log(req.body)
  
      if (!studentId || !amount || !feeType) {
        return res.status(400).json({ error: "All fields are required" });
      }
  
      const transaction = new Transaction({
        studentId,
        amount,
        feeType,
        transactionType,
        date,
      });
  
      await transaction.save();
      console.log("Transaction recorded")
      res.status(201).json({ message: "Transaction recorded", transaction });
      
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  };
  
  export const getTransactions = async (req, res) => {
    try {
      const { studentId } = req.params;
      const { feeType } = req.query; // Optional filter
  
      if (!studentId) {
        return res.status(400).json({ error: "Student ID is required" });
      }
  
      let query = { studentId };
      if (feeType) {
        query.feeType = feeType; // Filter by fee type if provided
      }
  
      const transactions = await Transaction.find(query).sort({ date: -1 });
      res.status(200).json(transactions);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  };
  
  