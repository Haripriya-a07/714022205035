import React, { useState } from 'react';
import { Container, Box } from '@mui/material';
import { UrlShortenerForm } from '../components/UrlShortenerForm';
import { UrlResults } from '../components/UrlResults';
import { UrlData } from '../types/url';

export const HomePage: React.FC = () => {
  const [recentUrls, setRecentUrls] = useState<UrlData[]>([]);

  const handleUrlsCreated = (urls: UrlData[]) => {
    setRecentUrls(urls);
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box sx={{ minHeight: '80vh' }}>
        <UrlShortenerForm onUrlsCreated={handleUrlsCreated} />
        <UrlResults urls={recentUrls} />
      </Box>
    </Container>
  );
};