import React from "react";
import "../styles/HistoryModal.css";
import { QAPair } from "../types";
type Props = {
  pairs: QAPair[];
  onClose: () => void;
};

const HistoryModal: React.FC<Props> = ({ pairs, onClose }) => {
  return (
    <div className="history-overlay">
      <div className="history-modal">
        <h2>Question History</h2>
        <div className="history-content">
          {pairs.map((pair, idx) => (
            <div key={idx} className={"history-message"}>
              <div className={"history-message-user"}>
                <strong>You: </strong>
                {pair.question}
              </div>
              <div className={"history-message-ai"}>
                <strong>Genie: </strong> {pair.answer}
                <strong>
                  {"  ("}
                  {pair.cost}
                  {")"}
                </strong>
              </div>
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
