import { model, Schema } from "mongoose";

const ClassSchema = new Schema(
  {
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
    },
    fees: [
      {
        feeType: { type: String, required: true },
        amount: { type: Number, required: true },
        status: { type: String, enum: ["Paid", "Unpaid"] },
        dueDate: { type: Date, default: null }, // Optional due date
      },
    ],
  },
  { timestamps: true }
);

// Ensure unique class per school per level
ClassSchema.index({ school: 1, level: 1 }, { unique: true });

export const Class = model("Class", ClassSchema);
