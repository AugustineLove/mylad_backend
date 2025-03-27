import { School } from "../schemas/schoolSchema.mjs";
import { Class } from "../schemas/classSchema.mjs";

export const addSchool = async (req, res) => {
    const { schoolName, schoolAddress, schoolPhone, schoolWebsite, schoolPassword } = req.body;

    try {
        // Create the school
        const newSchool = new School({
            schoolName,
            schoolAddress,
            schoolPhone,
            schoolWebsite,
            schoolPassword
        });

        const savedSchool = await newSchool.save();

        // Default classes to be created
        const defaultClasses = [
            { name: "Pre-School", level: 0 },
            { name: "Basic 1", level: 1 },
            { name: "Basic 2", level: 2 },
            { name: "Basic 3", level: 3 },
            { name: "Basic 4", level: 4 },
            { name: "Basic 5", level: 5 },
            { name: "Basic 6", level: 6 },
            { name: "Basic 7", level: 7 },
            { name: "Basic 8", level: 8 },
            { name: "Basic 9", level: 9 }
        ];

        // Create classes for the new school
        const classPromises = defaultClasses.map(classData => {
            return new Class({ className: classData.name, level: classData.level, school: savedSchool._id }).save();
        });

        await Promise.all(classPromises);

        return res.status(201).json({ message: "School and default classes created successfully", school: savedSchool });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Internal server error" });
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