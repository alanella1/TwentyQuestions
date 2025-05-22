import React from "react";
import { Difficulty, DifficultySelectorProps } from "../types";
import "../styles/DifficultySelector.css";

const DifficultySelector: React.FC<DifficultySelectorProps> = ({
  difficulty,
  setDifficulty,
  startGame,
}) => {
  return (
    <div className="difficulty-container">
      <h2>Select Level</h2>
      <div className="radio-group">
        {[1, 2, 3, 4].map((level) => (
          <label key={level} className={`radio-option ${difficulty === level ? "selected" : ""}`}>
            <input
              type="radio"
              value={level}
              checked={difficulty === level}
              onChange={() => setDifficulty(level as Difficulty)}
            />
            Level {level}
          </label>
        ))}
      </div>

      <button onClick={startGame} className="start-button">
        Start
      </button>
    </div>
  );
};

export default DifficultySelector;
