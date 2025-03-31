import { School } from "../schemas/schoolSchema.mjs";
import { Student } from "../schemas/studentSchema.mjs";
import axios from 'axios';

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


export const verifyParentNumber = async (req, res) => {
    try {
        const { phoneNumber } = req.body;

        // Validate input
        if (!phoneNumber) {
            return res.status(400).json({ message: "Phone number is required." });
        }

        // Find students associated with the phone number (across all schools)
        const students = await Student.find({ studentParentNumber: phoneNumber }).populate("school");

        if (students.length === 0) {
            return res.status(404).json({ message: "No students found for this phone number." });
        }

        // Respond with student and school details
        res.status(200).json({
            message: "Student number verified successfully.",
            students: students.map(student => ({
                studentId: student._id,
                studentName: student.studentName,
                studentClassName: student.studentClassName,
                studentAddress: student.studentAddress,
                studentParentName: student.studentParentName,
                studentParentNumber: student.studentParentNumber,
                schoolName: student.school.schoolName,
                fees: student.fees, // Include fee details if needed
            })),
        });

    } catch (error) {
        console.error("Error verifying student number:", error);
        res.status(500).json({ message: "Internal server error." });
    }
};

export const sendParentMessage = async (req, res) => {
    console.log("sending message")
    const { messageTo, messageFrom, message } = req.body;
    const data = {
        "sender": messageFrom,
        "message": message,
        "recipients": [messageTo],
        // When sending SMS to Nigerian recipients, specify the use_case field
        // "use_case" = "transactional"
      };

        const config = {
        method: 'post',
        url: 'https://sms.arkesel.com/api/v2/sms/send',
        headers: {
        'api-key': 'Q2FiT3lFbGxURHNob1pGbldwTEE'
        },
        data : data
        };

    axios(config)
    .then(function (response) {
    console.log(JSON.stringify(response.data));
    res.status(200).json(response.data)
    })
    .catch(function (error) {
    console.log(error);
});

}