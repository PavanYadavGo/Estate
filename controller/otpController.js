import OTP from "../models/otpModel.js";
import generateOTP from "../utils/generateOTP.js";
import sendOTP from "../services/fast2smsService.js";
import userModel from "../models/userModel.js";
import crypto from "crypto";
import emailService from "../services/emailService.js";
import bcrypt from "bcryptjs";
import generateOTP from "../utils/generateOTP.js";

const otp = generateOTP();

export const sendSignupOTP = async (req, res) => {
  try {
    const { name, email, phone, password } = req.body;

    // Check existing email
    if (await userModel.findOne({ email })) {
      return res.json({
        success: false,
        message: "Email already exists."
      });
    }

    // Check existing phone
    if (await userModel.findOne({ phone })) {
      return res.json({
        success: false,
        message: "Phone number already registered."
      });
    }

    const otp = generateOTP();
    const hashedPassword = await bcrypt.hash(password, 10);

    // Remove old signup OTP if present
    await OTP.deleteMany({
      phone,
      purpose: "signup"
    });

    await OTP.create({
      phone,
      otp,
      purpose: "signup",
      userData: {
        name,
        email,
        phone,
        password: hashedPassword
      },
      expiresAt: new Date(Date.now() + 5 * 60 * 1000)
    });

    await sendOTP(phone, otp);

    return res.json({
      success: true,
      message: "OTP sent successfully."
    });

  } catch (err) {
    console.error(err);
    return res.status(500).json({
      success: false,
      message: "Failed to send OTP."
    });
  }
};
export const verifySignupOTP = async (req, res) => {
  try {
    const { phone, otp } = req.body;

    const otpDoc = await OTP.findOne({
      phone,
      purpose: "signup",
    });

    if (!otpDoc) {
      return res.json({
        success: false,
        message: "OTP expired or not found."
      });
    }

    if (otpDoc.otp !== otp) {
      return res.json({
        success: false,
        message: "Invalid OTP."
      });
    }

    const verificationToken = crypto.randomBytes(32).toString("hex");
    const hashedVerificationToken = crypto
      .createHash("sha256")
      .update(verificationToken)
      .digest("hex");

    const user = await userModel.create({
      ...otpDoc.userData,
      isEmailVerified: false,
      isPhoneVerified: true,
      emailVerificationToken: hashedVerificationToken,
      verificationTokenExpiry: Date.now() + 24 * 60 * 60 * 1000,
    });

    const verificationUrl =
      `${process.env.WEBSITE_URL}/verify-email/${verificationToken}`;

    await emailService.sendEmailVerification(
      user.email,
      user.name,
      verificationUrl
    );

    await OTP.deleteOne({ _id: otpDoc._id });

    return res.json({
      success: true,
      message:
        "Phone verified successfully. Please verify your email."
    });

  } catch (err) {
    console.error(err);

    return res.status(500).json({
      success: false,
      message: "Verification failed."
    });
  }
};