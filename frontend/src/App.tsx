import "./styles/App.css";
import DifficultySelector from "./components/DifficultySelector";
import { useState } from "react";
import { Difficulty, Message } from "./types";
import GameContainer from "./components/GameContainer";

function App() {
  const [difficulty, setDifficulty] = useState<Difficulty>(null);
  const [totalScore, setTotalScore] = useState<number>(0);
  const [curAnswerCost, setCurAnswerCost] = useState<number>(0);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [question, setQuestion] = useState<string>("");
  const [messages, setMessages] = useState<Message[]>([]);
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

  const sendQuestion = async () => {
    if (!sessionId || !question.trim()) return;

    setMessages((prev) => [...prev, { sender: "user", text: question }]); // Add user message immediately

    const res = await fetch("http://localhost:8000/ask", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ session_id: sessionId, question }),
    });
    const data = await res.json();

    setMessages((prev) => [...prev, { sender: "ai", text: data.answer }]); // Add genie's response
    setCurAnswerCost(data.cost); // Update current answer cost
    setTotalScore((prev) => prev + data.cost); // update score
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
          score={totalScore}
          question={question}
          curAnswerCost={curAnswerCost}
          setQuestion={setQuestion}
          onQuestionChange={(e) => setQuestion(e.target.value)}
          onSend={sendQuestion}
          onCheckCost={() => alert(`Current cost: ${totalScore}`)}
          onGiveUp={() => {
            setGameStarted(false);
            setSessionId(null);
            setTotalScore(0);
            setMessages([]);
          }}
          messages={messages}
        />
      )}
    </div>
  );
}

export default App;
