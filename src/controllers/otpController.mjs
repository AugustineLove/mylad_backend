// send-sms.mjs
import axios from 'axios';
import dotenv from "dotenv";
dotenv.config();

// Function to send a template SMS
export const sendTemplateSMS = async (req, res) => {
  const { phoneNumber } = req.body;
  const data = {
      expiry: 5,
      length: 6,
      medium: 'sms',
      message: 'Your OTP verification code from My Lad Company Limited is %otp_code%',
      number: phoneNumber,
      sender_id: 'My Lad',
      type: 'numeric',
  };
  const headers = {
      'api-key': 'Q2FiT3lFbGxURHNob1pGbldwTEE',
  };

  try {
      const response = await axios.post('https://sms.arkesel.com/api/otp/generate', data, { headers });
      console.log(response.data); // Log response data to verify API response
      res.status(200).json(response.data); // Send response back to frontend
  } catch (error) {
      console.error('SMS Error:', error.response ? error.response.data : error.message);
      res.status(500).json({ error: 'Failed to send OTP' });
  }
};

export const verifyOTP = async (req, res) => {
  const { phoneNumber, otpCode } = req.body;
const data = {
  api_key: 'cE9QRUkdjsjdfjkdsj9kdiieieififiw=',
  code: otpCode,
  number: phoneNumber
};
const headers = {
  'api-key': 'cE9QRUkdjsjdfjkdsj9kdiieieififiw=',
}
axios.post('https://sms.arkesel.com/api/otp/verify',data,{headers})
.then(response => console.log(response))
.catch(error => console.log(error));
};

// Function to send a scheduled template SMS
export const sendScheduledSMS = async () => {
  const data = {
    sender: "Arkesel",
    message: "Hello <%name%>, safe journey to <%hometown%> this Xmas",
    recipients: [
      { number: "0593528296", name: "John Doe", hometown: "Techiman" },
      { number: "0542384752", name: "Adam", hometown: "Cape Coast" }
    ],
    scheduled_date: "2025-04-01 12:00 PM"
  };

  const config = {
    method: 'post',
    url: 'https://sms.arkesel.com/api/v2/sms/template/send',
    headers: {
      'api-key': 'cE9QRUkdjsjdfjkdsj9kdiieieififiw='
    },
    data
  };

  try {
    const response = await axios(config);
    console.log(JSON.stringify(response.data));
  } catch (error) {
    console.error(error);
  }
}

// Function to send a template SMS with a delivery webhook
async function sendTemplateSMSWithWebhook() {
  const data = {
    sender: "Arkesel",
    message: "Hello <%name%>, safe journey to <%hometown%> this Xmas",
    recipients: [
      { number: "233553995047", name: "John Doe", hometown: "Techiman" },
      { number: "233544919953", name: "Adam", hometown: "Cape Coast" }
    ],
    callback_url: "https://google.com"
  };

  const config = {
    method: 'post',
    url: 'https://sms.arkesel.com/api/v2/sms/template/send',
    headers: {
      'api-key': 'cE9QRUkdjsjdfjkdsj9kdiieieififiw='
    },
    data
  };

  try {
    const response = await axios(config);
    console.log(JSON.stringify(response.data));
  } catch (error) {
    console.error(error);
  }
}

// Uncomment the function you want to run
// await sendTemplateSMS();
// await sendScheduledSMS();
// await sendTemplateSMSWithWebhook();
