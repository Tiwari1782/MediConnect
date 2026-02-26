import crypto from "crypto";
import jwt from "jsonwebtoken";
import User from "../models/User.js";
import Doctor from "../models/Doctor.js";
import Patient from "../models/Patient.js";
import {
  generateAccessToken,
  generateRefreshToken,
} from "../utils/generateTokens.js";
import sendEmail from "../utils/sendEmail.js";
import sendOtp from "../utils/sendOtp.js";
import verifyOtpUtil from "../utils/verifyOtp.js";
import cloudinary from "../config/cloudinary.js";

// ─── REGISTER ────────────────────────────────────────────────────
export const register = async (req, res, next) => {
  try {
    const { name, email, password, phone, role } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "User with this email already exists.",
      });
    }

    // Generate email verification token
    const emailVerificationToken = crypto.randomBytes(32).toString("hex");
    const emailVerificationExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hrs

    // Create user
    const user = await User.create({
      name,
      email,
      password,
      phone,
      role,
      emailVerificationToken,
      emailVerificationExpiry,
    });

    // Create role-specific profile
    if (role === "doctor") {
      const { specialization, licenseNumber, consultationFee, experience } =
        req.body;
      await Doctor.create({
        userId: user._id,
        specialization: specialization || "General",
        licenseNumber: licenseNumber || `LIC-${user._id}`,
        consultationFee: consultationFee || 500,
        experience: experience || 0,
      });
    } else {
      await Patient.create({
        userId: user._id,
      });
    }

    // Send verification email
    const verificationUrl = `${process.env.CLIENT_URL}/verify-email/${emailVerificationToken}`;
    await sendEmail(
      email,
      "MediConnect - Verify Your Email",
      `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #2563eb;">Welcome to MediConnect, ${name}!</h2>
        <p>Please verify your email address by clicking the button below:</p>
        <a href="${verificationUrl}" 
           style="display: inline-block; padding: 12px 24px; background-color: #2563eb; color: white; text-decoration: none; border-radius: 8px; margin: 16px 0;">
          Verify Email
        </a>
        <p style="color: #6b7280; font-size: 14px;">This link expires in 24 hours.</p>
      </div>
      `
    );

    // Generate tokens
    const accessToken = generateAccessToken(user._id, user.role);
    const refreshToken = generateRefreshToken(user._id, user.role);

    // Store refresh token
    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false });

    // Set cookies
    res.cookie("accessToken", accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 15 * 60 * 1000, // 15 min
    });

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    res.status(201).json({
      success: true,
      message:
        "Registration successful! Please verify your email and phone number.",
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        avatar: user.avatar,
        isEmailVerified: user.isEmailVerified,
        isPhoneVerified: user.isPhoneVerified,
      },
      accessToken,
    });
  } catch (error) {
    next(error);
  }
};

// ─── VERIFY EMAIL ────────────────────────────────────────────────
export const verifyEmail = async (req, res, next) => {
  try {
    const { token } = req.params;

    const user = await User.findOne({
      emailVerificationToken: token,
      emailVerificationExpiry: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: "Invalid or expired verification token.",
      });
    }

    user.isEmailVerified = true;
    user.emailVerificationToken = undefined;
    user.emailVerificationExpiry = undefined;
    await user.save({ validateBeforeSave: false });

    res.status(200).json({
      success: true,
      message: "Email verified successfully!",
    });
  } catch (error) {
    next(error);
  }
};

// ─── SEND PHONE OTP ─────────────────────────────────────────────
export const sendPhoneOtp = async (req, res, next) => {
  try {
    const { phone } = req.body;

    if (!phone) {
      return res.status(400).json({
        success: false,
        message: "Phone number is required.",
      });
    }

    await sendOtp(phone);

    res.status(200).json({
      success: true,
      message: "OTP sent successfully!",
    });
  } catch (error) {
    next(error);
  }
};

// ─── VERIFY PHONE OTP ───────────────────────────────────────────
export const verifyPhoneOtp = async (req, res, next) => {
  try {
    const { phone, code } = req.body;

    const isValid = await verifyOtpUtil(phone, code);

    if (!isValid) {
      return res.status(400).json({
        success: false,
        message: "Invalid OTP.",
      });
    }

    // Update user phone verification status
    const user = await User.findOne({ phone });
    if (user) {
      user.isPhoneVerified = true;
      await user.save({ validateBeforeSave: false });
    }

    res.status(200).json({
      success: true,
      message: "Phone number verified successfully!",
    });
  } catch (error) {
    next(error);
  }
};

// ─── LOGIN ───────────────────────────────────────────────────────
export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required.",
      });
    }

    const user = await User.findOne({ email }).select("+password");

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password.",
      });
    }

    const isMatch = await user.comparePassword(password);

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password.",
      });
    }

    // Generate tokens
    const accessToken = generateAccessToken(user._id, user.role);
    const refreshToken = generateRefreshToken(user._id, user.role);

    // Store refresh token
    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false });

    // Set cookies
    res.cookie("accessToken", accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 15 * 60 * 1000,
    });

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.status(200).json({
      success: true,
      message: "Login successful!",
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        avatar: user.avatar,
        isEmailVerified: user.isEmailVerified,
        isPhoneVerified: user.isPhoneVerified,
      },
      accessToken,
    });
  } catch (error) {
    next(error);
  }
};

// ─── REFRESH TOKEN ───────────────────────────────────────────────
export const refreshAccessToken = async (req, res, next) => {
  try {
    const incomingRefreshToken =
      req.cookies?.refreshToken || req.body?.refreshToken;

    if (!incomingRefreshToken) {
      return res.status(401).json({
        success: false,
        message: "Refresh token not found.",
      });
    }

    const decoded = jwt.verify(
      incomingRefreshToken,
      process.env.JWT_REFRESH_SECRET
    );

    const user = await User.findById(decoded.id);

    if (!user || user.refreshToken !== incomingRefreshToken) {
      return res.status(401).json({
        success: false,
        message: "Invalid refresh token.",
      });
    }

    const accessToken = generateAccessToken(user._id, user.role);
    const newRefreshToken = generateRefreshToken(user._id, user.role);

    user.refreshToken = newRefreshToken;
    await user.save({ validateBeforeSave: false });

    res.cookie("accessToken", accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 15 * 60 * 1000,
    });

    res.cookie("refreshToken", newRefreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.status(200).json({
      success: true,
      message: "Token refreshed successfully.",
      accessToken,
    });
  } catch (error) {
    next(error);
  }
};

// ─── LOGOUT ──────────────────────────────────────────────────────
export const logout = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    if (user) {
      user.refreshToken = "";
      await user.save({ validateBeforeSave: false });
    }

    res.clearCookie("accessToken");
    res.clearCookie("refreshToken");

    res.status(200).json({
      success: true,
      message: "Logged out successfully.",
    });
  } catch (error) {
    next(error);
  }
};

// ─── GET MY PROFILE ──────────────────────────────────────────────
export const getMyProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);

    let profile = null;
    if (user.role === "doctor") {
      profile = await Doctor.findOne({ userId: user._id });
    } else {
      profile = await Patient.findOne({ userId: user._id });
    }

    res.status(200).json({
      success: true,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        avatar: user.avatar,
        isEmailVerified: user.isEmailVerified,
        isPhoneVerified: user.isPhoneVerified,
      },
      profile,
    });
  } catch (error) {
    next(error);
  }
};

// ─── UPDATE AVATAR ───────────────────────────────────────────────
export const updateAvatar = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "Please upload an image.",
      });
    }

    const user = await User.findById(req.user._id);

    // Delete old avatar from Cloudinary if it exists
    if (user.avatar.public_id) {
      await cloudinary.uploader.destroy(user.avatar.public_id);
    }

    user.avatar = {
      public_id: req.file.filename,
      url: req.file.path,
    };

    await user.save({ validateBeforeSave: false });

    res.status(200).json({
      success: true,
      message: "Avatar updated successfully.",
      avatar: user.avatar,
    });
  } catch (error) {
    next(error);
  }
};