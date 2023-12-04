#!/usr/bin/env python
import os
from typing import List

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from dotenv import load_dotenv
load_dotenv() 

# Langchain
from langchain.prompts import ChatPromptTemplate
from langchain.chat_models import ChatOpenAI, AzureChatOpenAI
from langchain.schema import BaseOutputParser
from langserve import add_routes

# Set Debug
from langchain.globals import set_debug, set_verbose
import langchain
langchain.verbose = True
set_debug(True)
set_verbose(True)


### Chain definition

template = """You are a helpful assistant for lawyers, talking lawyer language.
A lawyer will receive an email, and you to create an answer for that email.
Always point to the law and the facts.
"""

human_template = "This is the email content: {email_content}"

chat_prompt = ChatPromptTemplate.from_messages([
    ("system", template),
    ("human", human_template),
])
answer_email_chain = chat_prompt | AzureChatOpenAI(
    model_name="gpt-4",
    azure_deployment="gpt-4-0613-learning-cae",
    api_version="2023-07-01-preview"
)

# App definition

app = FastAPI(
    title="Legal AI Assistant",
    version="1.0",
    description="A legal AI Assistant",
)

origins = ["*"]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

add_routes(
    app,
    answer_email_chain,
    path="/answer_email",
)

@app.get("/api/email_count")
async def count_characters(body: str):
    character_count = len(body)
    print("Called with email <{character_count}>: {body}")
    return {"character_count": character_count}

@app.get("/api/healthz")
async def health_probe():
    return {"status": "healthy"}

@app.post("/api/chat_message")
async def chat_message(message: str):
    character_count = len(body)
    print("Called with email <{character_count}>: {body}")
    return {"character_count": character_count}

if __name__ == "__main__":
    import uvicorn

    uvicorn.run(app, host="localhost", port=8000)