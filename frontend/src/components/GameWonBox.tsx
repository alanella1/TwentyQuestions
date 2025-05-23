import React from "react";
import "../styles/GameWonBox.css";

type GameWonBoxProps = {
  correctAnswer: string;
  score: number;
  onMainMenu: () => void;
};

const GameWonBox: React.FC<GameWonBoxProps> = ({ correctAnswer, score, onMainMenu }) => {
  return (
    <div className="game-won-box">
      <h2 className="won-title">🎉 You Got It! 🎉</h2>
      <div className="won-answer">
        The correct answer was: <strong>{correctAnswer}</strong>
      </div>
      <div className="won-score">
        Your total score: <strong>{score}</strong>
      </div>
      <button className="btn-primary main-menu-button" onClick={onMainMenu}>
        Start Menu
      </button>
    </div>
  );
};

export default GameWonBox;
