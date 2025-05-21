import React, { useState } from "react";
import "./App.css";
import MessageList from "./components/MessageList";
function App() {
  const [difficulty, setDifficulty] = useState<number | null>(null);
  const [score, setScore] = useState<number>(0);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [question, setQuestion] = useState("");
  const [messages, setMessages] = useState<{ sender: "user" | "ai"; text: string }[]>([]);

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
  };

  const sendQuestion = async () => {
    if (!sessionId || !question.trim()) return;
    const res = await fetch("http://localhost:8000/ask", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ session_id: sessionId, question }),
    });
    const data = await res.json();
    setMessages((prev) => [
      ...prev,
      { sender: "user", text: question },
      { sender: "ai", text: data.answer },
    ]);
    setScore((prev) => prev + data.cost);
    setQuestion("");
  };

  return (
    <div className="container">
      <h1 className="top-title">Twenty Questions: NBA Genie</h1>
      <h2 className="scoreboard">Score: {score}</h2>
      <div className="difficulty-container">
        {[1, 2, 3, 4, 5].map((level) => (
          <button key={level} className={"difficulty-button"} onClick={() => setDifficulty(level)}>
            {level}
          </button>
        ))}
        <button onClick={startGame} className="start-button">
          Start
        </button>
      </div>

      <MessageList messages={messages} />

      <div className="message-input-container">
        <input
          type="text"
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          className="message-input"
          placeholder="Ask a yes/no question..."
        />
        <button onClick={sendQuestion} className="send-button">
          Send
        </button>
      </div>
    </div>
  );
}

export default App;
