import { useState, useRef, useEffect } from "react";
import { useSelector } from "react-redux";
import axios from "axios";

const ChatWidget = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      text: "Hi! I can help with questions about your orders. Ask me anything.",
    },
  ]);
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef(null);

  // Reuses the same userInfo pattern as the rest of the ProShop app
  const userLogin = useSelector((state) => state.userLogin);
  const { userInfo } = userLogin;

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isOpen]);

  const handleSend = async () => {
    if (!input.trim() || loading) return;

    const userMessage = input.trim();
    setMessages((prev) => [...prev, { role: "user", text: userMessage }]);
    setInput("");
    setLoading(true);

    try {
      const { data } = await axios.post(
        "/api/chat",
        { message: userMessage, history: messages },
        {
          headers: {
            Authorization: `Bearer ${userInfo.token}`,
          },
        },
      );
      setMessages((prev) => [...prev, { role: "assistant", text: data.reply }]);
    } catch (error) {
      const errMsg =
        error.response?.data?.message ||
        "Something went wrong. Please try again.";
      setMessages((prev) => [...prev, { role: "assistant", text: errMsg }]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // Don't show the widget for logged-out visitors — order support requires auth
  if (!userInfo) return null;

  return (
    <div style={styles.container}>
      {isOpen && (
        <div style={styles.panel}>
          <div style={styles.header}>
            <span>Order Support</span>
            <button style={styles.closeBtn} onClick={() => setIsOpen(false)}>
              ×
            </button>
          </div>

          <div style={styles.messages} ref={scrollRef}>
            {messages.map((msg, i) => (
              <div
                key={i}
                style={{
                  ...styles.bubble,
                  ...(msg.role === "user"
                    ? styles.userBubble
                    : styles.botBubble),
                }}
              >
                {msg.text}
              </div>
            ))}
            {loading && (
              <div style={{ ...styles.bubble, ...styles.botBubble }}>
                Typing...
              </div>
            )}
          </div>

          <div style={styles.inputRow}>
            <input
              style={styles.input}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask about your order..."
              disabled={loading}
            />
            <button
              style={styles.sendBtn}
              onClick={handleSend}
              disabled={loading}
            >
              Send
            </button>
          </div>
        </div>
      )}

      <button style={styles.fab} onClick={() => setIsOpen((prev) => !prev)}>
        {isOpen ? "×" : "💬"}
      </button>
    </div>
  );
};

const styles = {
  container: {
    position: "fixed",
    bottom: "20px",
    right: "20px",
    zIndex: 1000,
    fontFamily: "inherit",
  },
  fab: {
    width: "56px",
    height: "56px",
    borderRadius: "50%",
    border: "none",
    backgroundColor: "#f0c14b",
    color: "#111",
    fontSize: "24px",
    cursor: "pointer",
    boxShadow: "0 2px 8px rgba(0,0,0,0.3)",
  },
  panel: {
    width: "320px",
    height: "420px",
    backgroundColor: "#fff",
    borderRadius: "10px",
    boxShadow: "0 4px 16px rgba(0,0,0,0.25)",
    display: "flex",
    flexDirection: "column",
    marginBottom: "12px",
    overflow: "hidden",
  },
  header: {
    backgroundColor: "#111",
    color: "#fff",
    padding: "12px 16px",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    fontWeight: "bold",
  },
  closeBtn: {
    background: "none",
    border: "none",
    color: "#fff",
    fontSize: "20px",
    cursor: "pointer",
  },
  messages: {
    flex: 1,
    padding: "12px",
    overflowY: "auto",
    display: "flex",
    flexDirection: "column",
    gap: "8px",
    backgroundColor: "#f7f7f7",
  },
  bubble: {
    maxWidth: "80%",
    padding: "8px 12px",
    borderRadius: "12px",
    fontSize: "14px",
    lineHeight: "1.4",
    whiteSpace: "pre-wrap",
  },
  userBubble: {
    alignSelf: "flex-end",
    backgroundColor: "#f0c14b",
    color: "#111",
  },
  botBubble: {
    alignSelf: "flex-start",
    backgroundColor: "#fff",
    border: "1px solid #ddd",
    color: "#111",
  },
  inputRow: {
    display: "flex",
    borderTop: "1px solid #ddd",
    padding: "8px",
    gap: "8px",
  },
  input: {
    flex: 1,
    border: "1px solid #ccc",
    borderRadius: "6px",
    padding: "8px",
    fontSize: "14px",
  },
  sendBtn: {
    backgroundColor: "#111",
    color: "#fff",
    border: "none",
    borderRadius: "6px",
    padding: "8px 14px",
    cursor: "pointer",
  },
};

export default ChatWidget;
