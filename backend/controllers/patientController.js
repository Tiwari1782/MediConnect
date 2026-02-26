import Patient from "../models/Patient.js";
import User from "../models/User.js";

// ─── GET PATIENT PROFILE ─────────────────────────────────────────
export const getPatientProfile = async (req, res, next) => {
  try {
    const patient = await Patient.findOne({ userId: req.user._id }).populate(
      "userId",
      "name email phone avatar"
    );

    if (!patient) {
      return res.status(404).json({
        success: false,
        message: "Patient profile not found.",
      });
    }

    res.status(200).json({
      success: true,
      patient,
    });
  } catch (error) {
    next(error);
  }
};

// ─── UPDATE PATIENT PROFILE ──────────────────────────────────────
export const updatePatientProfile = async (req, res, next) => {
  try {
    const patient = await Patient.findOne({ userId: req.user._id });

    if (!patient) {
      return res.status(404).json({
        success: false,
        message: "Patient profile not found.",
      });
    }

    const allowedUpdates = [
      "dateOfBirth",
      "gender",
      "bloodGroup",
      "allergies",
      "chronicConditions",
      "emergencyContact",
      "address",
      "medicalHistory",
    ];

    allowedUpdates.forEach((field) => {
      if (req.body[field] !== undefined) {
        patient[field] = req.body[field];
      }
    });

    // Also update user name and phone if provided
    if (req.body.name || req.body.phone) {
      const user = await User.findById(req.user._id);
      if (req.body.name) user.name = req.body.name;
      if (req.body.phone) user.phone = req.body.phone;
      await user.save({ validateBeforeSave: false });
    }

    await patient.save();

    res.status(200).json({
      success: true,
      message: "Patient profile updated successfully.",
      patient,
    });
  } catch (error) {
    next(error);
  }
};

// ─── GET PATIENT DASHBOARD STATS ─────────────────────────────────
export const getPatientDashboard = async (req, res, next) => {
  try {
    const patient = await Patient.findOne({ userId: req.user._id });

    if (!patient) {
      return res.status(404).json({
        success: false,
        message: "Patient profile not found.",
      });
    }

    const Appointment = (await import("../models/Appointment.js")).default;

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const [
      totalAppointments,
      upcomingAppointments,
      completedAppointments,
      cancelledAppointments,
    ] = await Promise.all([
      Appointment.countDocuments({ patientId: patient._id }),
      Appointment.countDocuments({
        patientId: patient._id,
        appointmentDate: { $gte: today },
        status: { $in: ["pending", "confirmed"] },
      }),
      Appointment.countDocuments({
        patientId: patient._id,
        status: "completed",
      }),
      Appointment.countDocuments({
        patientId: patient._id,
        status: "cancelled",
      }),
    ]);

    res.status(200).json({
      success: true,
      stats: {
        totalAppointments,
        upcomingAppointments,
        completedAppointments,
        cancelledAppointments,
      },
    });
  } catch (error) {
    next(error);
  }
};