import React, { useState } from 'react';
import {
  Paper,
  Typography,
  Box,
  Chip,
  IconButton,
  Alert,
  Tooltip,
  Snackbar
} from '@mui/material';
import { ContentCopy, OpenInNew, Schedule, CheckCircle } from '@mui/icons-material';
import { UrlData } from '../types/url';
import { logger } from '../middleware/logger';

interface UrlResultsProps {
  urls: UrlData[];
}

export const UrlResults: React.FC<UrlResultsProps> = ({ urls }) => {
  const [copiedUrl, setCopiedUrl] = useState<string | null>(null);

  const copyToClipboard = async (text: string, shortCode: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedUrl(shortCode);
      logger.info('URL copied to clipboard', { shortCode });
      setTimeout(() => setCopiedUrl(null), 2000);
    } catch (error) {
      logger.error('Failed to copy URL to clipboard', { error });
    }
  };

  const formatExpiryTime = (expiresAt: string): string => {
    const expiry = new Date(expiresAt);
    return expiry.toLocaleDateString() + ' at ' + expiry.toLocaleTimeString();
  };

  const getTimeRemaining = (expiresAt: string): string => {
    const now = new Date();
    const expiry = new Date(expiresAt);
    const diffMs = expiry.getTime() - now.getTime();
    
    if (diffMs <= 0) return 'Expired';
    
    const diffMinutes = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMinutes / 60);
    const diffDays = Math.floor(diffHours / 24);
    
    if (diffDays > 0) return `${diffDays}d ${diffHours % 24}h remaining`;
    if (diffHours > 0) return `${diffHours}h ${diffMinutes % 60}m remaining`;
    return `${diffMinutes}m remaining`;
  };

  if (urls.length === 0) return null;

  return (
    <>
      <Paper elevation={2} sx={{ p: 4, maxWidth: 800, mx: 'auto', mt: 4 }}>
        <Typography variant="h5" gutterBottom fontWeight="bold">
          Generated Short URLs
        </Typography>
        
        {urls.map((url) => (
          <Box key={url.id} sx={{ mb: 3, p: 3, border: '1px solid', borderColor: 'divider', borderRadius: 2 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
              <Box sx={{ flex: 1, mr: 2 }}>
                <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                  Original URL
                </Typography>
                <Typography 
                  variant="body2" 
                  sx={{ wordBreak: 'break-all', mb: 2 }}
                >
                  {url.originalUrl}
                </Typography>
                
                <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                  Short URL
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Typography 
                    variant="body1" 
                    color="primary.main" 
                    fontWeight="medium"
                    sx={{ wordBreak: 'break-all' }}
                  >
                    {url.shortUrl}
                  </Typography>
                  
                  <Tooltip title={copiedUrl === url.shortCode ? "Copied!" : "Copy URL"}>
                    <IconButton
                      size="small"
                      onClick={() => copyToClipboard(url.shortUrl, url.shortCode)}
                      color={copiedUrl === url.shortCode ? "success" : "primary"}
                    >
                      {copiedUrl === url.shortCode ? <CheckCircle /> : <ContentCopy />}
                    </IconButton>
                  </Tooltip>
                  
                  <Tooltip title="Open URL">
                    <IconButton
                      size="small"
                      onClick={() => window.open(url.shortUrl, '_blank')}
                      color="primary"
                    >
                      <OpenInNew />
                    </IconButton>
                  </Tooltip>
                </Box>
              </Box>
            </Box>

            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', alignItems: 'center' }}>
              <Chip
                icon={<Schedule />}
                label={`Expires: ${formatExpiryTime(url.expiresAt)}`}
                variant="outlined"
                size="small"
                color={url.isExpired ? "error" : "default"}
              />
              
              <Chip
                label={getTimeRemaining(url.expiresAt)}
                variant="outlined"
                size="small"
                color={url.isExpired ? "error" : "success"}
              />
              
              <Chip
                label={`${url.clicks.length} clicks`}
                variant="outlined"
                size="small"
                color="info"
              />
            </Box>

            {url.isExpired && (
              <Alert severity="warning" sx={{ mt: 2 }}>
                This URL has expired and will no longer redirect.
              </Alert>
            )}
          </Box>
        ))}
      </Paper>

      <Snackbar
        open={!!copiedUrl}
        autoHideDuration={2000}
        onClose={() => setCopiedUrl(null)}
        message="URL copied to clipboard!"
      />
    </>
  );
};