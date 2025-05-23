import React from "react";
import "../styles/GameContainer.css";
import "../styles/App.css";
import "./HistoryModal";
import HistoryModal from "./HistoryModal";
import { GameContainerProps } from "../types";

const GameContainer: React.FC<GameContainerProps> = ({
  onSend,
  onCheckCost,
  onGiveUp,
  score,
  pairs,
}) => {
  const [curGenieAnswer, setCurGenieAnswer] = React.useState("");
  const [showHistory, setShowHistory] = React.useState(false);
  const [displayQuestion, setDisplayQusetion] = React.useState("");
  const [question, setQuestion] = React.useState("");
  const [curAnswerCost, setCurAnswerCost] = React.useState(0);

  const handleSendQuestion = async () => {
    if (question.trim()) {
      let this_question = question.trim();
      setQuestion("");
      setDisplayQusetion(question);
      setCurGenieAnswer("Thinking...");
      const pair = await onSend(this_question);
      if (pair) {
        setCurGenieAnswer(pair.answer);
        setCurAnswerCost(pair.cost);
      }
    }
  };

  return (
    <div className="game-wrapper">
      <div className="score-box">Total Score: {score}</div>
      <div className="options-row">
        <button className="btn-primary history-button" onClick={() => setShowHistory(true)}>
          View History
        </button>
        <button className="btn-primary give-up-button" onClick={onGiveUp}>
          I GIVE UP
        </button>
      </div>

      <div className="genie-label">Genie</div>
      <div className="genie-box">
        <div className="question-cost-row">
          <div className="cur-question-display">
            <strong>Question: </strong>
            {displayQuestion}
          </div>
          <div className="cost-display">Cost: {curAnswerCost}</div>
        </div>

        <div className="genie-answer">{curGenieAnswer}</div>
        <div className="user-question">
          <input
            className="question-input"
            type="text"
            placeholder="Ask a question..."
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
          />
          {question && (
            <span className="clear-input" onClick={() => setQuestion("")}>
              x
            </span>
          )}
        </div>
      </div>
      <div className="action-buttons">
        <button
          className="btn-primary send-button"
          onClick={handleSendQuestion}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              handleSendQuestion();
            }
          }}>
          Send
        </button>
        <button className="btn-primary check-cost-button" onClick={() => onCheckCost(question)}>
          Check Cost
        </button>
      </div>
      {showHistory && <HistoryModal pairs={pairs} onClose={() => setShowHistory(false)} />}
    </div>
  );
};

export default GameContainer;
