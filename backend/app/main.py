import uuid

from openai import OpenAI
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
import os
from dotenv import load_dotenv
import pandas as pd
import random
from pydantic import BaseModel

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

TOP_INSTRUCTIONS = """
You are a genie in charge of running a game of twenty questions.

This game of twenty questions is specific to NBA players past and present. You will receive the name of a player in a subsequent developer message.
The user will then start a dialog with you. The user's goal is to figure out who the player is in as little "cost" as possible. They will come to you
with questions and you are to answer them truthfully and to your best knowledge. This will be a back and forth dialog until they guess the mystery
player correctly.

# 1. User input
User input (questions) should be solely related to the game at hand. They will certainly be using pronouns referring to the player and previous
answers, so make sure you understand what is being referred to in their question. 

# 2. Your output
Your output should ALWAYS be in the following JSON Format

{
    "response": "string",
    "cost" : "number"
}

## - "response"
If the user asks a direct question, it should be the direct answer. If the user asks a direct question, your response must match the format and 
scope of the question. The response must be as concise and literal as possible, without offering any additional context or phrasing not directly 
requested.
 
If there is ambiguity in the question the user asked,feel free to ask them to specify what they are asking. But, make sure that when you ask for 
clarification you don't let any information leak about the player. 
 
You may answer open-ended factual questions (e.g., "what teams did he play for?", "what position did he play?", "what college did he go to?") so 
long as they do not directly reveal the identity of the player.

These questions may have a higher cost depending on how much information they reveal. For example, listing 4 teams might have a cost of 16 (if 
each team would have required multiple yes/no checks).

 If you don't know the answer to their question the response should be <UNKNOWN>. 
 
 If the user's question is unrelated to the game, the response should be <BAD_QUESTION>. 
 
 Your tone with the user should be agnostic to how long they are taking to figure the answer out and how frustrated they seem to be getting. 
 
 UNDER NO CIRCUMSTANCES should the response contain the name of the player the user is trying to guess. 
 
 If the question was "is it x_player?" and they are correct. In that case the response should be <CORRECT>. 

## - "cost"
Along with responding to a user's question directly, you are to also designate the "cost" of that answer. The baseline to use is that a simple yes/no
or binary answer has a cost of 1. If it is a more open ended question, try to estimate how many binary questions they would have needed to ask to 
get to that answer and that is the cost. If there is no way to estimate how many binary questions could lead to that answer, then determine how
valuable that answer is relative to a cost you can estimate and that is the cost. If your response is not an answer, be it a follow up or
clarification, then you can simply put 0 as the cost. Cost should always be an integer. 

# 3. Examples
## a.) Player - doesn't matter
### Question: How old is he? 
### response: "xx years old"
### cost: 4 
### what to generalize: Only respond in the scope of the question, response sho uld not contain any other information. Cost is 4 due to multiple
"is he older than xx" or "is he younger than" questions required to get that same information
"""


class Answer(BaseModel):
    response: str
    cost: int


def format_question(question: str) -> dict:
    return {'role': 'user', 'content': question}


def call_chat_completion(history):
    response = client.responses.parse(
        model="gpt-4.1",
        instructions=TOP_INSTRUCTIONS,
        input=history,
        text_format=Answer,
    )
    return response


def get_player(difficulty):
    if difficulty == 1:
        name = 'level_1'
    elif difficulty == 2:
        name = 'level_2'
    elif difficulty == 3:
        name = 'level_3'
    elif difficulty == 4:
        name = 'level_4'
    else:
        raise Exception('Invalid difficulty')

    base_dir = os.path.dirname(__file__)
    full_path = os.path.join(base_dir, 'players', name + '.csv')
    df = pd.read_csv(full_path)
    names = df['full_name'].to_list()
    return random.choice(names)


@app.post("/start")
async def start_game(request: Request):
    body = await request.json()
    difficulty = int(body.get("difficulty"))
    session_id = str(uuid.uuid4())
    player = get_player(difficulty)
    history = [{'role': 'developer', 'content': 'The answer player for this iteration of the game is: ' + str(player)}]
    sessions[session_id] = {}
    sessions[session_id]['history'] = history
    sessions[session_id]['player'] = player
    sessions[session_id]['difficulty'] = difficulty
    sessions[session_id]['total_score'] = 0
    return {"session_id": session_id, "answer": "nice try", "message": "Game started."}


@app.post("/ask")
async def ask_question(request: Request):
    body = await request.json()
    session_id = body.get("session_id")
    question = body.get("question")

    if session_id not in sessions:
        return {"error": "Invalid Session ID"}

    history = sessions[session_id]['history']
    history.append(format_question(question))
    response = call_chat_completion(history)
    response_str = response.output_text
    response_obj = response.output_parsed

    answer = response_obj.response
    cost = response_obj.cost
    sessions[session_id]['total_score'] += cost

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
