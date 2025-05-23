import "./styles/App.css";
import DifficultySelector from "./components/DifficultySelector";
import { useState } from "react";
import { Difficulty, Message, QAPair } from "./types";
import GameContainer from "./components/GameContainer";

function App() {
  const [difficulty, setDifficulty] = useState<Difficulty>(null);
  const [totalScore, setTotalScore] = useState<number>(0);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [qaPairs, setQAPairs] = useState<QAPair[]>([]);
  const [gameStarted, setGameStarted] = useState<boolean>(false);

  // Function to start the game
  const startGame = async () => {
    if (difficulty == null) return;

    const res = await fetch("http://localhost:8000/start", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ difficulty }),
    });
    const data = await res.json();

    setSessionId(data.session_id);
    setMessages([]);
    setGameStarted(true);
  };

  const resetGame = () => {
    setGameStarted(false);
    setSessionId(null);
    setTotalScore(0);
    setMessages([]);
    setQAPairs([]);
    setDifficulty(null);
  };

  const addViewedPair = (pair: QAPair) => {
    setMessages((prev) => [
      ...prev,
      { sender: "user", text: pair.question },
      { sender: "ai", text: pair.answer },
    ]);
    setQAPairs((prev) => [
      ...prev,
      { question: pair.question, answer: pair.answer, cost: pair.cost },
    ]);
    setTotalScore((prev) => prev + pair.cost);
  };

  const sendQuestion = async (question: string) => {
    if (!sessionId || !question.trim()) return;

    const res = await fetch("http://localhost:8000/ask", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ session_id: sessionId, question }),
    });
    const data = await res.json();
    let pair: QAPair = { question, answer: data.answer, cost: data.cost };
    let player: string = data.player;
    addViewedPair(pair);
    return { pair, player };
  };

  const checkCost = async (question: string) => {
    if (!sessionId || !question.trim()) return;

    const res = await fetch("http://localhost:8000/check_cost", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ session_id: sessionId, question }),
    });
    const data = await res.json();
    let pair = { question, answer: data.answer, cost: data.cost };
    return pair as QAPair;
  };

  return (
    <div className="app-wrapper">
      <h1 className="page-title">Twenty Questions: NBA Genie</h1>
      {!gameStarted && (
        <DifficultySelector
          difficulty={difficulty}
          setDifficulty={setDifficulty}
          startGame={startGame}
        />
      )}
      {gameStarted && (
        <GameContainer
          onSend={sendQuestion}
          onCheckCost={checkCost}
          onGiveUp={resetGame}
          score={totalScore}
          pairs={qaPairs}
        />
      )}
    </div>
  );
}

export default App;
