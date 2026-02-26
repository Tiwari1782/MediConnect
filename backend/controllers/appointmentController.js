import Appointment from "../models/Appointment.js";
import Doctor from "../models/Doctor.js";
import Patient from "../models/Patient.js";
import Schedule from "../models/Schedule.js";
import Notification from "../models/Notification.js";

// ─── REQUEST APPOINTMENT (PATIENT) ──────────────────────────────
export const requestAppointment = async (req, res, next) => {
  try {
    const patient = await Patient.findOne({ userId: req.user._id });
    if (!patient) {
      return res.status(404).json({
        success: false,
        message: "Patient profile not found.",
      });
    }

    const {
      doctorId,
      scheduleId,
      slotIndex,
      appointmentDate,
      startTime,
      endTime,
      reason,
    } = req.body;

    // Verify doctor exists
    const doctor = await Doctor.findById(doctorId).populate("userId", "name");
    if (!doctor) {
      return res.status(404).json({
        success: false,
        message: "Doctor not found.",
      });
    }

    // If booking from schedule, verify slot availability
    if (scheduleId && slotIndex !== undefined) {
      const schedule = await Schedule.findById(scheduleId);
      if (!schedule || !schedule.slots[slotIndex]) {
        return res.status(400).json({
          success: false,
          message: "Invalid schedule or slot.",
        });
      }
      if (schedule.slots[slotIndex].isBooked) {
        return res.status(400).json({
          success: false,
          message: "This slot is already booked.",
        });
      }
    }

    // Check for conflicting appointments
    const existingAppointment = await Appointment.findOne({
      doctorId,
      appointmentDate: new Date(appointmentDate),
      startTime,
      status: { $in: ["pending", "confirmed"] },
    });

    if (existingAppointment) {
      return res.status(400).json({
        success: false,
        message: "This time slot is already booked.",
      });
    }

    const fee =
      scheduleId && slotIndex !== undefined
        ? (await Schedule.findById(scheduleId)).slots[slotIndex].price
        : doctor.consultationFee;

    const appointment = await Appointment.create({
      doctorId,
      patientId: patient._id,
      scheduleId: scheduleId || null,
      slotIndex: slotIndex !== undefined ? slotIndex : null,
      appointmentDate: new Date(appointmentDate),
      startTime,
      endTime,
      reason: reason || "",
      fee,
    });

    // Create notification for doctor
    await Notification.create({
      userId: doctor.userId._id || doctor.userId,
      title: "New Appointment Request",
      message: `You have a new appointment request for ${new Date(appointmentDate).toLocaleDateString()} at ${startTime}.`,
      type: "appointment_reminder",
      referenceId: appointment._id,
      referenceModel: "Appointment",
    });

    res.status(201).json({
      success: true,
      message: "Appointment requested successfully!",
      appointment,
    });
  } catch (error) {
    next(error);
  }
};

// ─── CONFIRM / UPDATE APPOINTMENT STATUS (DOCTOR) ────────────────
export const updateAppointmentStatus = async (req, res, next) => {
  try {
    const doctor = await Doctor.findOne({ userId: req.user._id });
    if (!doctor) {
      return res.status(404).json({
        success: false,
        message: "Doctor profile not found.",
      });
    }

    const { appointmentId } = req.params;
    const { status, notes, prescription, cancellationReason } = req.body;

    const appointment = await Appointment.findOne({
      _id: appointmentId,
      doctorId: doctor._id,
    });

    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: "Appointment not found.",
      });
    }

    if (status) appointment.status = status;
    if (notes) appointment.notes = notes;
    if (prescription) appointment.prescription = prescription;

    if (status === "cancelled") {
      appointment.cancellationReason = cancellationReason || "";
      appointment.cancelledBy = "doctor";

      // Unbook the slot if it was from a schedule
      if (appointment.scheduleId && appointment.slotIndex !== null) {
        const schedule = await Schedule.findById(appointment.scheduleId);
        if (schedule && schedule.slots[appointment.slotIndex]) {
          schedule.slots[appointment.slotIndex].isBooked = false;
          schedule.slots[appointment.slotIndex].bookedBy = null;
          await schedule.save();
        }
      }
    }

    if (status === "confirmed" && appointment.scheduleId && appointment.slotIndex !== null) {
      const schedule = await Schedule.findById(appointment.scheduleId);
      if (schedule && schedule.slots[appointment.slotIndex]) {
        schedule.slots[appointment.slotIndex].isBooked = true;
        schedule.slots[appointment.slotIndex].bookedBy = appointment.patientId;
        await schedule.save();
      }
    }

    await appointment.save();

    // Notify patient
    const patient = await Patient.findById(appointment.patientId);
    if (patient) {
      const statusMessages = {
        confirmed: "Your appointment has been confirmed!",
        cancelled: "Your appointment has been cancelled by the doctor.",
        completed: "Your appointment has been marked as completed.",
      };

      if (statusMessages[status]) {
        await Notification.create({
          userId: patient.userId,
          title: `Appointment ${status.charAt(0).toUpperCase() + status.slice(1)}`,
          message: statusMessages[status],
          type:
            status === "confirmed"
              ? "appointment_confirmed"
              : "appointment_cancelled",
          referenceId: appointment._id,
          referenceModel: "Appointment",
        });
      }
    }

    res.status(200).json({
      success: true,
      message: `Appointment ${status || "updated"} successfully.`,
      appointment,
    });
  } catch (error) {
    next(error);
  }
};

// ─── CANCEL APPOINTMENT (PATIENT) ────────────────────────────────
export const cancelAppointment = async (req, res, next) => {
  try {
    const patient = await Patient.findOne({ userId: req.user._id });
    if (!patient) {
      return res.status(404).json({
        success: false,
        message: "Patient profile not found.",
      });
    }

    const { appointmentId } = req.params;
    const { cancellationReason } = req.body;

    const appointment = await Appointment.findOne({
      _id: appointmentId,
      patientId: patient._id,
      status: { $in: ["pending", "confirmed"] },
    });

    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: "Appointment not found or cannot be cancelled.",
      });
    }

    appointment.status = "cancelled";
    appointment.cancellationReason = cancellationReason || "";
    appointment.cancelledBy = "patient";

    // Free up slot
    if (appointment.scheduleId && appointment.slotIndex !== null) {
      const schedule = await Schedule.findById(appointment.scheduleId);
      if (schedule && schedule.slots[appointment.slotIndex]) {
        schedule.slots[appointment.slotIndex].isBooked = false;
        schedule.slots[appointment.slotIndex].bookedBy = null;
        await schedule.save();
      }
    }

    await appointment.save();

    // Notify doctor
    const doctor = await Doctor.findById(appointment.doctorId);
    if (doctor) {
      await Notification.create({
        userId: doctor.userId,
        title: "Appointment Cancelled",
        message: `A patient has cancelled their appointment scheduled for ${appointment.appointmentDate.toLocaleDateString()} at ${appointment.startTime}.`,
        type: "appointment_cancelled",
        referenceId: appointment._id,
        referenceModel: "Appointment",
      });
    }

    res.status(200).json({
      success: true,
      message: "Appointment cancelled successfully.",
      appointment,
    });
  } catch (error) {
    next(error);
  }
};

// ─── GET MY APPOINTMENTS ─────────────────────────────────────────
export const getMyAppointments = async (req, res, next) => {
  try {
    const { status, page = 1, limit = 10, sortBy = "appointmentDate", order = "desc" } = req.query;

    let filter = {};

    if (req.user.role === "doctor") {
      const doctor = await Doctor.findOne({ userId: req.user._id });
      if (!doctor) {
        return res.status(404).json({ success: false, message: "Doctor profile not found." });
      }
      filter.doctorId = doctor._id;
    } else {
      const patient = await Patient.findOne({ userId: req.user._id });
      if (!patient) {
        return res.status(404).json({ success: false, message: "Patient profile not found." });
      }
      filter.patientId = patient._id;
    }

    if (status) filter.status = status;

    const sortOptions = {};
    sortOptions[sortBy] = order === "desc" ? -1 : 1;

    const skip = (Number(page) - 1) * Number(limit);

    const appointments = await Appointment.find(filter)
      .populate({
        path: "doctorId",
        populate: { path: "userId", select: "name email avatar" },
      })
      .populate({
        path: "patientId",
        populate: { path: "userId", select: "name email avatar" },
      })
      .sort(sortOptions)
      .skip(skip)
      .limit(Number(limit));

    const total = await Appointment.countDocuments(filter);

    res.status(200).json({
      success: true,
      count: appointments.length,
      total,
      totalPages: Math.ceil(total / Number(limit)),
      currentPage: Number(page),
      appointments,
    });
  } catch (error) {
    next(error);
  }
};

// ─── GET SINGLE APPOINTMENT ──────────────────────────────────────
export const getAppointmentById = async (req, res, next) => {
  try {
    const appointment = await Appointment.findById(req.params.appointmentId)
      .populate({
        path: "doctorId",
        populate: { path: "userId", select: "name email phone avatar" },
      })
      .populate({
        path: "patientId",
        populate: { path: "userId", select: "name email phone avatar" },
      })
      .populate("paymentId");

    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: "Appointment not found.",
      });
    }

    res.status(200).json({
      success: true,
      appointment,
    });
  } catch (error) {
    next(error);
  }
};