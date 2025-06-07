import json
import re
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from .openrouter import call_openrouter
from .prompts import generate_quiz_prompt, generate_analysis_prompt, generate_learning_path_prompt, generate_final_quiz_prompt
from .models import Topic, Quiz, UserQuizAttempt, LearningPath, UserProgress

@csrf_exempt
def generate_quiz(request):
    topic_name = request.GET.get("topic", "Graphs")
    topic, _ = Topic.objects.get_or_create(name=topic_name)
    
    prompt = generate_quiz_prompt(topic_name)
    try:
        result = call_openrouter(prompt)
    except Exception as e:
        return JsonResponse({"error": f"API call failed: {str(e)}"}, status=500)

    try:
        quiz_raw = result['choices'][0]['message']['content']
        cleaned = re.sub(r"^```json\n|```$", "", quiz_raw.strip())
        quiz_data = json.loads(cleaned)

        quiz = Quiz.objects.create(
            topic=topic,
            questions=quiz_data
        )

        return JsonResponse({
            "quiz": quiz_data,
            "quiz_id": quiz.id
        }, safe=False)

    except (KeyError, json.JSONDecodeError) as e:
        return JsonResponse({"error": f"Invalid API response or JSON parsing error: {str(e)}", "response": result}, status=500)

@csrf_exempt
def analyze_quiz(request):
    if request.method != "POST":
        return JsonResponse({"error": "Only POST allowed"}, status=405)

    try:
        data = json.loads(request.body)
        quiz_id = data.get("quiz_id")
        user_answers = data.get("user_answers", [])

        # Get the existing quiz
        quiz = Quiz.objects.get(id=quiz_id)
        questions = quiz.questions

        prompt = generate_analysis_prompt(questions, user_answers)
        result = call_openrouter(prompt)
        raw = result['choices'][0]['message']['content']
        weak_concepts = json.loads(raw.strip().replace("```json", "").replace("```", ""))

        # Save the quiz attempt using the existing quiz
        quiz_attempt = UserQuizAttempt.objects.create(
            quiz=quiz,  # Use the existing quiz
            user_answers=user_answers,
            weak_concepts=weak_concepts
        )

        # Create or update progress
        progress, _ = UserProgress.objects.get_or_create(
            topic=quiz.topic,
            defaults={'initial_quiz_attempt': quiz_attempt}
        )

        return JsonResponse({
            "weak_concepts": weak_concepts,
            "quiz_attempt_id": quiz_attempt.id
        })

    except Exception as e:
        return JsonResponse({"error": str(e)})

@csrf_exempt
def learning_path(request):
    if request.method != "POST":
        return JsonResponse({"error": "Only POST allowed"}, status=405)

    try:
        data = json.loads(request.body)
        quiz_attempt_id = data.get("quiz_attempt_id")
        weak_concepts = data.get("weak_concepts", [])

        quiz_attempt = UserQuizAttempt.objects.get(id=quiz_attempt_id)
        
        prompt = generate_learning_path_prompt(weak_concepts)
        result = call_openrouter(prompt)
        raw = result['choices'][0]['message']['content']
        learning_path_data = json.loads(raw.strip().replace("```json", "").replace("```", ""))

        # Save the learning path
        learning_path = LearningPath.objects.create(
            weak_concepts=weak_concepts,
            learning_materials=learning_path_data
        )

        # Update progress
        progress = UserProgress.objects.get(
            topic=quiz_attempt.quiz.topic
        )
        progress.learning_path = learning_path
        progress.save()

        return JsonResponse({
            "learning_path": learning_path_data,
            "learning_path_id": learning_path.id
        })

    except Exception as e:
        return JsonResponse({"error": str(e)})

@csrf_exempt
def final_quiz(request):
    if request.method != "POST":
        return JsonResponse({"error": "Only POST allowed"}, status=405)

    try:
        data = json.loads(request.body)
        topic_name = data.get("topic", "Graphs")
        weak_concepts = data.get("weak_concepts", [])

        topic = Topic.objects.get(name=topic_name)
        
        # Get the initial quiz attempt to compare with
        progress = UserProgress.objects.get(topic=topic)
        initial_attempt = progress.initial_quiz_attempt
        
        # Generate a more focused final quiz
        prompt = generate_final_quiz_prompt(
            topic_name, 
            weak_concepts,
            initial_attempt.weak_concepts if initial_attempt else []
        )
        result = call_openrouter(prompt)

        try:
            raw_quiz = result['choices'][0]['message']['content']
            cleaned = raw_quiz.strip().replace("```json", "").replace("```", "")
            quiz_data = json.loads(cleaned)

            # Save the final quiz
            quiz = Quiz.objects.create(
                topic=topic,
                questions=quiz_data,
                is_final_quiz=True
            )

            return JsonResponse({
                "quiz": quiz_data,
                "quiz_id": quiz.id,
                "initial_weak_concepts": initial_attempt.weak_concepts if initial_attempt else []
            })

        except Exception as inner:
            return JsonResponse({"error": str(inner), "response": result})

    except Exception as e:
        return JsonResponse({"error": str(e)}, status=500)

@csrf_exempt
def submit_final_quiz(request):
    if request.method != "POST":
        return JsonResponse({"error": "Only POST allowed"}, status=405)

    try:
        data = json.loads(request.body)
        quiz_id = data.get("quiz_id")
        user_answers = data.get("user_answers")

        if not quiz_id:
            return JsonResponse({"error": "Quiz ID is required"}, status=400)

        quiz = Quiz.objects.get(id=quiz_id)
        
        # Save the final quiz attempt
        quiz_attempt = UserQuizAttempt.objects.create(
            quiz=quiz,
            user_answers=user_answers if user_answers else []  # Ensure we always have a valid value
        )

        # Get progress and initial attempt
        progress = UserProgress.objects.get(topic=quiz.topic)
        initial_attempt = progress.initial_quiz_attempt

        # Analyze final performance
        prompt = generate_analysis_prompt(quiz.questions, user_answers if user_answers else [])
        result = call_openrouter(prompt)
        raw = result['choices'][0]['message']['content']
        final_weak_concepts = json.loads(raw.strip().replace("```json", "").replace("```", ""))

        # Calculate improvement metrics
        initial_weak = set(initial_attempt.weak_concepts) if initial_attempt else set()
        final_weak = set(final_weak_concepts)
        
        improved_concepts = initial_weak - final_weak
        still_weak_concepts = initial_weak.intersection(final_weak)
        new_weak_concepts = final_weak - initial_weak

        # Calculate overall improvement percentage
        total_concepts = len(initial_weak.union(final_weak))
        improvement_percentage = (len(improved_concepts) / total_concepts * 100) if total_concepts > 0 else 0

        # Update progress
        progress.final_quiz_attempt = quiz_attempt
        progress.progress_percentage = improvement_percentage
        progress.save()

        # Generate reinforcement feedback
        feedback_prompt = f"""
        Based on the following learning journey:
        Initial weak concepts: {list(initial_weak)}
        Final weak concepts: {list(final_weak)}
        Improved concepts: {list(improved_concepts)}
        Still weak concepts: {list(still_weak_concepts)}
        New weak concepts: {list(new_weak_concepts)}
        
        Provide a detailed analysis of the student's progress and specific recommendations for further improvement.
        Focus on:
        1. Areas of significant improvement
        2. Concepts that still need work
        3. New areas that emerged as weak
        4. Specific study recommendations
        """

        feedback_result = call_openrouter(feedback_prompt)
        feedback = feedback_result['choices'][0]['message']['content']

        return JsonResponse({
            "message": "Final quiz submitted successfully",
            "quiz_attempt_id": quiz_attempt.id,
            "improvement_metrics": {
                "improvement_percentage": improvement_percentage,
                "improved_concepts": list(improved_concepts),
                "still_weak_concepts": list(still_weak_concepts),
                "new_weak_concepts": list(new_weak_concepts)
            },
            "detailed_feedback": feedback
        })

    except Exception as e:
        return JsonResponse({"error": str(e)})

@csrf_exempt
def get_quiz_attempt(request, attempt_id):
    try:
        attempt = UserQuizAttempt.objects.get(id=attempt_id)
        return JsonResponse({
            "quiz_id": attempt.quiz.id,
            "user_answers": attempt.user_answers,
            "weak_concepts": attempt.weak_concepts
        })
    except UserQuizAttempt.DoesNotExist:
        return JsonResponse({"error": "Quiz attempt not found"}, status=404)
    except Exception as e:
        return JsonResponse({"error": str(e)}, status=500)
    