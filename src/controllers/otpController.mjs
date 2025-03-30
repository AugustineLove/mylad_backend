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
  message: 'This is OTP from My Lad, Company Limited',
  number: phoneNumber,
  sender_id: 'Arkesel',
  type: 'numeric',
};
const headers = {
  'api-key': 'Q2FiT3lFbGxURHNob1pGbldwTEE',
}
axios.post('https://sms.arkesel.com/api/otp/generate',data,{headers})
.then(response => console.log(response))
.catch(error => console.log(error));
}

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
