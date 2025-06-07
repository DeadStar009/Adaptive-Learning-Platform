from openrouter import call_openrouter
from prompts import generate_quiz_prompt, generate_analysis_prompt, generate_learning_path_prompt
import json

def test_quiz_generation():
    print("\n=== Testing Quiz Generation ===")
    topic = "Binary Search"
    prompt = generate_quiz_prompt(topic)
    print(f"\nPrompt being sent to LangChain:\n{prompt}")
    
    result = call_openrouter(prompt)
    print("\nResponse from LangChain:")
    print(json.dumps(result, indent=2))

def test_quiz_analysis():
    print("\n=== Testing Quiz Analysis ===")
    # Sample quiz and answers
    questions = [
        {
            "question": "What is the time complexity of binary search?",
            "concept": "Time Complexity",
            "answer": "A"
        }
    ]
    answers = ["B"]  # Wrong answer
    
    prompt = generate_analysis_prompt(questions, answers)
    print(f"\nPrompt being sent to LangChain:\n{prompt}")
    
    result = call_openrouter(prompt)
    print("\nResponse from LangChain:")
    print(json.dumps(result, indent=2))

def test_learning_path():
    print("\n=== Testing Learning Path Generation ===")
    weak_concepts = ["Binary Search", "Time Complexity"]
    prompt = generate_learning_path_prompt(weak_concepts)
    print(f"\nPrompt being sent to LangChain:\n{prompt}")
    
    result = call_openrouter(prompt)
    print("\nResponse from LangChain:")
    print(json.dumps(result, indent=2))

if __name__ == "__main__":
    print("Starting LangChain Integration Tests...")
    test_quiz_generation()
    test_quiz_analysis()
    test_learning_path() 