import { model, Schema } from "mongoose";

const StudentSchema = new Schema({
    studentFirstName: {
        type: String,
        required: true,
    },
    studentSurname: {
        type: String,
        required: true,
    },
    studentOtherNames: {
        type: String,
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
    studentGender: {
        type: String,
        enum: ['Male', 'Female']
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
    studentParentFirstName: {
        type: String,
        required: true,
    },
    studentParentSurname: {
        type: String,
        required: true
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
                status: { type: String, enum: ["Paid", "Unpaid"], default: "Unpaid" },
                paymentPhoneNumber: { type: String, required: false } // Number to send payment
            }
        ],
        default: undefined
    },    

    balance:{type: Number}
    
}, { timestamps: true });

export const Student = model("Student", StudentSchema);
