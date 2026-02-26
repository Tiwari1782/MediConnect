import crypto from "crypto";
import razorpayInstance from "../config/razorpay.js";
import Payment from "../models/Payment.js";
import Appointment from "../models/Appointment.js";
import Patient from "../models/Patient.js";
import Notification from "../models/Notification.js";

// ─── CREATE RAZORPAY ORDER ───────────────────────────────────────
// Replace the createOrder function with this fix:

export const createOrder = async (req, res, next) => {
  try {
    const { appointmentId } = req.body;

    if (!appointmentId) {
      return res.status(400).json({
        success: false,
        message: "Appointment ID is required.",
      });
    }

    const appointment = await Appointment.findById(appointmentId);
    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: "Appointment not found.",
      });
    }

    if (appointment.paymentStatus === "paid") {
      return res.status(400).json({
        success: false,
        message: "Payment has already been made for this appointment.",
      });
    }

    // Find patient — support both direct userId match and patientId lookup
    const patient = await Patient.findOne({ userId: req.user._id });
    if (!patient) {
      return res.status(404).json({
        success: false,
        message: "Patient profile not found.",
      });
    }

    if (patient._id.toString() !== appointment.patientId.toString()) {
      return res.status(403).json({
        success: false,
        message: "You are not authorized to pay for this appointment.",
      });
    }

    // Validate Razorpay keys exist
    if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
      return res.status(500).json({
        success: false,
        message: "Payment gateway is not configured.",
      });
    }

    const amountInPaise = Math.round(appointment.fee * 100);

    // Find this block in the createOrder function and replace the options object:

    const options = {
      amount: amountInPaise,
      currency: "INR",
      receipt: `rcpt_${Date.now()}`,  // ✅ Fixed: short receipt (max 40 chars)
      notes: {
        appointmentId: appointmentId,
        patientId: patient._id.toString(),
        doctorId: appointment.doctorId.toString(),
      },
    };

    const order = await razorpayInstance.orders.create(options);

    if (!order || !order.id) {
      return res.status(500).json({
        success: false,
        message: "Failed to create Razorpay order.",
      });
    }

    const payment = await Payment.create({
      appointmentId,
      patientId: patient._id,
      doctorId: appointment.doctorId,
      amount: appointment.fee,
      razorpayOrderId: order.id,
    });

    res.status(201).json({
      success: true,
      order,
      payment,
      key: process.env.RAZORPAY_KEY_ID,
    });
  } catch (error) {
    console.error("Create order error:", error);
    next(error);
  }
};

// ─── VERIFY PAYMENT ──────────────────────────────────────────────
export const verifyPayment = async (req, res, next) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } =
      req.body;

    // Verify signature
    const body = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(body)
      .digest("hex");

    if (expectedSignature !== razorpay_signature) {
      // Update payment status to failed
      await Payment.findOneAndUpdate(
        { razorpayOrderId: razorpay_order_id },
        { status: "failed" }
      );

      return res.status(400).json({
        success: false,
        message: "Payment verification failed. Invalid signature.",
      });
    }

    // Update payment
    const payment = await Payment.findOneAndUpdate(
      { razorpayOrderId: razorpay_order_id },
      {
        razorpayPaymentId: razorpay_payment_id,
        razorpaySignature: razorpay_signature,
        status: "paid",
      },
      { new: true }
    );

    // Update appointment
    if (payment) {
      await Appointment.findByIdAndUpdate(payment.appointmentId, {
        paymentStatus: "paid",
        paymentId: payment._id,
      });

      // Notify both parties
      const appointment = await Appointment.findById(payment.appointmentId)
        .populate({ path: "doctorId", populate: { path: "userId" } })
        .populate({ path: "patientId", populate: { path: "userId" } });

      if (appointment) {
        // Notify patient
        await Notification.create({
          userId: appointment.patientId.userId._id,
          title: "Payment Successful",
          message: `Your payment of ₹${payment.amount} for appointment on ${appointment.appointmentDate.toLocaleDateString()} was successful.`,
          type: "payment_success",
          referenceId: payment._id,
          referenceModel: "Payment",
        });

        // Notify doctor
        await Notification.create({
          userId: appointment.doctorId.userId._id,
          title: "Payment Received",
          message: `Payment of ₹${payment.amount} received for appointment on ${appointment.appointmentDate.toLocaleDateString()}.`,
          type: "payment_success",
          referenceId: payment._id,
          referenceModel: "Payment",
        });
      }
    }

    res.status(200).json({
      success: true,
      message: "Payment verified successfully!",
      payment,
    });
  } catch (error) {
    next(error);
  }
};

// ─── REFUND PAYMENT ──────────────────────────────────────────────
export const refundPayment = async (req, res, next) => {
  try {
    const { paymentId } = req.params;

    const payment = await Payment.findById(paymentId);
    if (!payment) {
      return res.status(404).json({
        success: false,
        message: "Payment not found.",
      });
    }

    if (payment.status !== "paid") {
      return res.status(400).json({
        success: false,
        message: "Only paid payments can be refunded.",
      });
    }

    const refund = await razorpayInstance.payments.refund(
      payment.razorpayPaymentId,
      {
        amount: payment.amount * 100,
        notes: { reason: "Appointment cancelled" },
      }
    );

    payment.status = "refunded";
    payment.refundId = refund.id;
    payment.refundAmount = payment.amount;
    await payment.save();

    // Update appointment
    await Appointment.findByIdAndUpdate(payment.appointmentId, {
      paymentStatus: "refunded",
    });

    res.status(200).json({
      success: true,
      message: "Refund processed successfully.",
      refund,
    });
  } catch (error) {
    next(error);
  }
};

// ─── GET PAYMENT DETAILS ─────────────────────────────────────────
export const getPaymentDetails = async (req, res, next) => {
  try {
    const { paymentId } = req.params;

    const payment = await Payment.findById(paymentId)
      .populate("appointmentId")
      .populate({
        path: "patientId",
        populate: { path: "userId", select: "name email" },
      })
      .populate({
        path: "doctorId",
        populate: { path: "userId", select: "name email" },
      });

    if (!payment) {
      return res.status(404).json({
        success: false,
        message: "Payment not found.",
      });
    }

    res.status(200).json({
      success: true,
      payment,
    });
  } catch (error) {
    next(error);
  }
};