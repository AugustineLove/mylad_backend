import { Student } from "../schemas/studentSchema.mjs";
import { School } from "../schemas/schoolSchema.mjs";
import { Class } from "../schemas/classSchema.mjs"; 

export const addStudent = async (req, res) => {
    const { studentName, studentClass, school, studentAddress, studentParentName, studentParentNumber } = req.body;

    try {
        // Check if the school exists
        const existingSchool = await School.findById(school);
        if (!existingSchool) {
            return res.status(404).json({ message: "School not found" });
        }

        if (!school) {
            return res.status(400).json({ message: "School ID is required" });
        }

        // Find the class in the specified school
        const classData = await Class.findOne({ className: studentClass, school: school });
        if (!classData) {
            return res.status(404).json({ message: "Class not found in the specified school" });
        }

        const level = classData.level !== undefined ? classData.level : 0;

        // ✅ Retrieve the class-specific fixed fees
        const classFees = classData.fees.map(fee => ({
            feeType: fee.feeType,
            amount: fee.amount, // Use the class fee amount
            status: "unpaid"
        }));

        // Create new student with class-specific fee structure
        const newStudent = new Student({
            studentName,
            studentClass: classData._id,
            studentClassName: classData.className,
            school,
            studentAddress,
            studentParentName,
            studentParentNumber,
            level, 
            fees: classFees, // ✅ Use class-specific fees
            balance: classFees.reduce((acc, fee) => acc + fee.amount, 0) // ✅ Set initial balance based on total fees
        });

        const savedStudent = await newStudent.save();
        return res.status(201).json({ message: "Student added successfully", student: savedStudent });
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
