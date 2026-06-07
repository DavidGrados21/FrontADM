import React, { useState } from "react";
import { api } from "../../../api/api";
import "./ChatBot.css";

const ChatBot = () => {
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);

  const handleSend = async () => {
    if (!message.trim() || loading) return;

    const userMessage = message;

    setMessages((prev) => [
      ...prev,
      {
        type: "user",
        text: userMessage,
      },
    ]);

    setMessage("");
    setLoading(true);

    try {
      const { data } = await api.post("/chatbot/", {
        message: userMessage,
      });

      setMessages((prev) => [
        ...prev,
        {
          type: "bot",
          text: data.response,
        },
      ]);
    } catch (error) {
      console.error(error);

      setMessages((prev) => [
        ...prev,
        {
          type: "error",
          text: "Ocurrió un error al obtener la respuesta.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="chatbot">
      <header className="chatbot-header">
        <img 
            src="/Logo.jpeg" 
            alt="SITEC" 
            className="chatbot-header-logo" />

        <div>
          <h2>SITEC</h2>
          <span>Asistente Virtual</span>
        </div>
      </header>

      <div className="chatbot-body">
        {messages.length === 0 && (
          <div className="chatbot-empty">
          </div>
        )}

        {messages.map((msg, index) => (
          <div
            key={index}
            className={`message-row ${
              msg.type === "user"
                ? "message-row-user"
                : "message-row-bot"
            }`}
          >
            {msg.type !== "user" && (
              <img
                src="/Logo.jpeg"
                alt="SITEC"
                className="message-avatar"
              />
            )}

            <div
              className={`message ${
                 msg.type === "user"
                   ? "message-user"
                   : msg.type === "error"
                   ? "message-error"
                   : "message-bot"
                }`}
            >
                {msg.text}
            </div>

            {msg.type === "user" && (
                <img
                    src="/user.png"
                    alt="Usuario"
                    className="message-avatar"
                />
            )}
          </div>
        ))}

        {loading && (
          <div className="message-row message-row-bot">
            <img
              src="/Logo.jpeg"
              alt="SITEC"
              className="message-avatar"
            />

            <div className="message message-bot typing-container">
             <span className="typing-text">
              SITEC está escribiendo
             </span>

            <div className="typing-indicator">
              <span></span>
              <span></span>
              <span></span>
            </div>
          </div>
        </div>
       )}
      </div>

      <div className="chatbot-footer">
        <input
          type="text"
          className="chatbot-input"
          value={message}
          placeholder="Escribe tu consulta..."
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSend()}
        />

        <button
          className="chatbot-button"
          onClick={handleSend}
          disabled={loading}
        >
          ➤
        </button>
      </div>
    </div>
  );
};

export default ChatBot;