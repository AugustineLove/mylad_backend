import { model, Schema } from "mongoose";

const ClassSchema = new Schema({
    className: {
        type: String,
        required: true,
    },
    school: { 
        type: Schema.Types.ObjectId, 
        ref: "School",
        required: true,
    },
    level: {
        type: Number,
        required: true,
        unique: true,
    }
}, { timestamps: true });

ClassSchema.index({ school: 1, level: 1 }, { unique: true });

export const Class = model("Class", ClassSchema);
 