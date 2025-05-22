// Messages
export type MessageSender = "user" | "ai";

export type Message = {
  sender: MessageSender;
  text: string;
};

export type MessageListProps = {
  messages: Message[];
};

//Difficulty
export type Difficulty = 1 | 2 | 3 | 4 | null;
export type DifficultySelectorProps = {
  difficulty: Difficulty;
  setDifficulty: (level: Difficulty) => void;
  startGame: () => void;
};

//Game Contianer
export type GameContainerProps = {
  score: number;
  question: string;
  curAnswerCost: number;
  onQuestionChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  setQuestion: (question: string) => void;
  onSend: () => void;
  onCheckCost: () => void;
  onGiveUp: () => void;
  messages: { sender: string; text: string }[];
};
