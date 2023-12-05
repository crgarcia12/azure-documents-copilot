#!/usr/bin/env python
import os

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from dotenv import load_dotenv
from openai import AzureOpenAI
load_dotenv() 

### Chain definition

templateAnswer = """You are a helpful assistant for lawyers, talking lawyer language.
A lawyer will receive an email, and you to create an answer for that email.
Always point to the law and the facts.
"""

templateDetectIntention = """You are a helpful assistant for lawyers, talking lawyer language."""

message_text = [
    {"role":"system","content":"""
You are an intention detection bot. 
you will receive emails and need to detect the intention from the table bellow:
1.contract_status: get information on the status of a contract.
2.contract_sign: get a contract signed.
3.not_supported: any other intention
Reply just with a json on the format: {"intention":"<the-intention>"}."""}]


human_template = "This is the email content: {email_content}"

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

@app.get("/api/email_intention")
async def count_characters(body: str):
    character_count = len(body)
    print("Called with email <{character_count}>: {body}")
    
    msg = message_text.copy()
    msg.append({"role":"user","content":human_template.format(email_content=body)})
    
    client = AzureOpenAI(
        azure_deployment=os.getenv("AZURE_OPENAI_DEPLOYMENT"), 
        api_key=os.getenv("AZURE_OPENAI_KEY"),  
        # 2023-10-01-preview
        api_version=os.getenv("AZURE_OPENAI_API_VERSION"),
        azure_endpoint = os.getenv("AZURE_OPENAI_ENDPOINT")
    )

    response = client.chat.completions.create(
        model=os.getenv("AZURE_OPENAI_MODEL_NAME"),
        messages=msg, 
        max_tokens=500
    )
    print(response.choices[0].message.content)
    return response.choices[0].message.content


@app.get("/api/healthz")
async def health_probe():
    return {"status": "healthy"}

@app.post("/api/chat_message")
async def chat_message(message: str):
     print("Called chat_message {message}")


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="localhost", port=8000)