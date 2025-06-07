import React, { useState, useEffect } from 'react';
import {
  Container,
  Paper,
  Typography,
  Box,
  CircularProgress,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider,
  Card,
  CardContent,
  Alert,
  Button,
  Grid,
} from '@mui/material';
import {
  School as SchoolIcon,
  Book as BookIcon,
  Code as CodeIcon,
  Assignment as AssignmentIcon,
  CheckCircle as CheckCircleIcon,
} from '@mui/icons-material';
import axios from 'axios';

const LearningPath = () => {
  const [learningPath, setLearningPath] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [completedItems, setCompletedItems] = useState(new Set());

  useEffect(() => {
    fetchLearningPath();
  }, []);

  const fetchLearningPath = async () => {
    try {
      setLoading(true);
      setError(null);
      const quizAttemptId = localStorage.getItem('lastQuizAttemptId');
      const weakConcepts = localStorage.getItem('weakConcepts');
      
      if (!quizAttemptId || !weakConcepts) {
        setError('No quiz attempt found. Please take a quiz first.');
        setLoading(false);
        return;
      }

      const response = await axios.post('http://localhost:8000/api/learning-path/', {
        quiz_attempt_id: quizAttemptId,
        weak_concepts: JSON.parse(weakConcepts)
      });
      console.log('quiz attempt id', quizAttemptId)
      console.log('weak concepts', weakConcepts)
      console.log('Learning path response:', response.data);
      if (response.data && response.data.learning_path) {
        setLearningPath(response.data.learning_path);
      } else {
        setError('Invalid response from server');
      }
    } catch (error) {
      console.error('Error fetching learning path:', error);
      setError('Failed to load learning path. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const markAsCompleted = (concept) => {
    setCompletedItems(prev => {
      const newSet = new Set(prev);
      newSet.add(concept);
      return newSet;
    });
  };

  const getIconForType = (type) => {
    switch (type) {
      case 'video':
        return <SchoolIcon />;
      case 'article':
        return <BookIcon />;
      case 'exercise':
        return <CodeIcon />;
      case 'quiz':
        return <AssignmentIcon />;
      default:
        return <BookIcon />;
    }
  };

  if (loading) {
    return (
      <Container maxWidth="md" sx={{ mt: 4 }}>
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  if (error) {
    return (
      <Container maxWidth="md" sx={{ mt: 4 }}>
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
        <Button
          variant="contained"
          onClick={() => window.location.href = '/quiz'}
        >
          Take a Quiz
        </Button>
      </Container>
    );
  }

  if (!learningPath || !Array.isArray(learningPath)) {
    return (
      <Container maxWidth="md" sx={{ mt: 4 }}>
        <Alert severity="warning" sx={{ mb: 2 }}>
          No learning path available. Please take a quiz first.
        </Alert>
        <Button
          variant="contained"
          onClick={() => window.location.href = '/quiz'}
        >
          Take a Quiz
        </Button>
      </Container>
    );
  }

  return (
    <Container maxWidth="md" sx={{ mt: 4 }}>
      <Paper elevation={3} sx={{ p: 4 }}>
        <Typography variant="h4" gutterBottom>
          Your Learning Path
        </Typography>
        
        <Alert severity="info" sx={{ mb: 4 }}>
          This personalized learning path is designed to help you improve in areas where you need more practice.
        </Alert>

        <Grid container spacing={3}>
          {learningPath.map((item, index) => (
            <Grid item xs={12} key={index}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    {item.concept}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" paragraph>
                    {item.explanation}
                  </Typography>
                  
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Button
                      variant="contained"
                      color="primary"
                      href={item.resource}
                      target="_blank"
                      rel="noopener noreferrer"
                      startIcon={<BookIcon />}
                    >
                      Learn More
                    </Button>
                    {!completedItems.has(item.concept) && (
                      <Button
                        variant="outlined"
                        onClick={() => markAsCompleted(item.concept)}
                        startIcon={<CheckCircleIcon />}
                      >
                        Mark as Completed
                      </Button>
                    )}
                    {completedItems.has(item.concept) && (
                      <Typography color="success.main" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <CheckCircleIcon /> Completed
                      </Typography>
                    )}
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>

        <Box sx={{ mt: 4, display: 'flex', gap: 2, justifyContent: 'center' }}>
          <Button
            variant="contained"
            color="primary"
            onClick={() => window.location.href = '/quiz'}
          >
            Take Final Quiz
          </Button>
          <Button
            variant="outlined"
            onClick={() => window.location.href = '/analytics'}
          >
            View Progress
          </Button>
        </Box>
      </Paper>
    </Container>
  );
};

export default LearningPath; 