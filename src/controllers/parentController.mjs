import { Student } from "../schemas/studentSchema.mjs";

export const getAllChildren = async (req, res) => {
    const { parentNumber } = req.params;

    try {
        const children = await Student.find({ studentParentNumber: parentNumber });
        if(children.length === 0) {
           return res.status(404).json({ message: "No children found" });
        } 
        return res.status(200).json(children);
    } catch (error) {
        console.log(error);
        return res.status(500).json({message: "Internal server eroor"})
    }
}