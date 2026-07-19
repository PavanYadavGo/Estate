import mongoose from "mongoose";

const OTPSchema = new mongoose.Schema(
  {
    phone: {
      type: String,
      required: true,
      index: true,
    },

    otp: {
      type: String,
      required: true,
    },

    purpose: {
      type: String,
      enum: ["signup", "login"],
      required: true,
    },

        userData: {
      type: Object,
    },

    expiresAt: {
      type: Date,
      required: true,
      expires: 0 // MongoDB automatically deletes expired OTPs
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("OTP", OTPSchema);