# SALS (Student Activity Learning System)

An intelligent learning system that uses AI to generate personalized quizzes, analyze performance, and create custom learning paths for students. The system focuses on reinforcement learning and continuous improvement tracking.

## Features

### 1. Dynamic Quiz Generation
- Generate topic-specific quizzes using AI
- Endpoint: `GET /api/generate-quiz/?topic=<topic_name>`
- Returns a structured quiz with questions and answers
- Questions include difficulty levels and concept mapping
- Persistent storage of quiz attempts and user progress

### 2. Performance Analysis
- Analyze quiz responses to identify weak areas
- Endpoint: `POST /api/analyze-quiz/`
- Input: Questions and user answers
- Output: 
  - List of weak concepts that need improvement
  - Detailed performance metrics
  - Concept-specific analysis
  - Quiz attempt tracking with unique IDs

### 3. Personalized Learning Path
- Generate custom learning paths based on weak concepts
- Endpoint: `POST /api/learning-path/`
- Input: List of weak concepts
- Output: 
  - Structured learning path with resources
  - Practice exercises
  - Concept-specific recommendations
  - Progress tracking
  - Persistent storage of learning paths

### 4. Reinforcement Learning & Final Assessment
- Generate a final quiz focusing on previously weak areas
- Endpoint: `POST /api/final-quiz/`
- Input: Topic and weak concepts
- Output: 
  - Customized quiz targeting improvement areas
  - Mix of reinforcement and new concept questions
  - Varying difficulty levels
  - Detailed explanations
  - Progress comparison with initial assessment

### 5. Progress Tracking & Improvement Analysis
- Submit final quiz and get comprehensive feedback
- Endpoint: `POST /api/submit-final-quiz/`
- Input: Final quiz answers
- Output:
  - Improvement percentage
  - List of improved concepts
  - List of still-weak concepts
  - New areas of weakness
  - Detailed feedback and recommendations
  - Personalized study suggestions
  - Historical performance tracking

### 6. Quiz Attempt Management
- Track all quiz attempts with unique IDs
- Endpoint: `GET /api/quiz-attempt/<attempt_id>/`
- Features:
  - Persistent storage of user answers
  - Progress tracking across multiple attempts
  - Comparison of performance over time
  - Local storage integration for seamless user experience

## Project Structure

```
SALS/
├── backend/
│   ├── sals_backend/     # Main Django project directory
│   ├── learning/         # Django app with core functionality
│   │   ├── views.py      # API endpoint implementations
│   │   ├── prompts.py    # AI prompt templates
│   │   ├── models.py     # Database models
│   │   └── openrouter.py # AI integration
│   ├── manage.py         # Django management script
│   └── db.sqlite3        # SQLite database
├── frontend/
│   ├── src/
│   │   ├── pages/        # React components
│   │   │   ├── Quiz.jsx  # Quiz interface
│   │   │   ├── Analytics.jsx # Performance analysis
│   │   │   └── LearningPath.jsx # Learning path view
│   │   └── components/   # Reusable components
│   └── public/           # Static files
```

## Data Models

### Quiz
- Topic association
- Questions and answers
- Creation timestamp
- Final quiz flag

### UserQuizAttempt
- Quiz reference
- User answers
- Score tracking
- Weak concepts identification
- Completion timestamp

### LearningPath
- Weak concepts tracking
- Learning materials
- Creation timestamp
- Completion status

### UserProgress
- Topic tracking
- Initial quiz attempt reference
- Learning path reference
- Final quiz attempt reference
- Progress percentage
- Last update timestamp

## Prerequisites

- Python 3.x
- pip (Python package manager)
- Virtual environment (recommended)
- OpenRouter API key
- Node.js and npm (for frontend)

## Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd SALS
```

2. Backend Setup:
```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
```

3. Frontend Setup:
```bash
cd frontend
npm install
```

4. Set up environment variables:
Create a `.env` file in the backend directory with:
```
OPENROUTER_API_KEY=your_api_key_here
HTTP_REFERER=http://localhost:8000
```

5. Run migrations:
```bash
cd backend
python manage.py migrate
```

6. Start the development servers:

Backend:
```bash
cd backend
python manage.py runserver
```

Frontend:
```bash
cd frontend
npm start
```

The backend server will run at `http://127.0.0.1:8000/` and the frontend at `http://localhost:3000`

## Recent Updates

1. Quiz Management
   - Fixed quiz ID generation to prevent duplicate IDs
   - Added persistent storage of quiz attempts
   - Improved error handling for quiz submissions

2. User Progress Tracking
   - Added local storage integration for user answers
   - Implemented quiz attempt history
   - Enhanced progress tracking across sessions

3. Analytics Improvements
   - Added detailed performance metrics
   - Implemented concept-specific analysis
   - Enhanced feedback generation

4. Frontend Enhancements
   - Added responsive UI components
   - Improved error handling
   - Enhanced user feedback
   - Added progress persistence

## Development

- Built with Django REST framework and React
- Uses OpenRouter for AI-powered features
- Implements custom prompt engineering for optimal learning outcomes
- RESTful API design with JSON responses
- Focuses on reinforcement learning and continuous improvement
- Implements persistent storage and session management

## License

This project is licensed under the MIT License - see the LICENSE file for details.

