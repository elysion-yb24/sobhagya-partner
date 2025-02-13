// utils/sendOtp.js
const axios = require('axios');

const sendOtp = async (contactNumber, otp) => {
  const fast2smsKey = process.env.FAST2SMS_KEY; // access key from .env
  
  const url = 
    `https://www.fast2sms.com/dev/bulkV2?authorization=${fast2smsKey}` +
    `&route=dlt&sender_id=ELYSFT&variables_values=${otp}&flash=0&numbers=${contactNumber}&message=170490`;

  try {
    const response = await axios.get(url);
    console.log("Fast2SMS response:", response.data);
    return true;
  } catch (error) {
    console.error("Error sending OTP:", error);
    return false;
  }
};

module.exports = sendOtp;
