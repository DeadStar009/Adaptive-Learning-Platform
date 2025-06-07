import requests
from dotenv import load_dotenv
import os
import json
from langchain_core.messages import SystemMessage, HumanMessage
from langchain_core.prompts import ChatPromptTemplate

load_dotenv()

def call_openrouter(prompt, model="deepseek/deepseek-r1-0528-qwen3-8b:free"):
    """
    Original implementation of OpenRouter call, known to work correctly.
    """
    headers = {
        "Authorization": f"Bearer {os.getenv('OPENROUTER_API_KEY')}",
        "HTTP-Referer": "http://localhost:8000",
        "X-Title": "SALS Assistant"
    }
    
    # Use LangChain for prompt processing while keeping the original API call
    system_template = "You're a learning assistant for DSA/DAA topics."
    chat_prompt = ChatPromptTemplate.from_messages([
        ("system", system_template),
        ("user", "{input}")
    ])
    
    # Process the prompt using LangChain's template system
    formatted_messages = chat_prompt.format_messages(input=prompt)
    
    # Convert to OpenRouter format
    messages = [
        {"role": "system", "content": system_template},
        {"role": "user", "content": prompt}
    ]
    
    data = {
        "model": model,
        "messages": messages
    }
    
    try:
        res = requests.post("https://openrouter.ai/api/v1/chat/completions", 
                           json=data, headers=headers)
        return res.json()
    except Exception as e:
        print(f"Error details: {str(e)}")
        return {"error": f"Failed to parse JSON response: {str(e)}", "text": str(e)}
