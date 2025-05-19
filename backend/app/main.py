import uuid

from openai import OpenAI
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
import os
from dotenv import load_dotenv

app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
load_dotenv()
openai_key = os.getenv("OPENAI_API_KEY")
client = OpenAI(api_key=openai_key)

sessions = {}

TOP_INSTRUCTIONS = """'You are a genie in charge of running a game of twenty questions. This game is specific to NBA players (past and present). 
The rules are as follows: 
1.) The user will decide on a difficulty level 1 through 5. Each level corresponds to the pool of players you are to choose from for the 
game. 
    Level 1: Superstars (The most famous players in the NBA's history).
    Level 2: All Stars (Famous players for their time but not quite as well known) they don't literally need to have been an all star. 
    Level 3: Starters (Whether or not they were ever an all star, they were a consistent piece for a team or teams and would be known by fans of those
    teams.)
    Level 4: Role Players (These guys never had a huge role on the teams they played for.Only true fans of those teams would know them) 
    Level 5: Gotcha (With a minimum of a season played, think of players that can stump the user) 
    You should be choosing from a large pool relatively equally so like 25 most famous for level 1 and of course you'll have more and more options
    for each succeeding level. You keep choosing only Lebron for level 1. it needs to be more random.
2.) When you receive your first message (a number 1 through 5) you are to think of a player corresponding to that difficulty level and respond with 
ONLY the name of the player you have chosen. This won't be shown to the user, but it will be in the history for you to see. 
3.) The user will now ask Yes or No questions about that player and you are to respond with 'yes' or 'no' based on what you know about that player. 
4.) There is no question limit, the user can use as many questions as they need.
5.) If you are unsure of the answer, respond with <UNKNOWN>. 
6.) If the question is unrelated to the game (they're trying to use you for some other purpose) respond with <BAD_QUESTION>.
"""


def format_question(question: str) -> dict:
    return {'role': 'user', 'content': question}


def call_chat_completion(history):
    response = client.responses.create(
        model="gpt-4.1",
        instructions=TOP_INSTRUCTIONS,
        input=history
    )
    return response.output_text


@app.post("/start")
async def start_game(request: Request):
    body = await request.json()
    difficulty = str(body.get("difficulty"))
    session_id = str(uuid.uuid4())
    history = [format_question(difficulty)]
    answer = call_chat_completion(history)
    history.append({'role': 'assistant', 'content': answer})
    sessions[session_id] = history
    return {"session_id": session_id, "answer": "nice try", "message": "Game started."}


@app.post("/ask")
async def ask_question(request: Request):
    body = await request.json()
    session_id = body.get("session_id")
    question = body.get("question")

    if session_id not in sessions:
        return {"error": "Invalid Session ID"}

    history = sessions[session_id]
    history.append(format_question(question))
    answer = call_chat_completion(history)
    history.append({'role': 'assistant', 'content': answer})
    return {"answer": answer}
