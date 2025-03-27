import { Student } from "../schemas/studentSchema.mjs";
import { School } from "../schemas/schoolSchema.mjs";
import { Class } from "../schemas/classSchema.mjs"; 

export const addStudent = async (req, res) => {
    const { studentName, studentClass, school, studentAddress, studentParentName, studentParentNumber } = req.body;

    const defaultFees = [
        { feeType: "Tuition", amount: 0.00, status: "unpaid" },
        { feeType: "Exam Fee", amount: 0.00, status: "unpaid" },
        { feeType: "Sports Fee", amount: 0.00, status: "unpaid" },
        { feeType: "Admission Fee", amount: 0.00, status: "unpaid" },
        { feeType: "Feeding Fee", amount: 0.00, status: "unpaid" },
        { feeType: "PTA Fee", amount: 0.00, status: "unpaid" },
    ];

    try {
        const existingSchool = await School.findById(school);
        if (!existingSchool) {
            return res.status(404).json({ message: "School not found" });
        }

        
        const existingClass = await Class.findOne({ _id: studentClass, school: school });
        if (!existingClass) {
            return res.status(404).json({ message: "Class not found in the specified school" });
        }
        const level = existingClass.level !== undefined ? existingClass.level : 0;

        const newStudent = new Student({
            studentName,
            studentClass,
            school,
            studentAddress,
            studentParentName,
            studentParentNumber,
            level, 
            fees: defaultFees
        });

        const savedStudent = await newStudent.save();
        return res.status(201).json(savedStudent);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Internal server error" });
    }
};


export const promoteAllStudents = async (req, res) => {
    const { schoolId } = req.body; 

    try {
        if (!schoolId) {
            return res.status(400).json({ message: "School ID is required" });
        }

        
        const students = await Student.find({ school: schoolId });

        if (students.length === 0) {
            return res.status(404).json({ message: "No students found for this school" });
        }

        for (let student of students) {
            const currentClass = await Class.findById(student.studentClass);

            if (!currentClass) continue; 
            
            const nextClass = await Class.findOne({ level: currentClass.level + 1 });

            if (!nextClass) continue; 

            
            student.studentClass = nextClass._id;
            student.level = nextClass.level
            await student.save();
        }

        res.status(200).json({ message: "Students promoted successfully" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Internal server error" });
    }
};


export const getAllStudents = async (req, res) => {
    const { schoolId } = req.params; 

    try {
        if (!schoolId) {
            return res.status(400).json({ message: "School ID is required" });
        }
        const students = await Student.find({ school: schoolId });

        if (students.length === 0) {
            return res.status(404).json({ message: "No students found for this school" });
        }
        res.status(200).json(students);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Internal server error" });
    }
};
