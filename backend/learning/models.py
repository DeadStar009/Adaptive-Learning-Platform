from django.db import models

# Create your models here.

class Topic(models.Model):
    name = models.CharField(max_length=100)
    description = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.name

class Quiz(models.Model):
    topic = models.ForeignKey(Topic, on_delete=models.CASCADE)
    questions = models.JSONField()  # Stores the quiz questions and answers
    created_at = models.DateTimeField(auto_now_add=True)
    is_final_quiz = models.BooleanField(default=False)

    def __str__(self):
        return f"Quiz for {self.topic.name}"

class UserQuizAttempt(models.Model):
    quiz = models.ForeignKey(Quiz, on_delete=models.CASCADE)
    user_answers = models.JSONField(null=True, blank=True)  # Allow null values
    score = models.FloatField(null=True, blank=True)
    weak_concepts = models.JSONField(null=True, blank=True)  # Stores identified weak concepts
    all_concepts = models.JSONField(null=True, blank=True)  # Stores all concepts from the quiz
    completed_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Attempt on {self.quiz}"

class LearningPath(models.Model):
    weak_concepts = models.JSONField()  # Stores the weak concepts
    all_concepts = models.JSONField(null=True, blank=True)  # Stores all concepts from the quiz
    learning_materials = models.JSONField()  # Stores the generated learning path
    created_at = models.DateTimeField(auto_now_add=True)
    completed = models.BooleanField(default=False)

    def __str__(self):
        return f"Learning path created at {self.created_at}"

class UserProgress(models.Model):
    topic = models.ForeignKey(Topic, on_delete=models.CASCADE)
    initial_quiz_attempt = models.ForeignKey(
        UserQuizAttempt, 
        on_delete=models.SET_NULL, 
        null=True, 
        related_name='initial_attempt'
    )
    learning_path = models.ForeignKey(
        LearningPath, 
        on_delete=models.SET_NULL, 
        null=True
    )
    final_quiz_attempt = models.ForeignKey(
        UserQuizAttempt, 
        on_delete=models.SET_NULL, 
        null=True, 
        related_name='final_attempt'
    )
    progress_percentage = models.FloatField(default=0)
    last_updated = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"Progress in {self.topic.name}"
