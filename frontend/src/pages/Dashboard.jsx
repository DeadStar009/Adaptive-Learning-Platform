import React from 'react';
import {
  Container,
  Grid,
  Paper,
  Typography,
  Box,
  Button,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import QuizIcon from '@mui/icons-material/Quiz';
import TimelineIcon from '@mui/icons-material/Timeline';
import AssessmentIcon from '@mui/icons-material/Assessment';

const Dashboard = () => {
  const navigate = useNavigate();

  const features = [
    {
      title: 'Take a Quiz',
      description: 'Generate and take a quiz on any topic',
      icon: <QuizIcon sx={{ fontSize: 40 }} />,
      path: '/quiz',
    },
    {
      title: 'Learning Path',
      description: 'View your personalized learning journey',
      icon: <TimelineIcon sx={{ fontSize: 40 }} />,
      path: '/learning-path',
    },
    {
      title: 'Analytics',
      description: 'Track your progress and performance',
      icon: <AssessmentIcon sx={{ fontSize: 40 }} />,
      path: '/analytics',
    },
  ];

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" gutterBottom>
        Welcome to SALS
      </Typography>
      <Typography variant="subtitle1" color="text.secondary" paragraph>
        Your personalized learning journey starts here
      </Typography>

      <Grid container spacing={3} sx={{ mt: 2 }}>
        {features.map((feature) => (
          <Grid item xs={12} md={4} key={feature.title}>
            <Paper
              sx={{
                p: 3,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                height: '100%',
                cursor: 'pointer',
                '&:hover': {
                  backgroundColor: 'action.hover',
                },
              }}
              onClick={() => navigate(feature.path)}
            >
              <Box sx={{ mb: 2, color: 'primary.main' }}>
                {feature.icon}
              </Box>
              <Typography variant="h6" gutterBottom>
                {feature.title}
              </Typography>
              <Typography variant="body2" color="text.secondary" align="center">
                {feature.description}
              </Typography>
              <Button
                variant="contained"
                sx={{ mt: 2 }}
                onClick={(e) => {
                  e.stopPropagation();
                  navigate(feature.path);
                }}
              >
                Get Started
              </Button>
            </Paper>
          </Grid>
        ))}
      </Grid>
    </Container>
  );
};

export default Dashboard; 