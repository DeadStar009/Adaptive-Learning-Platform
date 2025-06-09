import json

def generate_quiz_prompt(topic):
    return f"""You are an expert DSA instructor.

Generate a 10-question diagnostic quiz on the topic: "{topic}".
Rules:
- 3 easy, 4 medium, 3 hard MCQs
- Cover a wide range of sub-concepts
- Use clear, concise questions and 4 options (A–D)
- Each must include: question, options, correct answer (A/B/C/D), difficulty, and concept
- IMPORTANT: Format options as "A) Option text", "B) Option text", etc.
- The answer should be just the letter (A/B/C/D)

Return output in *pure* JSON format (no explanation, no markdown), like:
[
  {{
    "question": "Which is a classic Divide and Conquer algorithm for searching in sorted arrays?",
    "options": [
      "A) Linear Search",
      "B) Binary Search",
      "C) Jump Search",
      "D) Interpolation Search"
    ],
    "answer": "B",
    "difficulty": "medium",
    "concept": "Binary Search"
  }},
  ...
]

IMPORTANT FORMATTING RULES:
1. Options MUST be formatted as "Letter) Option text" (e.g., "A) Option text")
2. The answer field should contain ONLY the letter (A/B/C/D)
3. Use double quotes for all strings
4. No trailing commas
5. No markdown formatting
6. No additional text or explanations
"""

def generate_analysis_prompt(questions, answers):
    qa_pairs = json.dumps([
        {
            "question": q["question"],
            "concept": q["concept"],
            "correct": q["answer"],
            "user": a
        }
        for q, a in zip(questions, answers)
    ], indent=2)

    return f"""
You're an AI mentor evaluating a student's quiz answers.

Each entry below includes:
- The quiz question
- The concept it tests
- The correct answer
- The student's submitted answer

Identify which concepts the student struggled with (wrong answers only).
Return a *deduplicated* JSON list of weak concepts, no markdown, no explanation.

Example format: ["Binary Search", "Dynamic Programming"]
Quiz Attempts:
{qa_pairs}
"""

def generate_learning_path_prompt(weak_concepts, all_concepts):
    weak_concept_list = ', '.join(weak_concepts)
    all_concept_list = ', '.join(all_concepts)
    return f"""
You are an expert tutor creating a comprehensive learning path for DSA.

The student needs to learn these concepts: {all_concept_list}
They particularly struggled with these concepts: {weak_concept_list}

Create a learning path that:
1. Covers ALL concepts in a logical progression
2. Gives extra attention and practice to weak concepts
3. Shows how concepts relate to each other
4. Includes both theory and practical exercises

For each concept, provide:
1. A brief 2-3 line explanation (teaching tip, not just definition)
2. A high-quality online resource (GFG, YouTube, docs)
3. Practice exercises or problems to solve
4. For weak concepts, add extra practice problems

IMPORTANT: Return ONLY a valid JSON array with no additional text, markdown, or explanations.
Each object in the array must follow this exact format:

[
  {{
    "concept": "string",
    "explanation": "string",
    "resource": "string (URL)",
    "practice_problems": ["string", "string"],
    "is_weak_concept": boolean,
    "related_concepts": ["string", "string"]
  }}
]

Rules:
1. Use double quotes for all strings
2. Use true/false (not "true"/"false") for boolean values
3. Ensure all arrays and objects are properly closed
4. No trailing commas
5. No comments or explanations
6. No markdown formatting

Example of a single object:
{{
  "concept": "Dynamic Programming",
  "explanation": "A method for solving complex problems by breaking them down into simpler subproblems",
  "resource": "https://www.geeksforgeeks.org/dynamic-programming/",
  "practice_problems": ["Fibonacci Numbers", "Longest Common Subsequence"],
  "is_weak_concept": true,
  "related_concepts": ["Recursion", "Memoization"]
}}

Order the concepts in a way that builds understanding progressively.
For weak concepts, include more practice problems and detailed explanations.
"""

def generate_final_quiz_prompt(topic, weak_concepts, initial_weak_concepts):
    return f"""
    Generate a final assessment quiz for the topic "{topic}" that focuses on reinforcement learning and measuring improvement.
    
    The student previously struggled with these concepts: {initial_weak_concepts}
    They have been working on improving these areas: {weak_concepts}
    
    Create a quiz that:
    1. Primarily tests the previously weak concepts to measure improvement
    2. Includes some new, related concepts to assess broader understanding
    3. Has questions of varying difficulty levels
    4. Focuses on practical application rather than just theory
    
    Format the response as a JSON object with this structure:
    {{
        "title": "Final Assessment Quiz - [Topic]",
        "description": "This quiz measures your improvement and understanding after the learning path",
        "questions": [
            {{
                "id": 1,
                "question": "Question text",
                "options": ["A", "B", "C", "D"],
                "correct_answer": "Correct option",
                "explanation": "Detailed explanation of the correct answer",
                "concept_tested": "Specific concept being tested",
                "difficulty": "easy/medium/hard",
                "is_reinforcement": true/false  // Whether this question tests a previously weak concept
            }}
        ]
    }}
    
    Include at least 5 questions, with at least 3 focusing on previously weak concepts.
    Make sure the questions are challenging but fair, and provide clear explanations.
    """
