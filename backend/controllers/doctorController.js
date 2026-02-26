import Doctor from "../models/Doctor.js";
import User from "../models/User.js";

// ─── GET ALL DOCTORS ─────────────────────────────────────────────
export const getAllDoctors = async (req, res, next) => {
  try {
    const {
      specialization,
      search,
      minFee,
      maxFee,
      minRating,
      available,
      page = 1,
      limit = 10,
      sortBy = "rating",
      order = "desc",
    } = req.query;

    const filter = {};

    if (specialization) {
      filter.specialization = { $regex: specialization, $options: "i" };
    }

    if (available !== undefined) {
      filter.isAvailable = available === "true";
    }

    if (minFee || maxFee) {
      filter.consultationFee = {};
      if (minFee) filter.consultationFee.$gte = Number(minFee);
      if (maxFee) filter.consultationFee.$lte = Number(maxFee);
    }

    if (minRating) {
      filter.rating = { $gte: Number(minRating) };
    }

    // Search by doctor name
    let userIds = [];
    if (search) {
      const users = await User.find({
        role: "doctor",
        name: { $regex: search, $options: "i" },
      }).select("_id");
      userIds = users.map((u) => u._id);
      filter.userId = { $in: userIds };
    }

    const sortOptions = {};
    sortOptions[sortBy] = order === "desc" ? -1 : 1;

    const skip = (Number(page) - 1) * Number(limit);

    const doctors = await Doctor.find(filter)
      .populate("userId", "name email phone avatar")
      .sort(sortOptions)
      .skip(skip)
      .limit(Number(limit));

    const total = await Doctor.countDocuments(filter);

    res.status(200).json({
      success: true,
      count: doctors.length,
      total,
      totalPages: Math.ceil(total / Number(limit)),
      currentPage: Number(page),
      doctors,
    });
  } catch (error) {
    next(error);
  }
};

// ─── GET SINGLE DOCTOR ───────────────────────────────────────────
export const getDoctorById = async (req, res, next) => {
  try {
    const doctor = await Doctor.findById(req.params.id).populate(
      "userId",
      "name email phone avatar"
    );

    if (!doctor) {
      return res.status(404).json({
        success: false,
        message: "Doctor not found.",
      });
    }

    res.status(200).json({
      success: true,
      doctor,
    });
  } catch (error) {
    next(error);
  }
};

// ─── UPDATE DOCTOR PROFILE ───────────────────────────────────────
export const updateDoctorProfile = async (req, res, next) => {
  try {
    const doctor = await Doctor.findOne({ userId: req.user._id });

    if (!doctor) {
      return res.status(404).json({
        success: false,
        message: "Doctor profile not found.",
      });
    }

    const allowedUpdates = [
      "specialization",
      "qualifications",
      "experience",
      "consultationFee",
      "bio",
      "address",
      "location",
      "isAvailable",
    ];

    allowedUpdates.forEach((field) => {
      if (req.body[field] !== undefined) {
        doctor[field] = req.body[field];
      }
    });

    // Also update user name and phone if provided
    if (req.body.name || req.body.phone) {
      const user = await User.findById(req.user._id);
      if (req.body.name) user.name = req.body.name;
      if (req.body.phone) user.phone = req.body.phone;
      await user.save({ validateBeforeSave: false });
    }

    await doctor.save();

    res.status(200).json({
      success: true,
      message: "Doctor profile updated successfully.",
      doctor,
    });
  } catch (error) {
    next(error);
  }
};

// ─── GET DOCTOR DASHBOARD STATS ──────────────────────────────────
export const getDoctorDashboard = async (req, res, next) => {
  try {
    const doctor = await Doctor.findOne({ userId: req.user._id });

    if (!doctor) {
      return res.status(404).json({
        success: false,
        message: "Doctor profile not found.",
      });
    }

    // Import here to avoid circular dependency
    const Appointment = (await import("../models/Appointment.js")).default;
    const Payment = (await import("../models/Payment.js")).default;

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const [
      totalAppointments,
      todaysAppointments,
      pendingAppointments,
      completedAppointments,
      totalEarnings,
    ] = await Promise.all([
      Appointment.countDocuments({ doctorId: doctor._id }),
      Appointment.countDocuments({
        doctorId: doctor._id,
        appointmentDate: { $gte: today, $lt: tomorrow },
      }),
      Appointment.countDocuments({
        doctorId: doctor._id,
        status: "pending",
      }),
      Appointment.countDocuments({
        doctorId: doctor._id,
        status: "completed",
      }),
      Payment.aggregate([
        {
          $match: {
            doctorId: doctor._id,
            status: "paid",
          },
        },
        {
          $group: {
            _id: null,
            total: { $sum: "$amount" },
          },
        },
      ]),
    ]);

    res.status(200).json({
      success: true,
      stats: {
        totalAppointments,
        todaysAppointments,
        pendingAppointments,
        completedAppointments,
        totalEarnings: totalEarnings[0]?.total || 0,
        rating: doctor.rating,
        totalReviews: doctor.totalReviews,
      },
    });
  } catch (error) {
    next(error);
  }
};