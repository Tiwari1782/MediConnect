import Schedule from "../models/Schedule.js";
import Doctor from "../models/Doctor.js";

// ─── CREATE / UPDATE SCHEDULE ────────────────────────────────────
export const upsertSchedule = async (req, res, next) => {
  try {
    const doctor = await Doctor.findOne({ userId: req.user._id });
    if (!doctor) {
      return res.status(404).json({
        success: false,
        message: "Doctor profile not found.",
      });
    }

    const { dayOfWeek, slots } = req.body;

    // Validate
    if (dayOfWeek === undefined || !slots || !Array.isArray(slots)) {
      return res.status(400).json({
        success: false,
        message: "dayOfWeek and slots array are required.",
      });
    }

    // Set default price from consultation fee
    const processedSlots = slots.map((slot) => ({
      ...slot,
      price: slot.price || doctor.consultationFee,
      isBooked: slot.isBooked || false,
      bookedBy: slot.bookedBy || null,
    }));

    let schedule = await Schedule.findOne({
      doctorId: doctor._id,
      dayOfWeek,
    });

    if (schedule) {
      schedule.slots = processedSlots;
      await schedule.save();
    } else {
      schedule = await Schedule.create({
        doctorId: doctor._id,
        dayOfWeek,
        slots: processedSlots,
      });
    }

    res.status(200).json({
      success: true,
      message: "Schedule updated successfully.",
      schedule,
    });
  } catch (error) {
    next(error);
  }
};

// ─── GET DOCTOR'S FULL SCHEDULE ──────────────────────────────────
export const getDoctorSchedule = async (req, res, next) => {
  try {
    const { doctorId } = req.params;

    const schedules = await Schedule.find({
      doctorId,
      isActive: true,
    }).sort({ dayOfWeek: 1 });

    res.status(200).json({
      success: true,
      schedules,
    });
  } catch (error) {
    next(error);
  }
};

// ─── GET MY SCHEDULE (DOCTOR) ────────────────────────────────────
export const getMySchedule = async (req, res, next) => {
  try {
    const doctor = await Doctor.findOne({ userId: req.user._id });
    if (!doctor) {
      return res.status(404).json({
        success: false,
        message: "Doctor profile not found.",
      });
    }

    const schedules = await Schedule.find({ doctorId: doctor._id }).sort({
      dayOfWeek: 1,
    });

    res.status(200).json({
      success: true,
      schedules,
    });
  } catch (error) {
    next(error);
  }
};

// ─── DELETE SCHEDULE FOR A DAY ───────────────────────────────────
export const deleteSchedule = async (req, res, next) => {
  try {
    const doctor = await Doctor.findOne({ userId: req.user._id });
    if (!doctor) {
      return res.status(404).json({
        success: false,
        message: "Doctor profile not found.",
      });
    }

    const { scheduleId } = req.params;

    const schedule = await Schedule.findOneAndDelete({
      _id: scheduleId,
      doctorId: doctor._id,
    });

    if (!schedule) {
      return res.status(404).json({
        success: false,
        message: "Schedule not found.",
      });
    }

    res.status(200).json({
      success: true,
      message: "Schedule deleted successfully.",
    });
  } catch (error) {
    next(error);
  }
};

// ─── TOGGLE SCHEDULE ACTIVE STATUS ───────────────────────────────
export const toggleScheduleStatus = async (req, res, next) => {
  try {
    const doctor = await Doctor.findOne({ userId: req.user._id });
    if (!doctor) {
      return res.status(404).json({
        success: false,
        message: "Doctor profile not found.",
      });
    }

    const { scheduleId } = req.params;

    const schedule = await Schedule.findOne({
      _id: scheduleId,
      doctorId: doctor._id,
    });

    if (!schedule) {
      return res.status(404).json({
        success: false,
        message: "Schedule not found.",
      });
    }

    schedule.isActive = !schedule.isActive;
    await schedule.save();

    res.status(200).json({
      success: true,
      message: `Schedule ${schedule.isActive ? "activated" : "deactivated"} successfully.`,
      schedule,
    });
  } catch (error) {
    next(error);
  }
};