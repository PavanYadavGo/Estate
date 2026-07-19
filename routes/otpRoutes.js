import express from "express";
import {
  sendSignupOTP,
  verifySignupOTP
} from "../controller/otpController.js";
import sendOTP from "../services/otpService.js";

const router = express.Router();

router.get("/test", async (req, res) => {
  try {
    await sendOTP("9082224703", "123456"); // Replace with YOUR phone number
    res.json({
      success: true,
      message: "OTP request sent"
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      message: err.message
    });
  }
});

router.post("/signup/send", sendSignupOTP);
router.post("/signup/verify", verifySignupOTP);

export default router;