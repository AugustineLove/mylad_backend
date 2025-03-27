import { Class } from "../schemas/classSchema.mjs";
import { School } from "../schemas/schoolSchema.mjs";
import { Student } from "../schemas/studentSchema.mjs";

export const addClass = async (req, res) => {
    const { className, school, level } = req.body;

    try {
        
        const existingSchool = await School.findById(school);
        if (!existingSchool) {
            return res.status(404).json({ message: "School not found" });
        }

        
        const newClass = new Class({
            className,
            school,
            level
        });

        const savedClass = await newClass.save();
        return res.status(201).json(savedClass);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Internal server error" });
    }
};


export const getAllClasses = async (req, res) => {
    const { schoolId } = req.params; 

    try {
        
        const classes = await Class.find({ school: schoolId });

        if (classes.length === 0) {
            return res.status(404).json({ message: "No classes found for this school" });
        }

        return res.status(200).json(classes);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Internal server error" });
    }
};

export const getAllStudentsInClass = async (req, res) => {
    const { classId } = req.params;
    try {
        const students = await Student.find({ studentClass: classId });
        if (students.length === 0) {
            return res.status(404).json({ message: "No students found for this class" });
        }
        return res.status(200).json(students);
    } catch (error) {
        
    }
}

export const promoteAllClassStudents = async (req, res) => {
    const { classId } = req.body;

    try {
        if(!classId) {
            return res.status(400).json({ message: "Class ID is required" });
        }
        const studentsToPromote = await Student.find({studentClass: classId});
        
        if(studentsToPromote.length === 0) {
            return res.status(404).json({ message: "No students found for this class" });
        }

        for (let student of studentsToPromote) {
            const currentClass = await Class.findById(student.studentClass);
            if (!currentClass) continue;

            const nextClass = await Class.findOne({ school: currentClass.school, level: currentClass.level + 1 });
            if (!nextClass) continue;
            student.studentClass = nextClass._id;
            student.level = nextClass.level;
            await student.save();
        }

    } catch (error) {
        console.log(error)
    }
}