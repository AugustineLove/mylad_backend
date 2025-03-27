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
    schoolPassword: {
        type: Schema.Types.String,
        required: true,
    },
    
}, { timestamps: true })

export const School = model("School", SchoolSchema);