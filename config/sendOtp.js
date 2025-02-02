const config = require('../config/config');
const axios = require('axios');

const sendOtp = async(contactNumber, otp) => {

    let url = "https://www.fast2sms.com/dev/bulkV2?authorization="+ 
    config.FAST2SMS_KEY +"&route=dlt&sender_id=ELYSFT&variables_values="+ otp +"&flash=0&numbers=" + contactNumber + "&message=170490"

    // config.FAST2SMS_KEY +"&route=otp&variables_values="+ otp +"&flash=0&numbers=" + contactNumber

    try {
       let r =  await axios.get(url)
       //console.log(r, "---")
    }catch(e){

        // console.log(e)
        return false;
    }

    return true
}

module.exports = sendOtp