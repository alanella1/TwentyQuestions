import React from "react";
import "../styles/GameContainer.css";
import "./HistoryModal";
import HistoryModal from "./HistoryModal";
import { GameContainerProps } from "../types";

const GameContainer: React.FC<GameContainerProps> = ({
  score,
  question,
  curAnswerCost,
  onQuestionChange,
  setQuestion,
  onSend,
  onCheckCost,
  onGiveUp,
  messages,
}) => {
  const lastMessage = messages[messages.length - 1];
  const [showHistory, setShowHistory] = React.useState(false);
  return (
    <div className="game-wrapper">
      <div className="top-row">
        <div className="score-box">Total Score: {score}</div>
        <button className="history-button" onClick={() => setShowHistory(true)}>
          View History
        </button>
        <button className="give-up-button" onClick={onGiveUp}>
          I GIVE UP
        </button>
      </div>

      <div className="genie-label">Genie</div>

      <div className="genie-box">
        <div className="cost-display">Cost: {curAnswerCost}</div>
        <div className="genie-answer">{lastMessage?.sender === "ai" ? lastMessage.text : ""}</div>
        <div className="user-question">
          <input
            className="question-input"
            type="text"
            placeholder="Ask a question..."
            value={question}
            onChange={onQuestionChange}
          />
          {question && (
            <span className="clear-input" onClick={() => setQuestion("")}>
              x
            </span>
          )}
        </div>
      </div>

      <div className="input-row">
        <button className="send-button" onClick={onSend}>
          Send
        </button>
        <button className="check-cost-button" onClick={onCheckCost}>
          Check Cost
        </button>
      </div>

      {showHistory && <HistoryModal messages={messages} onClose={() => setShowHistory(false)} />}
    </div>
  );
};

export default GameContainer;
