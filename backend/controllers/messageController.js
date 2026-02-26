import Message from "../models/Message.js";
import Chat from "../models/Chat.js";

// ─── SEND MESSAGE ────────────────────────────────────────────────
export const sendMessage = async (req, res, next) => {
  try {
    const { chatId, content, messageType } = req.body;

    if (!chatId) {
      return res.status(400).json({
        success: false,
        message: "Chat ID is required.",
      });
    }

    const chat = await Chat.findById(chatId);
    if (!chat) {
      return res.status(404).json({
        success: false,
        message: "Chat not found.",
      });
    }

    // Check if user is a participant
    if (!chat.participants.includes(req.user._id)) {
      return res.status(403).json({
        success: false,
        message: "You are not a participant in this chat.",
      });
    }

    const messageData = {
      chatId,
      sender: req.user._id,
      content: content || "",
      messageType: messageType || "text",
    };

    // Handle file upload
    if (req.file) {
      messageData.fileUrl = req.file.path;
      messageData.fileName = req.file.originalname;
      messageData.fileSize = req.file.size;
      messageData.messageType = req.file.mimetype.startsWith("image/")
        ? "image"
        : "file";
    }

    let message = await Message.create(messageData);

    // Update last message in chat
    chat.lastMessage = message._id;
    await chat.save();

    message = await Message.findById(message._id).populate(
      "sender",
      "name avatar"
    );

    res.status(201).json({
      success: true,
      message,
    });
  } catch (error) {
    next(error);
  }
};

// ─── GET MESSAGES FOR A CHAT ─────────────────────────────────────
export const getMessages = async (req, res, next) => {
  try {
    const { chatId } = req.params;
    const { page = 1, limit = 50 } = req.query;

    const chat = await Chat.findById(chatId);
    if (!chat) {
      return res.status(404).json({
        success: false,
        message: "Chat not found.",
      });
    }

    if (!chat.participants.includes(req.user._id)) {
      return res.status(403).json({
        success: false,
        message: "You are not a participant in this chat.",
      });
    }

    const skip = (Number(page) - 1) * Number(limit);

    const messages = await Message.find({ chatId })
      .populate("sender", "name avatar")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit));

    const total = await Message.countDocuments({ chatId });

    // Mark messages as read
    await Message.updateMany(
      {
        chatId,
        sender: { $ne: req.user._id },
        isRead: false,
      },
      {
        isRead: true,
        readAt: new Date(),
      }
    );

    res.status(200).json({
      success: true,
      count: messages.length,
      total,
      totalPages: Math.ceil(total / Number(limit)),
      currentPage: Number(page),
      messages: messages.reverse(), // Return in chronological order
    });
  } catch (error) {
    next(error);
  }
};