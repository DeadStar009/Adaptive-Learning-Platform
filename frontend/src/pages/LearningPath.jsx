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
  Chip,
  Collapse,
  IconButton,
} from '@mui/material';
import {
  School as SchoolIcon,
  Book as BookIcon,
  Code as CodeIcon,
  Assignment as AssignmentIcon,
  CheckCircle as CheckCircleIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  Link as LinkIcon,
} from '@mui/icons-material';
import axios from 'axios';

const LearningPath = () => {
  const [learningPath, setLearningPath] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [completedItems, setCompletedItems] = useState(new Set());
  const [expandedConcepts, setExpandedConcepts] = useState(new Set());

  useEffect(() => {
    fetchLearningPath();
  }, []);

  const fetchLearningPath = async () => {
    try {
      setLoading(true);
      setError(null);
      const quizAttemptId = localStorage.getItem('lastQuizAttemptId');
      const weakConcepts = localStorage.getItem('weakConcepts');
      const allConcepts = localStorage.getItem('allConcepts');
      
      if (!quizAttemptId || !weakConcepts || !allConcepts) {
        setError('No quiz attempt found. Please take a quiz first.');
        setLoading(false);
        return;
      }

      const response = await axios.post('http://localhost:8000/api/learning-path/', {
        quiz_attempt_id: quizAttemptId,
        weak_concepts: JSON.parse(weakConcepts),
        all_concepts: JSON.parse(allConcepts)
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

  const toggleConcept = (concept) => {
    setExpandedConcepts(prev => {
      const newSet = new Set(prev);
      if (newSet.has(concept)) {
        newSet.delete(concept);
      } else {
        newSet.add(concept);
      }
      return newSet;
    });
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
          This comprehensive learning path covers all concepts, with extra focus on areas where you need more practice.
        </Alert>

        <Grid container spacing={3}>
          {learningPath.map((item, index) => (
            <Grid item xs={12} key={index}>
              <Card sx={{ 
                borderLeft: item.is_weak_concept ? '4px solid #f44336' : '4px solid #4caf50',
                position: 'relative'
              }}>
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                    <Typography variant="h6">
                      {item.concept}
                    </Typography>
                    <Box>
                      {item.is_weak_concept && (
                        <Chip 
                          label="Needs Focus" 
                          color="error" 
                          size="small" 
                          sx={{ mr: 1 }}
                        />
                      )}
                      <IconButton onClick={() => toggleConcept(item.concept)}>
                        {expandedConcepts.has(item.concept) ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                      </IconButton>
                    </Box>
                  </Box>

                  <Typography variant="body2" color="text.secondary" paragraph>
                    {item.explanation}
                  </Typography>

                  <Collapse in={expandedConcepts.has(item.concept)}>
                    <Box sx={{ mt: 2, mb: 2 }}>
                      {item.related_concepts && item.related_concepts.length > 0 && (
                        <Box sx={{ mb: 2 }}>
                          <Typography variant="subtitle2" gutterBottom>
                            Related Concepts:
                          </Typography>
                          <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                            {item.related_concepts.map((related, idx) => (
                              <Chip 
                                key={idx}
                                label={related}
                                size="small"
                                variant="outlined"
                              />
                            ))}
                          </Box>
                        </Box>
                      )}

                      {item.practice_problems && item.practice_problems.length > 0 && (
                        <Box sx={{ mb: 2 }}>
                          <Typography variant="subtitle2" gutterBottom>
                            Practice Problems:
                          </Typography>
                          <List dense>
                            {item.practice_problems.map((problem, idx) => (
                              <ListItem key={idx}>
                                <ListItemIcon>
                                  <CodeIcon />
                                </ListItemIcon>
                                <ListItemText primary={problem} />
                              </ListItem>
                            ))}
                          </List>
                        </Box>
                      )}
                    </Box>
                  </Collapse>
                  
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Button
                      variant="contained"
                      color="primary"
                      href={item.resource}
                      target="_blank"
                      rel="noopener noreferrer"
                      startIcon={<LinkIcon />}
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