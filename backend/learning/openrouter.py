import requests
from dotenv import load_dotenv
import os
import json
from langchain_core.messages import SystemMessage, HumanMessage
from langchain_core.prompts import ChatPromptTemplate
import logging
from langsmith import Client
from langchain.callbacks.tracers import LangChainTracer
from langchain.callbacks.manager import CallbackManager
from langchain.callbacks.tracers.langchain import LangChainTracer
from langchain.callbacks.tracers.run_collector import RunCollectorCallbackHandler
import time
import uuid
from datetime import datetime, timezone

# Set up logging
logging.basicConfig(level=logging.DEBUG)
logger = logging.getLogger(__name__)

load_dotenv()

# Print environment variables for debugging
logger.debug(f"LANGCHAIN_API_KEY exists: {bool(os.getenv('LANGCHAIN_API_KEY'))}")
logger.debug(f"LANGCHAIN_PROJECT: {os.getenv('LANGCHAIN_PROJECT')}")
logger.debug(f"LANGCHAIN_ENDPOINT: {os.getenv('LANGCHAIN_ENDPOINT')}")

# Initialize LangSmith client
try:
    client = Client()
    logger.debug("Successfully initialized LangSmith client")
except Exception as e:
    logger.error(f"Failed to initialize LangSmith client: {str(e)}")

def call_openrouter(prompt, model="deepseek/deepseek-r1-0528-qwen3-8b:free"):
    """
    Original implementation of OpenRouter call with LangSmith integration.
    """
    logger.debug("Starting LangChain prompt processing...")
    
    headers = {
        "Authorization": f"Bearer {os.getenv('OPENROUTER_API_KEY')}",
        "HTTP-Referer": "http://localhost:8000",
        "X-Title": "SALS Assistant"
    }
    
    # Use LangChain for prompt processing while keeping the original API call
    system_template = "You're a learning assistant for DSA/DAA topics."
    logger.debug(f"System template: {system_template}")
    
    # Set up LangSmith tracing
    try:
        run_collector = RunCollectorCallbackHandler()
        tracer = LangChainTracer(
            project_name="adaptive-learning-platform"
        )
        callback_manager = CallbackManager([tracer, run_collector])
        logger.debug("Successfully set up LangSmith tracing")
    except Exception as e:
        logger.error(f"Failed to set up LangSmith tracing: {str(e)}")
    
    chat_prompt = ChatPromptTemplate.from_messages([
        ("system", system_template),
        ("user", "{input}")
    ])
    logger.debug("Created ChatPromptTemplate")
    
    # Process the prompt using LangChain's template system
    formatted_messages = chat_prompt.format_messages(input=prompt)
    logger.debug(f"Formatted messages: {formatted_messages}")
    
    # Convert to OpenRouter format
    messages = [
        {"role": "system", "content": system_template},
        {"role": "user", "content": prompt}
    ]
    logger.debug(f"Final messages for API: {json.dumps(messages, indent=2)}")
    
    data = {
        "model": model,
        "messages": messages
    }
    
    try:
        logger.debug("Making API call to OpenRouter...")
        
        # Make the OpenRouter API call first
        res = requests.post("https://openrouter.ai/api/v1/chat/completions", 
                          json=data, headers=headers)
        response = res.json()
        
        # Create a run in LangSmith after successful API call
        try:
            logger.debug("Attempting to create LangSmith run...")
            
            # Create run with more detailed information
            current_time = datetime.now(timezone.utc)
            run_data = {
                "name": "openrouter_call",
                "run_type": "chain",
                "inputs": {
                    "prompt": prompt,
                    "model": model,
                    "system_template": system_template,
                    "messages": messages
                },
                "project_name": "adaptive-learning-platform",
                "start_time": current_time,
                "metadata": {
                    "model": model,
                    "api": "openrouter"
                }
            }
            try:
                logger.debug("Run data:\n" + json.dumps(run_data, indent=2, default=str))
            except Exception as e:
                logger.warning(f"Failed to log run_data: {e}")

            try:
                run = client.create_run(**run_data)
                logger.debug(f"LangSmith create_run response: {run}")
                
                # Handle the case where run is None or not a proper run object
                if run is None:
                    logger.warning("LangSmith create_run returned None - this might be expected for async operations")
                    # Create a temporary run ID for tracking
                    run_id = str(uuid.uuid4())
                else:
                    run_id = getattr(run, 'id', str(uuid.uuid4()))
                
                # Update the run with the response
                end_time = datetime.now(timezone.utc)
                client.update_run(
                    run_id=run_id,
                    outputs={
                        "response": response,
                        "completion_id": response.get('id', ''),
                        "model": response.get('model', ''),
                        "provider": response.get('provider', '')
                    },
                    end_time=end_time
                )
                logger.debug(f"Successfully updated LangSmith run with response")
                
            except Exception as langsmith_error:
                logger.warning(f"LangSmith operation failed: {str(langsmith_error)}")
                logger.debug(f"API Response: {json.dumps(response, indent=2)}")
                # Continue with the API response even if LangSmith logging fails
        
        except Exception as langsmith_error:
            logger.warning(f"LangSmith logging failed: {str(langsmith_error)}")
            # Continue even if LangSmith logging fails
        
        logger.debug(f"API Response: {json.dumps(response, indent=2)}")
        return response
        
    except Exception as e:
        logger.error(f"Error in API call: {str(e)}")
        # Try to log the error to LangSmith if possible
        try:
            if 'run' in locals() and run and hasattr(run, 'id'):
                client.update_run(
                    run_id=run.id,
                    error=str(e),
                    end_time=datetime.now(timezone.utc)
                )
        except Exception as langsmith_error:
            logger.warning(f"Failed to log error to LangSmith: {str(langsmith_error)}")
            
        return {"error": f"Failed to parse JSON response: {str(e)}", "text": str(e)}
