import multer from "multer";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import cloudinary from "../config/cloudinary.js";

// Avatar upload storage
const avatarStorage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "mediconnect/avatars",
    allowed_formats: ["jpg", "jpeg", "png", "webp"],
    transformation: [{ width: 300, height: 300, crop: "fill" }],
  },
});

// Chat files upload storage
const chatFileStorage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "mediconnect/chat-files",
    allowed_formats: ["jpg", "jpeg", "png", "webp", "pdf", "doc", "docx"],
    resource_type: "auto",
  },
});

// General document upload storage
const documentStorage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "mediconnect/documents",
    allowed_formats: ["jpg", "jpeg", "png", "webp", "pdf"],
    resource_type: "auto",
  },
});

export const uploadAvatar = multer({
  storage: avatarStorage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
});

export const uploadChatFile = multer({
  storage: chatFileStorage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
});

export const uploadDocument = multer({
  storage: documentStorage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
});