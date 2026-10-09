
import Conversation from "../models/Conversation.js";
import { sendEmail } from "../services/emailService.js";

// Escape user input before inserting it into HTML emails
const escapeHtml = (value = "") =>
  String(value).replace(/[&<>"']/g, (char) => {
    const entities = {
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#39;",
    };

    return entities[char];
  });

// Create new conversation
export const createConversation = async (req, res) => {
  try {
    const { name, email, subject, message } = req.body;

    if (!name || !email || !subject || !message) {
      return res.status(400).json({
        message: "Name, email, subject and message are required",
      });
    }

    // Save conversation first
    const conversation = await Conversation.create({
      name,
      email,
      subject,
      messages: [
        {
          sender: "client",
          message,
        },
      ],
    });

    // Send email notification separately
    try {
      await sendEmail({
        to: process.env.EMAIL_USER,
        subject: `New BrandNest Inquiry: ${subject}`,
        text: `New conversation received.

Name: ${name}
Email: ${email}
Subject: ${subject}

Message:
${message}`,
        html: `
          <h2>New BrandNest Inquiry</h2>
          <p><strong>Name:</strong> ${escapeHtml(name)}</p>
          <p><strong>Email:</strong> ${escapeHtml(email)}</p>
          <p><strong>Subject:</strong> ${escapeHtml(subject)}</p>
          <h3>Message</h3>
          <p>${escapeHtml(message).replace(/\n/g, "<br>")}</p>
        `,
      });
    } catch (emailError) {
      console.error(
        "Email notification failed:",
        emailError.message
      );
    }

    return res.status(201).json({
      message: "Conversation created successfully",
      conversation,
    });
  } catch (error) {
    console.error("Create conversation error:", error);

    return res.status(500).json({
      message: "Server error",
    });
  }
};

// Get all conversations - Admin
export const getConversations = async (req, res) => {
  try {
    const conversations = await Conversation.find()
      .sort({ updatedAt: -1 });

    return res.status(200).json({
      count: conversations.length,
      conversations,
    });
  } catch (error) {
    console.error("Get conversations error:", error.message);

    return res.status(500).json({
      message: "Server error",
    });
  }
};

// Get single conversation - Admin
export const getConversationById = async (req, res) => {
  try {
    const conversation = await Conversation.findById(req.params.id);

    if (!conversation) {
      return res.status(404).json({
        message: "Conversation not found",
      });
    }

    return res.status(200).json({
      conversation,
    });
  } catch (error) {
    console.error("Get conversation error:", error.message);

    return res.status(500).json({
      message: "Server error",
    });
  }
};

// Change conversation status
export const updateConversationStatus = async (req, res) => {
  try {
    const { status } = req.body;

    if (!["open", "closed"].includes(status)) {
      return res.status(400).json({
        message: "Status must be open or closed",
      });
    }

    const conversation = await Conversation.findByIdAndUpdate(
      req.params.id,
      { status },
      {
        new: true,
        runValidators: true,
      }
    );

    if (!conversation) {
      return res.status(404).json({
        message: "Conversation not found",
      });
    }

    return res.status(200).json({
      message: "Conversation status updated",
      conversation,
    });
  } catch (error) {
    console.error("Update status error:", error.message);

    return res.status(500).json({
      message: "Server error",
    });
  }
};
