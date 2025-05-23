import React from "react";
import "../styles/GameContainer.css";
import "../styles/App.css";
import "./HistoryModal";
import HistoryModal from "./HistoryModal";
import { GameContainerProps, QAPair } from "../types";
import GameWonBox from "./GameWonBox";

const GameContainer: React.FC<GameContainerProps> = ({
  onSend,
  onCheckCost,
  onGiveUp,
  addViewedPair,
  score,
  pairs,
}) => {
  const [curGenieAnswer, setCurGenieAnswer] = React.useState("");
  const [showHistory, setShowHistory] = React.useState(false);
  const [displayQuestion, setDisplayQusetion] = React.useState("");
  const [question, setQuestion] = React.useState("");
  const [curAnswerCost, setCurAnswerCost] = React.useState(0);
  const [gameWon, setGameWon] = React.useState(false);
  const [correctAnswer, setCorrectAnswer] = React.useState("");
  const [isCheckingCost, setIsCheckingCost] = React.useState(false);

  const handleRevealAnswer = () => {
    const curPair: QAPair = {
      question: displayQuestion,
      answer: curGenieAnswer,
      cost: curAnswerCost,
    };
    addViewedPair(curPair);
    setIsCheckingCost(false);
    setCurGenieAnswer(curGenieAnswer);
    setCurAnswerCost(curAnswerCost);
  };

  const handleCheckCost = async () => {
    if (question.trim() === "") return;
    setQuestion("");
    setDisplayQusetion(question);
    setCurGenieAnswer("");
    setCurAnswerCost(0);
    const pair: QAPair = await onCheckCost(question);
    if (pair) {
      setCurAnswerCost(pair.cost);
      setCurGenieAnswer(pair.answer);
      setDisplayQusetion(question);
      setQuestion("");
      setIsCheckingCost(true);
    }
  };
  const checkGameWon = (pair: QAPair, player: string) => {
    if (pair.answer === "<CORRECT>") {
      setGameWon(true);
      setCorrectAnswer(player);
      return true;
    }
    return false;
  };

  const handleSendQuestion = async () => {
    if (question.trim()) {
      let this_question = question.trim();
      setQuestion("");
      setDisplayQusetion(question);
      setCurGenieAnswer("");
      setCurAnswerCost(0);
      const { pair, player } = await onSend(this_question);
      if (pair) {
        if (!checkGameWon(pair, player)) {
          setCurGenieAnswer(pair.answer);
          setCurAnswerCost(pair.cost);
        }
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
      {gameWon ? (
        <GameWonBox correctAnswer={correctAnswer} score={score} onMainMenu={() => onGiveUp()} />
      ) : (
        <div className="genie-box">
          <div className="question-cost-row">
            <div className="cur-question-display">
              <strong>Question: </strong>
              {displayQuestion}
            </div>
            <div className="cost-display">Cost: {curAnswerCost}</div>
          </div>

          <div className="genie-answer">{isCheckingCost ? "" : curGenieAnswer}</div>
          <div className="user-question">
            <input
              className="question-input"
              type="text"
              placeholder="Ask a question..."
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  handleSendQuestion();
                }
              }}
            />
            {question && (
              <span className="clear-input" onClick={() => setQuestion("")}>
                x
              </span>
            )}
          </div>
        </div>
      )}

      <div className="action-buttons">
        <button className="btn-primary send-button" onClick={handleSendQuestion}>
          Send
        </button>
        {!isCheckingCost ? (
          <button className="btn-primary check-cost-button" onClick={handleCheckCost}>
            Check Cost
          </button>
        ) : (
          <button className="btn-primary reveal-button" onClick={handleRevealAnswer}>
            Reveal Answer
          </button>
        )}
      </div>
      {showHistory && <HistoryModal pairs={pairs} onClose={() => setShowHistory(false)} />}
    </div>
  );
};

export default GameContainer;
