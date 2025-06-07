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
} from '@mui/material';
import axios from 'axios';

const Quiz = () => {
  const [quiz, setQuiz] = useState(null);
  const [loading, setLoading] = useState(false);
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [topic, setTopic] = useState('');
  const [error, setError] = useState(null);
  const [analysis, setAnalysis] = useState(null);

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

  // Debug render
  console.log('Current quiz state:', quiz);
  console.log('Current loading state:', loading);
  console.log('Current error state:', error);

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
              Quiz Analysis
            </Typography>
            
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
                  // Navigate to learning path
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