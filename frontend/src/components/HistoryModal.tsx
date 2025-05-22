import React from "react";
import "../styles/HistoryModal.css";

type Props = {
  messages: { sender: string; text: string }[];
  onClose: () => void;
};

const HistoryModal: React.FC<Props> = ({ messages, onClose }) => {
  return (
    <div className="history-overlay">
      <div className="history-modal">
        <h2>Question History</h2>
        <div className="history-content">
          {messages.map((msg, idx) => (
            <div key={idx} className={`history-message ${msg.sender}`}>
              <strong>{msg.sender === "user" ? "You" : "Genie"}:</strong> {msg.text}
            </div>
          ))}
        </div>
        <button className="close-button" onClick={onClose}>
          Close
        </button>
      </div>
    </div>
  );
};

export default HistoryModal;
