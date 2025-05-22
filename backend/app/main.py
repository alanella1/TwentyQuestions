import uuid

from openai import OpenAI
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
import os
from dotenv import load_dotenv
import pandas as pd
import random
from pydantic import BaseModel

# Every time
BASE_DIR = os.path.dirname(__file__)
load_dotenv()

# FAST API
APP = FastAPI()

# noinspection PyTypeChecker
APP.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

openai_key = os.getenv("OPENAI_API_KEY")
CLIENT = OpenAI(api_key=openai_key)


def load_model_instructions():
    prompt_path = os.path.join(BASE_DIR, 'model_instructions.txt')
    with open(prompt_path, 'r') as f:
        return f.read()


MODEL_INSTRUCTIONS = load_model_instructions()

# De Facto Database for now
SESSIONS = {}


class Answer(BaseModel):
    """
    Class for the model to respond with

    response - string of the actual response to the question or chat
    cost - cost of the information given for the score
    """
    response: str
    cost: int


def format_question(question: str) -> dict:
    """
    Turn a question into a format for model history
    :param question: string question from a user
    :return: chat object for a model
    """
    return {'role': 'user', 'content': question}


def call_chat_completion(history):
    """
    Wrapper to call chat completion
    :param history: History of chat, most recent should be input from the user
    :return: response from the model
    """
    response = CLIENT.responses.parse(
        model="gpt-4.1",
        instructions=MODEL_INSTRUCTIONS,
        input=history,
        text_format=Answer,
    )
    return response


def init_session(session_id, player, difficulty):
    history = [{'role': 'developer', 'content': 'The answer player for this iteration of the game is: ' + str(player)}]
    SESSIONS[session_id] = {}
    SESSIONS[session_id]['history'] = history
    SESSIONS[session_id]['player'] = player
    SESSIONS[session_id]['difficulty'] = difficulty
    SESSIONS[session_id]['total_score'] = 0


def get_player(difficulty):
    """
    Get a random play corresponding to the difficulty pool
    :param difficulty: 1,2,3,4 - easy->hard
    :return: name of the player
    """
    if difficulty not in [1, 2, 3, 4]:
        raise ValueError('Invalid Difficulty')

    name = f'level_{difficulty}'

    full_path = os.path.join(BASE_DIR, 'players', name + '.csv')
    df = pd.read_csv(full_path)
    names = df['full_name'].to_list()
    return random.choice(names)


@APP.post("/start")
async def start_game(request: Request):
    """
    Start a new game
    :param request: contains the difficulty level
    :return: session_id
    """
    session_id = str(uuid.uuid4())
    body = await request.json()

    difficulty = int(body.get("difficulty"))
    player = get_player(difficulty)

    init_session(session_id, player, difficulty)

    return {"session_id": session_id, "answer": "nice try", "message": "Game started."}


@APP.post("/ask")
async def ask_question(request: Request):
    """
    Ask a question
    :param request: Contains session_id and the user's question
    :return: the response from the model (answer,cost)
    """
    body = await request.json()
    session_id = body.get("session_id")
    question = body.get("question")

    if session_id not in SESSIONS:
        return {"error": "Invalid Session ID"}

    history = SESSIONS[session_id]['history']
    history.append(format_question(question))

    response = call_chat_completion(history)
    response_str = response.output_text
    response_obj = response.output_parsed

    answer = response_obj.response
    cost = response_obj.cost
    SESSIONS[session_id]['total_score'] += cost

    history.append({'role': 'assistant', 'content': response_str})
    return {"answer": answer, "cost": cost}


def play_cli():
    difficulty = input("Enter difficulty: ")
    player = get_player(int(difficulty))
    history = [{'role': 'developer', 'content': 'The answer player for this iteration of the game is: ' + str(player)}]
    done = False
    total_score = 0
    while not done:
        question = input("Enter question: ")
        history.append(format_question(question))
        response = call_chat_completion(history)
        response_str = response.output_text
        response_obj = response.output_parsed
        answer = response_obj.response
        if answer == "<CORRECT>":
            done = True
            break
        elif answer == "<BAD_QUESTION>":
            print("Bad question, try again")
        elif answer == "<UNKNOWN>":
            print("Sorry, I don't know the answer")
        else:
            print(answer)
            cost = response_obj.cost
            total_score += cost
            print("Total Score: " + str(total_score))
            history.append({'role': 'assistant', 'content': response_str})

    print("You Win! Total Score: " + str(total_score))


if __name__ == "__main__":
    play_cli()
