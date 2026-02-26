import twilioClient, { twilioServiceSid } from "../config/twilio.js";

/**
 * Send OTP to phone number via Twilio Verify
 * @param {string} phoneNumber - Phone number with country code e.g. +91XXXXXXXXXX
 */
const sendOtp = async (phoneNumber) => {
  try {
    const verification = await twilioClient.verify.v2
      .services(twilioServiceSid)
      .verifications.create({
        to: phoneNumber,
        channel: "sms",
      });
    console.log(`📱 OTP sent to ${phoneNumber}: Status - ${verification.status}`);
    return verification;
  } catch (error) {
    console.error("❌ OTP sending error:", error.message);
    throw new Error("Failed to send OTP");
  }
};

export default sendOtp;