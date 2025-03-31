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

export const promoteClassStudents = async (req, res) => {
    const { classId, students } = req.body;

    try {
        if (!classId) {
            return res.status(400).json({ message: "Class ID is required" });
        }

        let studentsToPromote;
        
        if (students && students.length > 0) {
            // Promote only selected students
            studentsToPromote = await Student.find({ _id: { $in: students } });
        } else {
            // Promote all students in the class
            studentsToPromote = await Student.find({ studentClass: classId });
        }

        if (studentsToPromote.length === 0) {
            return res.status(404).json({ message: "No students found to promote" });
        }

        for (let student of studentsToPromote) {
            const currentClass = await Class.findById(student.studentClass);
            if (!currentClass) continue;

            // Find the next class level in the same school
            const nextClass = await Class.findOne({ 
                school: currentClass.school, 
                level: currentClass.level + 1 
            });

            if (!nextClass) continue;

            student.studentClass = nextClass._id;
            student.level = nextClass.level;
            await student.save();
        }

        return res.status(200).json({ message: "Students promoted successfully", count: studentsToPromote.length });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server error during promotion" });
    }
};


export const getFixedAmount = async (req, res) => {
    try {
      const { classId, feeType } = req.params;
  
      // Find the class by ID
      const classData = await Class.findById(classId);
  
      if (!classData) {
        return res.status(404).json({ message: "Class not found" });
      }
  
      // Find the specific feeType in the class
      const fee = classData.fees.find((f) => f.feeType === feeType);
  
      if (!fee) {
        return res.status(404).json({ message: `No fixed amount found for fee type: ${feeType}` });
      }
  
      res.status(200).json({ feeType: fee.feeType, amount: fee.amount, dueDate: fee.dueDate });
    } catch (error) {
      console.error("Error fetching fixed fee amount:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  };

  export const updateFixedAmount = async (req, res) => {
    try {
        const { classId, feeType } = req.params;
        const { amount, dueDate } = req.body;

        // Find the class by ID
        const classData = await Class.findById(classId);
        if (!classData) {
            return res.status(404).json({ message: "Class not found" });
        }

        // Find the specific feeType in the class
        const fee = classData.fees.find((f) => f.feeType === feeType);
        if (!fee) {
            return res.status(404).json({ message: `No fixed amount found for fee type: ${feeType}` });
        }

        const oldAmount = fee.amount; // Store the previous fixed fee amount
        const amountDifference = amount - oldAmount; // Calculate difference

        // Update the fee amount and dueDate if provided
        if (amount !== undefined) fee.amount = amount;
        if (dueDate !== undefined) fee.dueDate = dueDate;

        // Save the updated class document
        await classData.save();

        // Find all students in this class
        const students = await Student.find({ studentClass: classId });

        // Adjust each student's fee record
        for (const student of students) {
            // Find the specific feeType in the student's fee list
            const studentFee = student.fees.find((f) => f.feeType === feeType);

            if (studentFee) {
                studentFee.amount += amountDifference; // Increase the student's fee instead of overwriting it
                student.balance += amountDifference; // Adjust student balance
            }

            await student.save();
        }

        res.status(200).json({ 
            message: "Fee updated successfully and student balances adjusted", 
            feeType: fee.feeType, 
            amount: fee.amount, 
            dueDate: fee.dueDate 
        });
    } catch (error) {
        console.error("Error updating fixed fee amount:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};

