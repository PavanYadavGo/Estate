import axios from "axios";

export default async function sendOTP(phone, otp) {
  try {
    const response = await axios.get(
      "https://www.fast2sms.com/dev/bulkV2",
      {
        params: {
          authorization: process.env.FAST2SMS_API_KEY,
          route: "otp",
          variables_values: otp,
          flash: 0,
          numbers: phone,
        },
      }
    );

    return response.data;
  } catch (err) {
    console.error("OTP Error:", err.response?.data || err.message);
    throw new Error("Failed to send OTP");
  }
}