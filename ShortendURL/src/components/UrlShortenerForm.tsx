import React, { useState } from 'react';
import {
  Paper,
  TextField,
  Button,
  Box,
  Typography,
  Alert,
  Chip,
  IconButton,
  Divider,
  CircularProgress
} from '@mui/material';
import { Add, Delete, Link } from '@mui/icons-material';
import { CreateUrlRequest, UrlData } from '../types/url';
import { urlService } from '../services/urlService';
import { logger } from '../middleware/logger';

interface UrlShortenerFormProps {
  onUrlsCreated: (urls: UrlData[]) => void;
}

interface UrlFormData {
  originalUrl: string;
  validityMinutes: string;
  customShortCode: string;
}

export const UrlShortenerForm: React.FC<UrlShortenerFormProps> = ({ onUrlsCreated }) => {
  const [urlForms, setUrlForms] = useState<UrlFormData[]>([
    { originalUrl: '', validityMinutes: '', customShortCode: '' }
  ]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const addUrlForm = () => {
    if (urlForms.length < 5) {
      setUrlForms([...urlForms, { originalUrl: '', validityMinutes: '', customShortCode: '' }]);
    }
  };

  const removeUrlForm = (index: number) => {
    if (urlForms.length > 1) {
      const newForms = urlForms.filter((_, i) => i !== index);
      setUrlForms(newForms);
    }
  };

  const updateUrlForm = (index: number, field: keyof UrlFormData, value: string) => {
    const newForms = [...urlForms];
    newForms[index][field] = value;
    setUrlForms(newForms);
    setError(null);
    setSuccess(null);
  };

  const validateForm = (): boolean => {
    const filledForms = urlForms.filter(form => form.originalUrl.trim());
    
    if (filledForms.length === 0) {
      setError('Please enter at least one URL');
      return false;
    }

    for (const form of filledForms) {
      if (!urlService.validateUrl(form.originalUrl)) {
        setError(`Invalid URL format: ${form.originalUrl}`);
        return false;
      }

      if (form.validityMinutes && (isNaN(Number(form.validityMinutes)) || Number(form.validityMinutes) <= 0)) {
        setError('Validity period must be a positive number');
        return false;
      }

      if (form.customShortCode && !urlService.validateShortCode(form.customShortCode)) {
        setError(`Invalid shortcode format: ${form.customShortCode}. Use 3-20 alphanumeric characters only.`);
        return false;
      }
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!validateForm()) return;

    setLoading(true);
    logger.info('Starting URL shortening process', { urlCount: urlForms.filter(f => f.originalUrl.trim()).length });

    try {
      const requests: CreateUrlRequest[] = urlForms
        .filter(form => form.originalUrl.trim())
        .map(form => ({
          originalUrl: form.originalUrl.trim(),
          validityMinutes: form.validityMinutes ? Number(form.validityMinutes) : undefined,
          customShortCode: form.customShortCode.trim() || undefined
        }));

      const results = urlService.createMultipleUrls(requests);
      
      setSuccess(`Successfully created ${results.length} short URL${results.length > 1 ? 's' : ''}`);
      onUrlsCreated(results);
      
      // Reset form
      setUrlForms([{ originalUrl: '', validityMinutes: '', customShortCode: '' }]);
      
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to create short URLs';
      setError(errorMessage);
      logger.error('URL shortening failed', { error: errorMessage });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Paper elevation={3} sx={{ p: 4, maxWidth: 800, mx: 'auto' }}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
        <Link sx={{ mr: 2, color: 'primary.main' }} />
        <Typography variant="h4" component="h1" fontWeight="bold">
          URL Shortener
        </Typography>
      </Box>

      <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
        Create up to 5 short URLs at once. Customize expiry time and shortcodes as needed.
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {success && (
        <Alert severity="success" sx={{ mb: 3 }} onClose={() => setSuccess(null)}>
          {success}
        </Alert>
      )}

      <form onSubmit={handleSubmit}>
        {urlForms.map((form, index) => (
          <Box key={index} sx={{ mb: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <Chip 
                label={`URL ${index + 1}`} 
                color="primary" 
                variant="outlined" 
                size="small"
              />
              {urlForms.length > 1 && (
                <IconButton 
                  onClick={() => removeUrlForm(index)}
                  size="small"
                  sx={{ ml: 1 }}
                  color="error"
                >
                  <Delete />
                </IconButton>
              )}
            </Box>

            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <TextField
                fullWidth
                label="Original URL"
                placeholder="https://example.com/very/long/url"
                value={form.originalUrl}
                onChange={(e) => updateUrlForm(index, 'originalUrl', e.target.value)}
                variant="outlined"
                required={index === 0 || form.originalUrl.trim() !== ''}
              />
              
              <Box sx={{ display: 'flex', gap: 2 }}>
                <TextField
                  label="Validity (minutes)"
                  placeholder="30"
                  value={form.validityMinutes}
                  onChange={(e) => updateUrlForm(index, 'validityMinutes', e.target.value)}
                  variant="outlined"
                  type="number"
                  sx={{ flex: 1 }}
                  helperText="Default: 30 minutes"
                />
                
                <TextField
                  label="Custom Shortcode"
                  placeholder="my-link"
                  value={form.customShortCode}
                  onChange={(e) => updateUrlForm(index, 'customShortCode', e.target.value)}
                  variant="outlined"
                  sx={{ flex: 1 }}
                  helperText="Optional (3-20 chars)"
                />
              </Box>
            </Box>

            {index < urlForms.length - 1 && <Divider sx={{ mt: 2 }} />}
          </Box>
        ))}

        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 3 }}>
          <Button
            variant="outlined"
            startIcon={<Add />}
            onClick={addUrlForm}
            disabled={urlForms.length >= 5}
          >
            Add Another URL ({urlForms.length}/5)
          </Button>

          <Button
            type="submit"
            variant="contained"
            size="large"
            disabled={loading}
            sx={{ minWidth: 120 }}
          >
            {loading ? <CircularProgress size={24} /> : 'Shorten URLs'}
          </Button>
        </Box>
      </form>
    </Paper>
  );
};