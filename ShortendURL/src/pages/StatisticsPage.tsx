import React from 'react';
import { Container, Box } from '@mui/material';
import { UrlStatistics } from '../components/UrlStatistics';

export const StatisticsPage: React.FC = () => {
  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box sx={{ minHeight: '80vh' }}>
        <UrlStatistics />
      </Box>
    </Container>
  );
};