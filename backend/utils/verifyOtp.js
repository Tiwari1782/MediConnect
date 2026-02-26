import twilioClient, { twilioServiceSid } from "../config/twilio.js";

/**
 * Verify OTP code
 * @param {string} phoneNumber - Phone number with country code
 * @param {string} code - OTP code entered by the user
 */
const verifyOtp = async (phoneNumber, code) => {
  try {
    const verificationCheck = await twilioClient.verify.v2
      .services(twilioServiceSid)
      .verificationChecks.create({
        to: phoneNumber,
        code,
      });
    return verificationCheck.status === "approved";
  } catch (error) {
    console.error("❌ OTP verification error:", error.message);
    throw new Error("Failed to verify OTP");
  }
};

export default verifyOtp;