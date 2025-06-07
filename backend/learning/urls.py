from django.urls import path
from . import views

urlpatterns = [
    path('generate-quiz/', views.generate_quiz, name='generate_quiz'),
    path('analyze-quiz/', views.analyze_quiz, name='analyze_quiz'),
    path('learning-path/', views.learning_path, name='learning_path'),
    path('final-quiz/', views.final_quiz, name='final_quiz'),
    path('submit-final-quiz/', views.submit_final_quiz, name='submit_final_quiz'),
    path('quiz-attempt/<int:attempt_id>/', views.get_quiz_attempt, name='get_quiz_attempt'),
]
