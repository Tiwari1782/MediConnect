import axios from "axios";

// ─── AI CHATBOT (Hugging Face) ───────────────────────────────────
export const chatWithAI = async (req, res, next) => {
  try {
    const { message, conversationHistory = [] } = req.body;

    if (!message) {
      return res.status(400).json({
        success: false,
        message: "Message is required.",
      });
    }

    // Build conversation context
    const systemPrompt =
      "You are MediConnect AI Assistant, a helpful healthcare assistant. You can help users with general health information, appointment guidance, medicine information, and wellness tips. Always remind users to consult a real doctor for medical diagnosis and treatment. Do not provide specific medical diagnoses.";

    const messages = [
      { role: "system", content: systemPrompt },
      ...conversationHistory.map((msg) => ({
        role: msg.role,
        content: msg.content,
      })),
      { role: "user", content: message },
    ];

    // Format for Hugging Face Inference API
    const prompt = messages
      .map((m) => {
        if (m.role === "system") return `<|system|>\n${m.content}\n`;
        if (m.role === "user") return `<|user|>\n${m.content}\n`;
        return `<|assistant|>\n${m.content}\n`;
      })
      .join("") + "<|assistant|>\n";

    const response = await axios.post(
      "https://api-inference.huggingface.co/models/microsoft/DialoGPT-large",
      {
        inputs: prompt,
        parameters: {
          max_new_tokens: 500,
          temperature: 0.7,
          top_p: 0.9,
          return_full_text: false,
        },
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.HUGGINGFACE_API_KEY}`,
          "Content-Type": "application/json",
        },
      }
    );

    let aiResponse = "";

    if (Array.isArray(response.data)) {
      aiResponse =
        response.data[0]?.generated_text || "I'm sorry, I couldn't process that.";
    } else if (response.data?.generated_text) {
      aiResponse = response.data.generated_text;
    } else {
      aiResponse =
        "I'm here to help with general health queries. Could you please rephrase your question?";
    }

    res.status(200).json({
      success: true,
      reply: aiResponse.trim(),
    });
  } catch (error) {
    console.error("AI Chatbot error:", error.response?.data || error.message);

    // Fallback response if API fails
    res.status(200).json({
      success: true,
      reply:
        "I apologize, but I'm temporarily unavailable. Please try again later or contact our support team for assistance.",
      fallback: true,
    });
  }
};