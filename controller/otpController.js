import OTP from "../models/otpModel.js";
import generateOTP from "../utils/generateOTP.js";
import { sendOTP } from "../services/otpService.js";

export const sendOTPController = async (req, res) => {
  try {
    const { phone, purpose } = req.body;
    
    if (!/^[6-9]\d{9}$/.test(phone)) {
  return res.status(400).json({
    success: false,
    message: "Invalid phone number",
  });
}

    if (!phone) {
      return res.status(400).json({
        success: false,
        message: "Phone number is required",
      });
    }

    const otp = generateOTP();

    // Remove old OTPs for this phone + purpose
    await OTP.deleteMany({ phone, purpose });

    // Save new OTP (5 min expiry)
    await OTP.create({
      phone,
      otp,
      purpose,
      expiresAt: new Date(Date.now() + 5 * 60 * 1000),
    });

    await sendOTP(phone, otp);

    return res.json({
      success: true,
      message: "OTP sent successfully",
    });

  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message: "Failed to send OTP",
    });
  }
};

export const verifyOTPController = async (req, res) => {
  try {
    const { phone, otp, purpose } = req.body;

    const record = await OTP.findOne({
      phone,
      otp,
      purpose,
    });

    if (!record) {
      return res.status(400).json({
        success: false,
        message: "Invalid OTP",
      });
    }

    if (record.expiresAt < new Date()) {
      await OTP.deleteOne({ _id: record._id });

      return res.status(400).json({
        success: false,
        message: "OTP has expired",
      });
    }

    await OTP.deleteOne({ _id: record._id });

    return res.json({
      success: true,
      message: "OTP verified successfully",
    });

  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message: "Verification failed",
    });
  }
};