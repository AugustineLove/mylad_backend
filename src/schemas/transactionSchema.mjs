import { model, Schema } from "mongoose";
const TransactionSchema = new Schema({
  studentId: {
    type: Schema.Types.ObjectId,
    ref: "Student", // Assuming there's a Student model
    required: true,
  },
  schoolId: {
    type: Schema.Types.ObjectId,
    ref: "School",
    required: true,
  },
  amount: {
    type: Number,
    required: true,
  },
  feeType: {
    type: String,
    required: true,
  },
  paymentMethod: {
    type: String,
    enum: ["Cash", "Mobile Money", "Bank Transfer", "Other"],
    required: false,
  },
  status: {
    type: String,
    enum: ["Completed", "Pending", "Failed"],
    default: "Completed",
  },
  transactionType: {
    type: String,
    enum: ["Credit", "Debit"],
    required: true,
  },
  date: {
    type: Date,
    default: Date.now,
  },
});

export const Transaction = model("Transaction", TransactionSchema);

