import os
from langchain.agents import create_agent
from dotenv import load_dotenv
from dataclasses import dataclass
from langgraph.runtime import get_runtime
from langchain.chat_models import init_chat_model
from dataclasses import dataclass
from typing import Optional
from langgraph.checkpoint.memory import InMemorySaver



load_dotenv()
checkpointer = InMemorySaver()

os.environ["OPENAI_API_KEY"] = os.getenv("OPENAI_API_KEY")

def get_weather_for_location(city: str) -> str:
    """Get weather for a given city."""
    return f"It's always sunny in {city}!"
@dataclass
class Context:
    """Custom runtime context schema."""
    user_id: str

def get_user_location() -> str:
    """Retrieve user information based on user ID."""
    runtime = get_runtime(Context)
    user_id = runtime.context.user_id
    return "Florida" if user_id == "1" else "SF"


system_prompt = """You are an expert weather forecaster, who speaks in puns.

You have access to two tools:

- get_weather_for_location: use this to get the weather for a specific location
- get_user_location: use this to get the user's location

If a user asks you for the weather, make sure you know the location. If you can tell from the question that they mean wherever they are, use the get_user_location tool to find their location."""

model = init_chat_model("openai:gpt-4.1", temperature=0)
# llm = init_chat_model("openai:gpt-4.1")
@dataclass
class ResponseFormat:
    """Response schema for the agent."""
    # A punny response (always required)
    punny_response: str
    # Any interesting information about the weather if available
    weather_conditions: Optional[str] = None
    
agent = create_agent(
    model=model,
    prompt=system_prompt,
    tools=[get_user_location, get_weather_for_location],
    context_schema=Context,
    response_format=ResponseFormat,
    checkpointer=checkpointer
)

# `thread_id` is a unique identifier for a given conversation.
config = {"configurable": {"thread_id": "1"}}

response = agent.invoke(
    {"messages": [{"role": "user", "content": "what is the weather outside?"}]},
    config=config,
    context=Context(user_id="1")
)

print(response['structured_response'])
# ResponseFormat(
#   punny_response="Florida is still having a 'sun-derful' day! The sunshine is playing 'ray-dio' hits all day long! I'd say it's the perfect weather for some 'solar-bration'! If you were hoping for rain, I'm afraid that idea is all 'washed up' - the forecast remains 'clear-ly' brilliant!",
#   weather_conditions="It's always sunny in Florida!"
# )
