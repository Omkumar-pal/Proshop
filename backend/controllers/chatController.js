import asyncHandler from "express-async-handler";
import { GoogleGenAI } from "@google/genai";
import Order from "../models/orderModel.js";

// NOTE: created lazily (inside sendMessage) instead of here at module load time.
// If we build it here, it can run before dotenv.config() finishes in server.js,
// leaving apiKey undefined — which makes the SDK silently fall back to trying
// Google Cloud's Application Default Credentials, producing the
// "Could not load the default credentials" error.
let genAI;

// Builds a compact, LLM-friendly summary of a single order.
// Keep this concise — the model only needs enough info to answer,
// not the full raw document.
const summarizeOrder = (order) => {
  const items = order.orderItems
    .map((item) => `${item.qty}x ${item.name}`)
    .join(", ");

  return `Order ID: ${order._id}
Placed on: ${order.createdAt.toDateString()}
Items: ${items}
Total: $${order.totalPrice}
Payment status: ${order.isPaid ? `Paid on ${order.paidAt.toDateString()}` : "Not paid"}
Delivery status: ${
    order.isDelivered
      ? `Delivered on ${order.deliveredAt.toDateString()}`
      : "Not yet delivered"
  }
Shipping address: ${order.shippingAddress.address}, ${order.shippingAddress.city}, ${order.shippingAddress.postalCode}, ${order.shippingAddress.country}`;
};

// @desc    Chat with the order-support assistant
// @route   POST /api/chat
// @access  Private (requires logged-in user — see chatRoutes.js)
const sendMessage = asyncHandler(async (req, res) => {
  const { message, history } = req.body;

  if (!message || !message.trim()) {
    res.status(400);
    throw new Error("Message is required");
  }

  if (!process.env.GEMINI_API_KEY) {
    res.status(503);
    throw new Error(
      "Chat assistant is not configured yet. Missing GEMINI_API_KEY.",
    );
  }

  if (!genAI) {
    genAI = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  }

  // SECURITY: only ever fetch orders belonging to the authenticated user.
  // Never accept an order id or user id from the request body for lookups.
  const orders = await Order.find({ user: req.user._id }).sort({
    createdAt: -1,
  });

  const orderContext =
    orders.length > 0
      ? orders.map(summarizeOrder).join("\n\n---\n\n")
      : "This customer has no orders on file.";

  const systemPrompt = `You are a helpful customer support assistant for the ProShop online store.
You help the currently logged-in customer with questions about THEIR OWN orders only.

Here is this customer's order history:

${orderContext}

Rules:
- Only answer using the order data provided above. Never invent order details, tracking numbers, or dates.
- If the customer asks about something not covered by this data (e.g. a general shipping policy, a refund request, or something you don't have info on), say so honestly and suggest they contact a human support agent.
- Keep answers short, friendly, and to the point.
- Never discuss or reveal information about any other customer's orders.`;

  // Turn the widget's { role: "user" | "assistant", text } history into the
  // shape Gemini expects: { role: "user" | "model", parts: [{ text }] }.
  // Only keep the last 10 turns — enough for real context, cheap enough
  // that cost doesn't grow unbounded as a conversation gets long.
  const conversationHistory = Array.isArray(history)
    ? history
        .filter((m) => m && typeof m.text === "string" && m.text.trim())
        .slice(-10)
        .map((m) => ({
          role: m.role === "assistant" ? "model" : "user",
          parts: [{ text: m.text }],
        }))
    : [];

  const contents = [
    ...conversationHistory,
    { role: "user", parts: [{ text: message }] },
  ];

  let response;
  try {
    response = await genAI.models.generateContent({
      model: "gemini-3.5-flash",
      contents,
      config: {
        systemInstruction: systemPrompt,
        maxOutputTokens: 500,
      },
    });
  } catch (err) {
    // Gemini's free tier occasionally returns 503 UNAVAILABLE when the model
    // is overloaded. Retry once after a short delay before giving up.
    const isOverloaded =
      err?.status === 503 ||
      /UNAVAILABLE|overloaded|high demand/i.test(err?.message || "");

    if (isOverloaded) {
      await new Promise((resolve) => setTimeout(resolve, 1500));
      try {
        response = await genAI.models.generateContent({
          model: "gemini-3.5-flash",
          contents,
          config: {
            systemInstruction: systemPrompt,
            maxOutputTokens: 500,
          },
        });
      } catch (retryErr) {
        res.status(503);
        throw new Error(
          "The assistant is busy right now. Please try again in a moment.",
        );
      }
    } else {
      // Don't leak raw Gemini error payloads (which can include verbose
      // JSON) straight to the user.
      res.status(502);
      throw new Error(
        "Something went wrong talking to the assistant. Please try again.",
      );
    }
  }

  const reply = response.text;

  res.json({ reply });
});

export { sendMessage };
