import React, {useState} from 'react';
import './App.css';


function App() {
  const [difficulty, setDifficulty] = useState<number | null>(null);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [question, setQuestion] = useState('');
  const [messages, setMessages] = useState<{ sender: 'user' | 'ai'; text: string }[]>([]);

  const startGame = async () => {
    if (difficulty == null) return;
    const res = await fetch('http://localhost:8000/start', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ difficulty }),
    });
    const data = await res.json();
    setSessionId(data.session_id);
    setMessages([]);
  };

  const sendQuestion = async () => {
    if (!sessionId || !question.trim()) return;
    const res = await fetch('http://localhost:8000/ask', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ session_id: sessionId, question }),
    });
    const data = await res.json();
    setMessages(prev => [...prev, { sender: 'user', text: question }, { sender: 'ai', text: data.answer }]);
    setQuestion('');
  };

  return (
    <div className="min-h-screen bg-gray-100 p-4 flex flex-col items-center">
      <h1 className="text-2xl font-bold mb-4">Twenty Questions: NBA Genie</h1>

      <div className="flex space-x-2 mb-4">
        {[1, 2, 3, 4, 5].map(level => (
          <button
            key={level}
            className={`px-4 py-2 rounded ${difficulty === level ? 'bg-blue-500 text-white' : 'bg-gray-300'}`}
            onClick={() => setDifficulty(level)}
          >
            {level}
          </button>
        ))}
        <button onClick={startGame} className="px-4 py-2 bg-green-500 text-white rounded">
          Start
        </button>
      </div>

      <div className="w-full max-w-md bg-white rounded shadow p-4 mb-4 h-96 overflow-y-auto">
        {messages.map((msg, idx) => (
          <div key={idx} className={`text-left mb-2 ${msg.sender === 'user' ? 'text-blue-700' : 'text-green-700'}`}>
            <span className="block"><strong>{msg.sender === 'user' ? 'You' : 'Genie'}:</strong> {msg.text}</span>
          </div>
        ))}
      </div>

      <div className="flex w-full max-w-md">
        <input
          type="text"
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          className="flex-grow px-4 py-2 rounded-l border border-gray-300"
          placeholder="Ask a yes/no question..."
        />
        <button
          onClick={sendQuestion}
          className="px-4 py-2 bg-blue-500 text-white rounded-r"
        >
          Send
        </button>
      </div>
    </div>
  );
}

export default App;
