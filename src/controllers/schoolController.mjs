import { School } from "../schemas/schoolSchema.mjs";
import { Class } from "../schemas/classSchema.mjs";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { Student } from "../schemas/studentSchema.mjs";
export const addSchool = async (req, res) => {
  const { schoolName, schoolAddress, schoolPhone, schoolEmail, schoolWebsite, schoolPassword } = req.body;

  try {
      // Hash the password
      const saltRounds = 10;
      const hashedPassword = await bcrypt.hash(schoolPassword, saltRounds);

      // Create the school
      const newSchool = new School({
          schoolName,
          schoolAddress,
          schoolPhone,
          schoolWebsite,
          schoolEmail,
          schoolPassword: hashedPassword,
          feeTypes: [  // Default fee types
              
          ]
      });

      const savedSchool = await newSchool.save();

      // Default classes to be created
      const defaultClasses = [
          { name: "Creche", level: 0 },
          { name: "Nursery 1", level: 1 },
          { name: "Nursery 2", level: 2 },
          { name: "Kindergarten 1", level: 3 },
          { name: "Kindergarten 2", level: 4 },
          { name: "Basic 1", level: 5 },
          { name: "Basic 2", level: 6 },
          { name: "Basic 3", level: 7 },
          { name: "Basic 4", level: 8 },
          { name: "Basic 5", level: 9 },
          { name: "Basic 6", level: 10 },
          { name: "Basic 7", level: 11 },
          { name: "Basic 8", level: 12 },
          { name: "Basic 9", level: 13 }
      ];

      // Create classes with default fee types
      const classPromises = defaultClasses.map(classData => {
          return new Class({
              className: classData.name,
              level: classData.level,
              school: savedSchool._id,
              fees: [] // Set the default fee types with fixed amounts
          }).save();
      });

      await Promise.all(classPromises);

      return res.status(201).json({ message: "School, default classes, and fee types created successfully", school: savedSchool });
  } catch (error) {
      console.error(error);
      return res.status(500).json({ message: "Internal server error" });
  }
};


export const editSchoolDetails = async (req, res) => {
    const { schoolId, schoolName, schoolAddress, schoolPhone, schoolEmail, schoolWebsite, schoolPassword } = req.body;

    try {
        const school = await School.findById(schoolId);
        if (!school) {
            return res.status(404).json({ message: "School not found" });
        }

        // Update fields if provided
        if (schoolName) school.schoolName = schoolName;
        if (schoolAddress) school.schoolAddress = schoolAddress;
        if (schoolPhone) school.schoolPhone = schoolPhone;
        if (schoolEmail) school.schoolEmail = schoolEmail;
        if (schoolWebsite) school.schoolWebsite = schoolWebsite;

        // Hash new password if provided
        if (schoolPassword) {
            const saltRounds = 10;
            school.schoolPassword = await bcrypt.hash(schoolPassword, saltRounds);
        }

        const updatedSchool = await school.save();

        return res.status(200).json({ message: "School details updated successfully", school: updatedSchool });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Internal server error" });
    }
};



export const addFeeTypeToSchool = async (req, res) => {
  try {
      const { schoolId, feeType, amount } = req.body;

      if (!schoolId || !feeType) {
          return res.status(400).json({ message: "Missing required fields." });
      }

      // Find the school
      const school = await School.findById(schoolId);
      if (!school) {
          return res.status(404).json({ message: "School not found." });
      }

      // Check if feeType already exists in the school
      const feeExists = school.feeTypes.some((f) => f.feeType === feeType);
      if (feeExists) {
          return res.status(400).json({ message: "Fee type already exists for this school." });
      }

      // Add the new fee type to the school's feeTypes
      school.feeTypes.push({ feeType, amount });
      await school.save();

      // Find all classes in the school
      const classes = await Class.find({ school: schoolId });

      // Update each class by adding the new fee type
      for (const classData of classes) {
          classData.fees.push({ feeType, amount });
          await classData.save();
      }

      // Update all students in the school by adding the new fee type to their fees
      await Student.updateMany(
          { school: schoolId }, // Find all students belonging to the school
          { 
              $push: { 
                  fees: { 
                      feeType, 
                      amount, 
                      status: "Unpaid" // Default to unpaid
                  } 
              } 
          }
      );

      res.status(200).json({ message: "Fee type added to school, classes, and students successfully." });
  } catch (error) {
      console.error("Error adding fee type:", error);
      res.status(500).json({ message: "Internal server error" });
  }
};


export const getAllSchools = async (req, res) => {
    try {
      const schools = await School.find();
      return res.send(schools);
    } catch (error) {
      return res.status(500).send(error.message);
    }
  }


export const getASchool = async (req, res) => {
  const { schoolId } = req.params;
    try {
      const school = await School.findById(schoolId)
      return res.send(school);
    } catch (error) {
      return res.status(500).send(error.message);
    }
}

export const loginSchool = async (req, res) => {
  const { schoolEmail, schoolPassword } = req.body;

  try {
    // Check if the school exists
    const school = await School.findOne({ schoolEmail });
    if (!school) {
      return res.status(404).json({ message: "School not found" });
    }

    // Validate password
    const isMatch = await bcrypt.compare(schoolPassword, school.schoolPassword);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    // Generate JWT token
    const token = jwt.sign({ schoolId: school._id }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });

    res.status(200).json({
      message: "Login successful",
      token,
      schoolId: school._id,
      schoolName: school.schoolName,
      schoolAddress: school.schoolAddress,
      schoolPhone: school.schoolPhone,
      schoolEmail: school.schoolEmail,
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ message: "Server error" });
  }
};