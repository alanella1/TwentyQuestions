import React from "react";

type Message = {
  sender: "user" | "ai";
  text: string;
};

type MessageListProps = {
  messages: Message[];
};

const MessageList: React.FC<MessageListProps> = ({ messages }) => {
  return (
    <div className="prev-messages-container">
      {messages.map((msg, idx) => (
        <div key={idx} className={`single-message-${msg.sender}`}>
          <span className="block">
            <strong>{msg.sender === "user" ? "You" : "Genie"}:</strong> {msg.text}
          </span>
        </div>
      ))}
    </div>
  );
};

export default MessageList;
