// Messages
export type MessageSender = "user" | "ai";

export type Message = {
  sender: MessageSender;
  text: string;
};

export type MessageListProps = {
  messages: Message[];
};

export type QAPair = {
  question: string;
  answer: string;
  cost: number;
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
  onSend: (question: string) => any;
  onCheckCost: (question: string) => any;
  onGiveUp: () => void;
  addViewedPair: (pair: QAPair) => void;
  score: number;
  pairs: QAPair[];
};
