import { Student } from "../schemas/studentSchema.mjs";
import { Transaction } from "../schemas/transactionSchema.mjs";

export const createTransaction = async (req, res) => {
  try {
      console.log("Creating transaction in backend");

      const { studentId, amount, feeType, date, transactionType, schoolId } = req.body;

      console.log(req.body);

      if (!studentId || !amount || !feeType || !schoolId) {
          return res.status(400).json({ error: "All fields are required" });
      }

      const transaction = new Transaction({
          studentId,
          schoolId,  // Include schoolId
          amount,
          feeType,
          transactionType,
          date,
      });

      await transaction.save();
      console.log("Transaction recorded");
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
  
  import mongoose from "mongoose"; // Ensure mongoose is imported

  
  export const getAllTransactions = async (req, res) => {
    console.log("Received Query Params:", req.query);

    const { schoolId, selectedClass, feeType, startDate, endDate } = req.query;

    // Validate schoolId
    if (!mongoose.Types.ObjectId.isValid(schoolId)) {
        return res.status(400).json({ message: "Invalid School ID" });
    }

    try {
        // Step 1: Find all transactions for the school
        let query = { schoolId: new mongoose.Types.ObjectId(schoolId) };

        if (feeType && feeType !== "all") {
            query.feeType = feeType;
        }

        if (startDate && endDate) {
            query.date = { 
                $gte: new Date(startDate), 
                $lte: new Date(endDate) 
            };
        }

        let transactions = await Transaction.find(query).sort({ date: -1 });

        // Step 2: Extract studentIds from transactions
        const studentIds = transactions
            .map((t) => t.studentId)
            .filter(id => mongoose.Types.ObjectId.isValid(id)); // Ensure valid ObjectIds

        if (studentIds.length === 0) {
            return res.json([]); // No transactions found
        }

        // Step 3: Fetch student details using studentId
        const students = await Student.find({ _id: { $in: studentIds } });

        // Step 4: Create a map of studentId -> { className, studentName }
        const studentDetailsMap = {};
        students.forEach((student) => {
            studentDetailsMap[student._id.toString()] = {
                className: student.studentClassName,
                studentName: `${student.studentSurname} ${student.studentFirstName} ${student.studentOtherNames}`, // Assuming "studentName" field exists
            };
        });

        // Step 5: Attach student details to transactions and filter by class (if needed)
        transactions = transactions.map((transaction) => ({
            ...transaction.toObject(),
            className: studentDetailsMap[transaction.studentId.toString()]?.className || "Unknown",
            studentName: studentDetailsMap[transaction.studentId.toString()]?.studentName || "N/A",
        }));

        // Step 6: Filter transactions by selectedClass if provided
        if (selectedClass && selectedClass !== "all") {
            transactions = transactions.filter((t) => t.className === selectedClass);
        }

        res.json(transactions);
    } catch (error) {
        console.error("Error fetching transactions:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};


  




export const globalTransactions =  async (req, res) => {
  try {
    const transactions = await Transaction.find(); // Fetch all transactions
    res.status(200).json(transactions);
  } catch (error) {
    res.status(500).json({ message: "Error fetching transactions", error });
  }
};