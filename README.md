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
- Generate comprehensive learning paths covering all concepts
- Endpoint: `POST /api/learning-path/`
- Input: List of weak concepts and all concepts
- Output: 
  - Structured learning path with resources
  - Practice exercises for each concept
  - Extra practice for weak concepts
  - Concept relationships and dependencies
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
│   │   ├── openrouter.py # AI integration with LangChain
│   │   └── langchain_integration.py # LangChain implementation
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
- All concepts tracking
- Completion timestamp

### LearningPath
- Weak concepts tracking
- All concepts tracking
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
- LangSmith API key
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
LANGCHAIN_API_KEY=your_langsmith_api_key
LANGCHAIN_PROJECT=adaptive-learning-platform
LANGCHAIN_ENDPOINT=https://api.smith.langchain.com
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

## AI Integration

### LangChain Integration
- Uses LangChain for structured AI interactions
- Implements custom prompt templates
- Handles AI response processing
- Manages conversation context
- Provides error handling and retry logic
- Tracks all AI interactions with LangSmith

### LangSmith Monitoring
- Tracks all AI interactions with detailed run information
- Monitors prompt effectiveness and response quality
- Logs performance metrics and response times
- Provides debugging capabilities with raw and cleaned responses
- Enables prompt optimization through detailed analytics
- Maintains run history with unique IDs for each interaction

To view LangSmith data:
1. Go to https://smith.langchain.com/
2. Log in with your credentials
3. Select the "adaptive-learning-platform" project
4. View runs, metrics, and performance data

## Recent Updates

1. AI Integration
   - Enhanced LangChain integration with better error handling
   - Improved LangSmith monitoring with detailed run tracking
   - Added response cleaning and validation
   - Enhanced prompt engineering for better learning outcomes
   - Added comprehensive logging for debugging

2. Learning Path Improvements
   - Added support for tracking all concepts
   - Enhanced learning path generation with concept relationships
   - Added extra practice problems for weak concepts
   - Improved resource recommendations
   - Added concept dependency tracking

3. Analytics Enhancements
   - Added detailed performance metrics with progress bars
   - Implemented markdown support for detailed feedback
   - Enhanced concept-specific analysis
   - Added visual indicators for improvement areas
   - Improved feedback presentation

4. Frontend Improvements
   - Added responsive UI components with Material-UI
   - Enhanced error handling and user feedback
   - Added loading states and progress indicators
   - Improved navigation between components
   - Added detailed analytics visualization

5. Backend Updates
   - Added support for tracking all concepts in quiz attempts
   - Enhanced learning path generation
   - Improved error handling and response validation
   - Added detailed logging for debugging
   - Enhanced API response formatting

## Development

- Built with Django REST framework and React
- Uses OpenRouter for AI-powered features
- Implements LangChain for structured AI interactions
- Uses LangSmith for monitoring and debugging
- Implements custom prompt engineering for optimal learning outcomes
- RESTful API design with JSON responses
- Focuses on reinforcement learning and continuous improvement
- Implements persistent storage and session management
- Uses Material-UI for responsive design
- Implements comprehensive error handling and logging

## License

This project is licensed under the MIT License - see the LICENSE file for details.

