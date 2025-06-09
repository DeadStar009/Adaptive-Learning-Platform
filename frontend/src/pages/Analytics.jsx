import React, { useState, useEffect } from 'react';
import {
  Container,
  Paper,
  Typography,
  Box,
  CircularProgress,
  Grid,
  Card,
  CardContent,
  Alert,
  List,
  ListItem,
  ListItemText,
  Divider,
  LinearProgress,
  Button,
} from '@mui/material';
import {
  Assessment as AssessmentIcon,
  TrendingUp as TrendingUpIcon,
  School as SchoolIcon,
  Warning as WarningIcon,
  CheckCircle as CheckCircleIcon,
} from '@mui/icons-material';
import ReactMarkdown from 'react-markdown';
import axios from 'axios';

const Analytics = () => {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      setError(null);
      const quizAttemptId = localStorage.getItem('lastQuizAttemptId');
      const userAnswers = localStorage.getItem('lastQuizAnswers');
      
      if (!quizAttemptId) {
        setError('No quiz attempt found. Please take a quiz first.');
        setLoading(false);
        return;
      }

      // First get the quiz ID from the attempt
      const attemptResponse = await axios.get(`http://localhost:8000/api/quiz-attempt/${quizAttemptId}/`);
      const quizId = attemptResponse.data.quiz_id;

      // Parse user answers if they exist
      let parsedAnswers = null;
      try {
        parsedAnswers = userAnswers ? JSON.parse(userAnswers) : null;
      } catch (e) {
        console.error('Error parsing user answers:', e);
        parsedAnswers = null;
      }

      const response = await axios.post('http://localhost:8000/api/submit-final-quiz/', {
        quiz_id: quizId,
        user_answers: parsedAnswers
      });
      console.log('quiz id', quizId)
      console.log('user answers', parsedAnswers)
      console.log('Analytics response:', response.data);
      if (response.data) {
        setAnalytics(response.data);
      } else {
        setError('Invalid response from server');
      }
    } catch (error) {
      console.error('Error fetching analytics:', error);
      setError('Failed to load analytics. Please try again.');
    } finally {
      setLoading(false);
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

  if (!analytics) {
    return (
      <Container maxWidth="md" sx={{ mt: 4 }}>
        <Alert severity="warning" sx={{ mb: 2 }}>
          No analytics available. Please take a quiz first.
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
          Your Performance Analytics
        </Typography>

        <Grid container spacing={3}>
          {/* Overall Progress */}
          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <AssessmentIcon sx={{ mr: 1 }} />
                  <Typography variant="h6">Overall Progress</Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <Typography variant="h4" sx={{ mr: 2 }}>
                    {analytics.improvement_metrics?.improvement_percentage || 0}%
                  </Typography>
                  <Box sx={{ flexGrow: 1 }}>
                    <LinearProgress 
                      variant="determinate" 
                      value={analytics.improvement_metrics?.improvement_percentage || 0}
                      sx={{ height: 10, borderRadius: 5 }}
                    />
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          {/* Improved Concepts */}
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <CheckCircleIcon sx={{ mr: 1 }} color="success" />
                  <Typography variant="h6">Improved Concepts</Typography>
                </Box>
                <List>
                  {analytics.improvement_metrics?.improved_concepts?.map((concept, index) => (
                    <React.Fragment key={index}>
                      <ListItem>
                        <ListItemText primary={concept} />
                      </ListItem>
                      {index < analytics.improvement_metrics.improved_concepts.length - 1 && <Divider />}
                    </React.Fragment>
                  ))}
                </List>
              </CardContent>
            </Card>
          </Grid>

          {/* Areas Still Needing Work */}
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <WarningIcon sx={{ mr: 1 }} color="warning" />
                  <Typography variant="h6">Areas Still Needing Work</Typography>
                </Box>
                <List>
                  {analytics.improvement_metrics?.still_weak_concepts?.map((concept, index) => (
                    <React.Fragment key={index}>
                      <ListItem>
                        <ListItemText primary={concept} />
                      </ListItem>
                      {index < analytics.improvement_metrics.still_weak_concepts.length - 1 && <Divider />}
                    </React.Fragment>
                  ))}
                </List>
              </CardContent>
            </Card>
          </Grid>

          {/* New Areas of Focus */}
          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <SchoolIcon sx={{ mr: 1 }} color="primary" />
                  <Typography variant="h6">New Areas of Focus</Typography>
                </Box>
                <List>
                  {analytics.improvement_metrics?.new_weak_concepts?.map((concept, index) => (
                    <React.Fragment key={index}>
                      <ListItem>
                        <ListItemText primary={concept} />
                      </ListItem>
                      {index < analytics.improvement_metrics.new_weak_concepts.length - 1 && <Divider />}
                    </React.Fragment>
                  ))}
                </List>
              </CardContent>
            </Card>
          </Grid>

          {/* Detailed Feedback */}
          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <TrendingUpIcon sx={{ mr: 1 }} />
                  <Typography variant="h6">Detailed Feedback</Typography>
                </Box>
                <Box sx={{ 
                  '& h3': { 
                    fontSize: '1.5rem',
                    fontWeight: 'bold',
                    mt: 3,
                    mb: 2,
                    color: 'primary.main'
                  },
                  '& h4': {
                    fontSize: '1.25rem',
                    fontWeight: 'bold',
                    mt: 2,
                    mb: 1,
                    color: 'text.primary'
                  },
                  '& ul': {
                    pl: 3,
                    mb: 2
                  },
                  '& li': {
                    mb: 1
                  },
                  '& p': {
                    mb: 2
                  },
                  '& strong': {
                    fontWeight: 'bold'
                  },
                  '& em': {
                    fontStyle: 'italic'
                  }
                }}>
                  <ReactMarkdown>
                    {analytics.detailed_feedback}
                  </ReactMarkdown>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        <Box sx={{ mt: 4, display: 'flex', gap: 2, justifyContent: 'center' }}>
          <Button
            variant="contained"
            color="primary"
            onClick={() => window.location.href = '/learning-path'}
          >
            View Learning Path
          </Button>
          <Button
            variant="outlined"
            onClick={() => window.location.href = '/quiz'}
          >
            Take Another Quiz
          </Button>
        </Box>
      </Paper>
    </Container>
  );
};

export default Analytics; 