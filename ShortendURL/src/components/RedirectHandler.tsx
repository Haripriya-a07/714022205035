import React, { useEffect, useState } from 'react';
import { useParams, Navigate } from 'react-router-dom';
import { Box, CircularProgress, Alert, Typography, Button } from '@mui/material';
import { urlService } from '../services/urlService';
import { logger } from '../middleware/logger';

export const RedirectHandler: React.FC = () => {
  const { shortCode } = useParams<{ shortCode: string }>();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [redirectUrl, setRedirectUrl] = useState<string | null>(null);

  useEffect(() => {
    if (!shortCode) {
      setError('Invalid short URL');
      setLoading(false);
      return;
    }

    const handleRedirect = () => {
      logger.info('Attempting to redirect', { shortCode });
      
      const urlData = urlService.getUrlByShortCode(shortCode);
      
      if (!urlData) {
        setError('Short URL not found');
        setLoading(false);
        logger.warn('Short URL not found', { shortCode });
        return;
      }

      if (urlData.isExpired) {
        setError('This short URL has expired');
        setLoading(false);
        logger.warn('Attempted to access expired URL', { shortCode });
        return;
      }

      // Track the click
      urlService.trackClick(shortCode, document.referrer || 'direct');
      
      // Set redirect URL and redirect after a brief moment
      setRedirectUrl(urlData.originalUrl);
      setTimeout(() => {
        window.location.href = urlData.originalUrl;
      }, 1000);
    };

    // Simulate loading for better UX
    setTimeout(handleRedirect, 500);
  }, [shortCode]);

  if (loading) {
    return (
      <Box 
        sx={{ 
          display: 'flex', 
          flexDirection: 'column',
          alignItems: 'center', 
          justifyContent: 'center', 
          minHeight: '50vh',
          gap: 2
        }}
      >
        <CircularProgress size={60} />
        <Typography variant="h6" color="text.secondary">
          Redirecting...
        </Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ maxWidth: 600, mx: 'auto', mt: 4 }}>
        <Alert 
          severity="error" 
          action={
            <Button color="inherit" size="small" onClick={() => window.location.href = '/'}>
              Go Home
            </Button>
          }
        >
          <Typography variant="h6" gutterBottom>
            {error}
          </Typography>
          <Typography variant="body2">
            The short URL "/{shortCode}" could not be found or has expired.
          </Typography>
        </Alert>
      </Box>
    );
  }

  if (redirectUrl) {
    return (
      <Box 
        sx={{ 
          display: 'flex', 
          flexDirection: 'column',
          alignItems: 'center', 
          justifyContent: 'center', 
          minHeight: '50vh',
          gap: 2
        }}
      >
        <CircularProgress size={60} />
        <Typography variant="h6" color="primary.main">
          Redirecting to: {redirectUrl}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          If you're not redirected automatically, <a href={redirectUrl} target="_blank" rel="noopener noreferrer">click here</a>
        </Typography>
      </Box>
    );
  }

  return <Navigate to="/" replace />;
};