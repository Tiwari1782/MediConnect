import Chat from "../models/Chat.js";
import Message from "../models/Message.js";

// ──��� CREATE OR GET CHAT ──────────────────────────────────────────
export const accessChat = async (req, res, next) => {
  try {
    const { receiverId, appointmentId } = req.body;

    if (!receiverId) {
      return res.status(400).json({
        success: false,
        message: "Receiver ID is required.",
      });
    }

    // Check if chat already exists between the two users
    let chat = await Chat.findOne({
      participants: { $all: [req.user._id, receiverId] },
    })
      .populate("participants", "name email avatar")
      .populate("lastMessage");

    if (chat) {
      return res.status(200).json({
        success: true,
        chat,
      });
    }

    // Create new chat
    chat = await Chat.create({
      participants: [req.user._id, receiverId],
      appointmentId: appointmentId || null,
    });

    chat = await Chat.findById(chat._id).populate(
      "participants",
      "name email avatar"
    );

    res.status(201).json({
      success: true,
      chat,
    });
  } catch (error) {
    next(error);
  }
};

// ─── GET ALL MY CHATS ────────────────────────────────────────────
export const getMyChats = async (req, res, next) => {
  try {
    const chats = await Chat.find({
      participants: { $in: [req.user._id] },
    })
      .populate("participants", "name email avatar role")
      .populate({
        path: "lastMessage",
        populate: { path: "sender", select: "name" },
      })
      .sort({ updatedAt: -1 });

    res.status(200).json({
      success: true,
      count: chats.length,
      chats,
    });
  } catch (error) {
    next(error);
  }
};