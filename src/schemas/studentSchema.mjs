import { model, Schema } from "mongoose";

const StudentSchema = new Schema({
    studentName: {
        type: String,
        required: true,
    },
    studentClass: { 
        type: Schema.Types.ObjectId, // Link to the Class model
        ref: "Class", 
        required: true,
    },
    studentClassName: {
        type: String,
        ref: "Class",
        required: true,
    },
    school: { 
        type: Schema.Types.ObjectId, // Link to the School model
        ref: "School", 
        required: true,
    },
    studentAddress: {
        type: String,
        required: true,
    },
    studentParentName: {
        type: String,
        required: true,
    },
    studentParentNumber: {
        type: String,
        required: true,
    },
    level: {
        type: String,
        required: true,
    },
    fees: {
        type: [
            {
                feeType: { type: String, required: false },
                amount: { type: Number, required: true, default: 0.00 },
                dueDate: { type: Date, required: false },
                status: { type: String, enum: ["paid", "unpaid"], default: "unpaid" }
            }
        ],
        default: undefined
    },
    balance:{type: Number}
}, { timestamps: true });

export const Student = model("Student", StudentSchema);
