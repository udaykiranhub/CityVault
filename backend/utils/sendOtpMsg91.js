const axios = require("axios");

const sendOtpMsg91 = async (phone, otp) => {
  try {
    const response = await axios.post(
      "https://api.msg91.com/api/v5/otp",
      {
        template_id: process.env.MSG91_TEMPLATE_ID,
        mobile: `91${phone}`, // include country code
        authkey: process.env.MSG91_AUTH_KEY,
        otp: otp
      },
      { headers: { "Content-Type": "application/json" } }
    );

    if (response.data.type === "success") {
      console.log("OTP sent successfully via MSG91");
      return true;
    } else {
      console.error("MSG91 error:", response.data);
      return false;
    }
  } catch (err) {
    console.error("MSG91 API error:", err.response?.data || err.message);
    return false;
  }
};

module.exports = sendOtpMsg91;
