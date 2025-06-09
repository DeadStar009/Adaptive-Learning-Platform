import React, { useState } from 'react';
import {
  Container,
  Paper,
  Typography,
  Button,
  Radio,
  RadioGroup,
  FormControlLabel,
  FormControl,
  Box,
  CircularProgress,
  TextField,
  List,
  ListItem,
  ListItemText,
  Divider,
  Alert,
  Card,
  CardContent,
  Grid,
} from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import axios from 'axios';

const Quiz = () => {
  const [quiz, setQuiz] = useState(null);
  const [loading, setLoading] = useState(false);
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [topic, setTopic] = useState('');
  const [error, setError] = useState(null);
  const [analysis, setAnalysis] = useState(null);
  const [score, setScore] = useState(null);

  const generateQuiz = async () => {
    try {
      setLoading(true);
      setError(null);
      setAnalysis(null);
      console.log('Generating quiz for topic:', topic);
      const response = await axios.get(`http://localhost:8000/api/generate-quiz/?topic=${topic}`);
      console.log('Quiz response:', response.data);
      setQuiz({
        id: response.data.quiz_id,
        questions: response.data.quiz
      });
      setSelectedAnswers({});
    } catch (error) {
      console.error('Error generating quiz:', error);
      console.error('Error details:', error.response?.data);
      setError('Failed to generate quiz. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleAnswerSelect = (questionId, answer) => {
    setSelectedAnswers(prev => ({
      ...prev,
      [questionId]: answer
    }));
  };

  const submitQuiz = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await axios.post('http://localhost:8000/api/analyze-quiz/', {
        quiz_id: quiz.id,
        user_answers: Object.entries(selectedAnswers).map(([questionId, answer]) => ({
          question_id: questionId,
          answer: answer
        }))
      });
      console.log('Quiz analysis:', response.data);
      
      // Calculate score using the correct answers from quiz state
      const totalQuestions = quiz.questions.length;
      const correctCount = quiz.questions.reduce((count, question, index) => {
        // Extract just the letter from the selected answer (e.g., "B) Binary Search" -> "B")
        const selectedLetter = selectedAnswers[index]?.split(')')[0]?.trim();
        return selectedLetter === question.answer ? count + 1 : count;
      }, 0);
      const calculatedScore = (correctCount / totalQuestions) * 100;
      setScore(calculatedScore);
      
      // Store quiz attempt ID and weak concepts in localStorage
      if (response.data.quiz_attempt_id) {
        localStorage.setItem('lastQuizAttemptId', response.data.quiz_attempt_id);
      }
      if (response.data.weak_concepts) {
        localStorage.setItem('weakConcepts', JSON.stringify(response.data.weak_concepts));
      }
      
      // Store user answers in localStorage
      localStorage.setItem('lastQuizAnswers', JSON.stringify(selectedAnswers));
      
      setAnalysis(response.data);
    } catch (error) {
      console.error('Error submitting quiz:', error);
      console.error('Error details:', error.response?.data);
      setError('Failed to submit quiz. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const resetQuiz = () => {
    setQuiz(null);
    setSelectedAnswers({});
    setAnalysis(null);
    setError(null);
  };

  console.log('Current quiz state:', quiz);
  console.log('Current loading state:', loading);
  console.log('Current error state:', error);
  console.log('Current selected answers:', selectedAnswers);

  return (
    <Container maxWidth="md" sx={{ mt: 4 }}>
      <Paper elevation={3} sx={{ p: 4 }}>
        <Typography variant="h4" gutterBottom>
          Quiz Generator
        </Typography>
        
        {!quiz && (
          <Box sx={{ mb: 4 }}>
            <TextField
              fullWidth
              label="Enter Topic"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              sx={{ mb: 2 }}
            />
            <Button
              variant="contained"
              onClick={generateQuiz}
              disabled={loading || !topic}
            >
              Generate Quiz
            </Button>
          </Box>
        )}

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {loading && (
          <Box display="flex" justifyContent="center" my={4}>
            <CircularProgress />
          </Box>
        )}

        {quiz && quiz.questions && !loading && !analysis && (
          <>
            {quiz.questions.map((question, index) => (
              <Box key={index} sx={{ mb: 4 }}>
                <Typography variant="h6" gutterBottom>
                  Question {index + 1}: {question.question}
                </Typography>
                <FormControl component="fieldset">
                  <RadioGroup
                    value={selectedAnswers[index] || ''}
                    onChange={(e) => handleAnswerSelect(index, e.target.value)}
                  >
                    {question.options.map((option) => (
                      <FormControlLabel
                        key={option}
                        value={option}
                        control={<Radio />}
                        label={option}
                      />
                    ))}
                  </RadioGroup>
                </FormControl>
              </Box>
            ))}

            <Button
              variant="contained"
              color="primary"
              onClick={submitQuiz}
              disabled={loading || Object.keys(selectedAnswers).length !== quiz.questions.length}
            >
              Submit Quiz
            </Button>
          </>
        )}

        {analysis && (
          <Box sx={{ mt: 4 }}>
            <Typography variant="h5" gutterBottom>
              Quiz Results
            </Typography>

            <Card sx={{ mb: 4, bgcolor: 'background.default' }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Your Score: {score?.toFixed(1)}%
                </Typography>
                <Typography variant="body1" color="text.secondary">
                  {score >= 70 ? 'Great job! ' : 'Keep practicing! '}
                </Typography>
              </CardContent>
            </Card>

            <Typography variant="h6" gutterBottom>
              Question Review
            </Typography>

            {quiz.questions.map((question, index) => {
              // Extract just the letter from the selected answer (e.g., "B) Binary Search" -> "B")
              const selectedLetter = selectedAnswers[index]?.split(')')[0]?.trim();
              const isCorrect = selectedLetter === question.answer;
              
              // Find the full correct answer text
              const correctAnswerText = question.options.find(opt => 
                opt.startsWith(question.answer + ')') || opt.startsWith(question.answer + '.')
              );

              return (
                <Box key={index} sx={{ mb: 3 }}>
                  <Paper elevation={1} sx={{ 
                    p: 2, 
                    borderLeft: `4px solid ${isCorrect ? '#4caf50' : '#f44336'}`,
                    bgcolor: isCorrect ? '' : ''
                  }}>
                    <Grid container alignItems="center" spacing={1}>
                      <Grid item>
                        {isCorrect ? (
                          <CheckCircleIcon color="success" />
                        ) : (
                          <CancelIcon color="error" />
                        )}
                      </Grid>
                      <Grid item xs>
                        <Typography variant="subtitle1" gutterBottom>
                          Question {index + 1}: {question.question}
                        </Typography>
                        <Typography variant="body2" color="text.secondary" gutterBottom>
                          Your answer: {selectedAnswers[index]}
                        </Typography>
                        {!isCorrect && (
                          <Typography variant="body2" color="success.main">
                            Correct answer: {correctAnswerText || question.answer}
                          </Typography>
                        )}
                      </Grid>
                    </Grid>
                  </Paper>
                </Box>
              );
            })}

            <Alert severity="info" sx={{ mb: 3 }}>
              Based on your performance, here are the concepts you should focus on:
            </Alert>

            <List>
              {analysis.weak_concepts && analysis.weak_concepts.map((concept, index) => (
                <React.Fragment key={index}>
                  <ListItem>
                    <ListItemText 
                      primary={concept}
                      secondary="This concept needs more practice"
                    />
                  </ListItem>
                  {index < analysis.weak_concepts.length - 1 && <Divider />}
                </React.Fragment>
              ))}
            </List>

            <Box sx={{ mt: 4, display: 'flex', gap: 2 }}>
              <Button
                variant="contained"
                color="primary"
                onClick={() => {
                  window.location.href = '/learning-path';
                }}
              >
                View Learning Path
              </Button>
              <Button
                variant="outlined"
                onClick={resetQuiz}
              >
                Take Another Quiz
              </Button>
            </Box>
          </Box>
        )}
      </Paper>
    </Container>
  );
};

export default Quiz; 