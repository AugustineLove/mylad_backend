import { Student } from "../schemas/studentSchema.mjs";
import { School } from "../schemas/schoolSchema.mjs";
import { Class } from "../schemas/classSchema.mjs"; 
import mongoose from "mongoose";

// ✅ Define class-name to level mapping
const classLevelMap = {
    "Creche": 1,
    "Nursery 1": 2,
    "Nursery 2": 3,
    "Kindergarten 1": 4,
    "Kindergarten 2": 5,
    "Basic 1": 6,
    "Basic 2": 7,
    "Basic 3": 8,
    "Basic 4": 9,
    "Basic 5": 10,
    "Basic 6": 11,
    "Basic 7": 12,
    "Basic 8": 13,
    "Basic 9": 14,
};

export const addStudent = async (req, res) => {
    try {
        const {
            studentFirstName,
            studentSurname,
            studentOtherNames,
            studentGender,
            studentClass, // Example: "Basic 6"
            school,
            studentAddress,
            studentParentSurname,
            studentParentFirstName,
            studentParentNumber
        } = req.body;

        // ✅ Validate school
        const existingSchool = await School.findById(school);
        if (!existingSchool) {
            return res.status(404).json({ message: "School not found" });
        }

        // ✅ Validate class existence in the school
        const classData = await Class.findOne({ className: studentClass, school: school });
        if (!classData) {
            return res.status(404).json({ message: "Class not found in the specified school" });
        }

        // ✅ Assign level based on className
        const level = classLevelMap[studentClass] || 0; // Default to 0 if not found

        // ✅ Retrieve class-specific fixed fees
        const classFees = classData.fees.map(fee => ({
            feeType: fee.feeType,
            amount: fee.amount,
            status: fee.status,
            dueDate: fee.dueDate,
        }));

        // ✅ Create new student
        const newStudent = new Student({
            studentFirstName,
            studentSurname,
            studentOtherNames,
            studentGender,
            studentClass: classData._id, // Store the class ID
            studentClassName: studentClass, // Store the class name
            school,
            studentAddress,
            studentParentSurname,
            studentParentFirstName,
            studentParentNumber,
            level, // ✅ Store the mapped level
            fees: classFees, // ✅ Apply class-specific fees
            balance: classFees.reduce((acc, fee) => acc + fee.amount, 0) // ✅ Set initial balance based on total fees
        });

        // ✅ Save student to database
        const savedStudent = await newStudent.save();

        return res.status(201).json({
            message: "Student added successfully",
            student: savedStudent
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Internal server error" });
    }
};


export const deleteStudents = async (req, res) => {
    try {
        const { studentIds } = req.body;

        if (!studentIds || !Array.isArray(studentIds) || studentIds.length === 0) {
            return res.status(400).json({ message: "Invalid studentIds array" });
        }

        // Log studentIds for debugging
        console.log("Student IDs received for deletion: ", studentIds);

        // Delete students in bulk
        const result = await Student.deleteMany({ _id: { $in: studentIds.map(id => new mongoose.Types.ObjectId(id)) } });

        if (result.deletedCount === 0) {
            return res.status(404).json({ message: "No students found to delete" });
        }

        res.status(200).json({ message: "Students deleted successfully", deletedCount: result.deletedCount });
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

export const promoteAllStudents = async (req, res) => {
    const { schoolId } = req.body; 

    try {
        if (!schoolId) {
            return res.status(400).json({ message: "School ID is required" });
        }

        
        const students = await Student.find({ school: schoolId });

        console.log(`Students found: ${students}`)

        if (students.length === 0) {
            return res.status(404).json({ message: "No students found for this school" });
        }

        for (let student of studentsToPromote) {
            const currentClass = await Class.findById(student.studentClass);
            if (!currentClass) continue;
        
            // Find the next class based on level increment
            const nextClass = await Class.findOne({ 
                school: currentClass.school, 
                level: currentClass.level + 1 
            });
        
            if (!nextClass) continue;
        
            // Update student details
            student.studentClass = nextClass._id;  // Update class reference
            student.level = nextClass.level;       // Update level
            student.className = nextClass.className; // Ensure class name updates
        
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


export const addFeesToStudentsInAClass = async (req, res) => {
    try {
        const { classId, feeType, amount, dueDate } = req.body;

        if (!classId || !feeType || !amount) {
            return res.status(400).json({ message: "Missing required fields." });
        }

        // Find all students in the given class
        const students = await Student.find({ studentClass: classId });

        if (students.length === 0) {
            return res.status(404).json({ message: "No students found in this class." });
        }

        // Update students' fees correctly
        await Promise.all(students.map(async (student) => {
            // Check if this fee type already exists
            const existingFee = student.fees.find(fee => fee.feeType === feeType);

            if (existingFee) {
                // If fee exists, update the amount
                existingFee.amount += Number(amount);
                existingFee.dueDate = dueDate ? new Date(dueDate) : existingFee.dueDate;
            } else {
                // If fee doesn't exist, add a new fee entry
                student.fees.push({
                    feeType,
                    amount: Number(amount),
                    dueDate: dueDate ? new Date(dueDate) : null,
                    status: "unpaid"
                });
            }

            // Update the total balance of the student
            student.balance = (student.balance || 0) + Number(amount);

            await student.save();
        }));

        res.status(200).json({
            message: `Successfully added ${feeType} fee of ${amount} to ${students.length} students in class.`,
        });
    } catch (error) {
        console.error("Error adding fees:", error);
        res.status(500).json({ message: "Internal server error." });
    }
};


export const updateClassFees = async (req, res) => {
    try {
        const { classId, feeType, newAmount, dueDate } = req.body;

        if (!classId || !feeType || newAmount === undefined) {
            return res.status(400).json({ message: "Missing required fields." });
        }

        // Find all students in the given class
        const students = await Student.find({ studentClass: classId });

        if (students.length === 0) {
            return res.status(404).json({ message: "No students found in this class." });
        }

        // Get the current fixed amount for this feeType in the class
        const classFeeRecord = await ClassFee.findOne({ classId, feeType });
        const oldAmount = classFeeRecord ? classFeeRecord.amount : 0;
        const amountDifference = newAmount - oldAmount;

        // Update class fee record or create a new one
        if (classFeeRecord) {
            classFeeRecord.amount = newAmount;
            await classFeeRecord.save();
        } else {
            await ClassFee.create({ classId, feeType, amount: newAmount });
        }

        // Update students' fees correctly
        await Promise.all(students.map(async (student) => {
            // Check if this fee type already exists
            const existingFee = student.fees.find(fee => fee.feeType === feeType);

            if (existingFee) {
                // Adjust the student's fee by the difference
                existingFee.amount += amountDifference;
                existingFee.dueDate = dueDate ? new Date(dueDate) : existingFee.dueDate;
            } else {
                // If fee doesn't exist, set it to the new fixed amount
                student.fees.push({
                    feeType,
                    amount: newAmount,
                    dueDate: dueDate ? new Date(dueDate) : null,
                    status: "unpaid"
                });
            }

            // Update the total balance of the student
            student.balance = (student.balance || 0) + amountDifference;

            await student.save();
        }));

        res.status(200).json({
            message: `Successfully updated ${feeType} fee to ${newAmount} for all students in class.`,
        });
    } catch (error) {
        console.error("Error updating fees:", error);
        res.status(500).json({ message: "Internal server error." });
    }
};





export const debitAStudent = async (req, res) => {
    try {
      const { studentId, feeType, amount } = req.body;
  
      if (!studentId || !feeType || !amount || amount <= 0) {
        return res.status(400).json({ message: "Invalid input values." });
      }
  
      const student = await Student.findById(studentId);
      if (!student) {
        return res.status(404).json({ message: "Student not found." });
      }
  
      // Check if the feeType already exists
      const existingFee = student.fees.find(fee => fee.feeType === feeType);
      if (existingFee) {
        existingFee.amount += amount;
      } else {
        student.fees.push({ feeType, amount });
      }
  
      await student.save();
  
      res.status(200).json({ message: "Fee added successfully.", student });
      
    } catch (error) {
      console.error("Error debiting student:", error);
      res.status(500).json({ message: "Internal server error." });
    }
  };
  
  // Pay into a student’s account (Reduce debt for a specific feeType)
  export const payIntoStudentAccount = async (req, res) => {
    try {
        const { studentId, feeType, amountPaid } = req.body;

        if (!studentId || !feeType || !amountPaid || amountPaid <= 0) {
            return res.status(400).json({ message: "Invalid payment amount." });
        }

        const student = await Student.findById(studentId);
        if (!student) {
            return res.status(404).json({ message: "Student not found." });
        }

        // Find the specific feeType
        const fee = student.fees.find(fee => fee.feeType === feeType);
        if (!fee) {
            return res.status(404).json({ message: "Specified fee type not found for this student." });
        }

        // Ensure payment does not exceed the specific feeType balance
        if (amountPaid > fee.amount) {
            return res.status(400).json({ message: `Cannot pay more than the remaining balance of ${fee.amount} for ${feeType}.` });
        }

        // Deduct the payment from the specified feeType
        fee.amount -= amountPaid;

        // Reduce the overall student balance
        student.balance -= amountPaid;

        await student.save();

        res.status(200).json({
            message: `Payment of ${amountPaid} applied to ${feeType}.`,
            student,
        });
    } catch (error) {
        console.error("Error processing payment:", error);
        res.status(500).json({ message: "Internal server error." });
    }
};
