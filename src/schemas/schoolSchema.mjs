import { model, Schema } from "mongoose";

const SchoolSchema = new Schema({
    schoolName: {
        type: Schema.Types.String,
        required: true,
    },
    schoolAddress: {
        type: Schema.Types.String,
        required: true,
    },
    schoolPhone: {
        type: Schema.Types.String,
        required: true,
    },
    schoolWebsite: {
        type: Schema.Types.String,
        required: false,
    },
    schoolEmail: {
        type: Schema.Types.String,
        required: true,
    },
    schoolPassword: {
        type: Schema.Types.String,
        required: true,
    },
    feeTypes: [
        {
            feeType: { type: Schema.Types.String, required: true },
            amount: { type: Schema.Types.Number, required: true }
        }
    ]
}, { timestamps: true });

export const School = model("School", SchoolSchema);
