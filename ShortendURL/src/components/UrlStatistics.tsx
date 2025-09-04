import React, { useState, useEffect } from 'react';
import {
  Paper,
  Typography,
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  IconButton,
  Alert,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  List,
  ListItem,
  ListItemText,
  Divider
} from '@mui/material';
import { Visibility, Delete, Analytics, Schedule, Link as LinkIcon } from '@mui/icons-material';
import { UrlData, ClickData } from '../types/url';
import { urlService } from '../services/urlService';
import { logger } from '../middleware/logger';

export const UrlStatistics: React.FC = () => {
  const [urls, setUrls] = useState<UrlData[]>([]);
  const [selectedUrl, setSelectedUrl] = useState<UrlData | null>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);

  useEffect(() => {
    loadUrls();
  }, []);

  const loadUrls = () => {
    const allUrls = urlService.getAllUrls();
    setUrls(allUrls);
    logger.info('Loaded URLs for statistics', { count: allUrls.length });
  };

  const handleDelete = (id: string) => {
    try {
      urlService.deleteUrl(id);
      loadUrls();
      logger.info('URL deleted from statistics', { id });
    } catch (error) {
      logger.error('Failed to delete URL', { id, error });
    }
  };

  const clearExpiredUrls = () => {
    urlService.clearExpiredUrls();
    loadUrls();
  };

  const showClickDetails = (url: UrlData) => {
    setSelectedUrl(url);
    setDetailsOpen(true);
  };

  const formatDateTime = (dateStr: string): string => {
    const date = new Date(dateStr);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
  };

  const getStatusColor = (url: UrlData): "error" | "success" | "warning" => {
    if (url.isExpired) return "error";
    if (url.clicks.length === 0) return "warning";
    return "success";
  };

  const getStatusText = (url: UrlData): string => {
    if (url.isExpired) return "Expired";
    if (url.clicks.length === 0) return "No clicks";
    return "Active";
  };

  const expiredCount = urls.filter(url => url.isExpired).length;

  return (
    <Box sx={{ maxWidth: 1200, mx: 'auto' }}>
      <Paper elevation={3} sx={{ p: 4 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Analytics sx={{ mr: 2, color: 'primary.main' }} />
            <Typography variant="h4" component="h1" fontWeight="bold">
              URL Statistics
            </Typography>
          </Box>
          
          {expiredCount > 0 && (
            <Button
              variant="outlined"
              color="warning"
              onClick={clearExpiredUrls}
              startIcon={<Delete />}
            >
              Clear {expiredCount} Expired URLs
            </Button>
          )}
        </Box>

        {urls.length === 0 ? (
          <Alert severity="info" icon={<LinkIcon />}>
            No URLs have been created yet. Go to the URL Shortener page to create your first short link.
          </Alert>
        ) : (
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell><strong>Short Code</strong></TableCell>
                  <TableCell><strong>Original URL</strong></TableCell>
                  <TableCell><strong>Created</strong></TableCell>
                  <TableCell><strong>Expires</strong></TableCell>
                  <TableCell><strong>Status</strong></TableCell>
                  <TableCell><strong>Clicks</strong></TableCell>
                  <TableCell><strong>Actions</strong></TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {urls.map((url) => (
                  <TableRow key={url.id} hover>
                    <TableCell>
                      <Typography variant="body2" fontFamily="monospace" color="primary.main">
                        {url.shortCode}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography 
                        variant="body2" 
                        sx={{ 
                          maxWidth: 300, 
                          overflow: 'hidden', 
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap'
                        }}
                      >
                        {url.originalUrl}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {formatDateTime(url.createdAt)}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {formatDateTime(url.expiresAt)}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={getStatusText(url)}
                        color={getStatusColor(url)}
                        size="small"
                        variant="outlined"
                      />
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={url.clicks.length}
                        color="info"
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', gap: 1 }}>
                        <Tooltip title="View click details">
                          <IconButton
                            size="small"
                            onClick={() => showClickDetails(url)}
                            disabled={url.clicks.length === 0}
                          >
                            <Visibility />
                          </IconButton>
                        </Tooltip>
                        
                        <Tooltip title="Delete URL">
                          <IconButton
                            size="small"
                            onClick={() => handleDelete(url.id)}
                            color="error"
                          >
                            <Delete />
                          </IconButton>
                        </Tooltip>
                      </Box>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Paper>

      <Dialog
        open={detailsOpen}
        onClose={() => setDetailsOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          Click Analytics for {selectedUrl?.shortCode}
        </DialogTitle>
        <DialogContent>
          {selectedUrl && (
            <Box>
              <Typography variant="h6" gutterBottom>
                URL Details
              </Typography>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                <strong>Original:</strong> {selectedUrl.originalUrl}
              </Typography>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                <strong>Short:</strong> {selectedUrl.shortUrl}
              </Typography>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                <strong>Total Clicks:</strong> {selectedUrl.clicks.length}
              </Typography>
              
              <Divider sx={{ my: 2 }} />
              
              <Typography variant="h6" gutterBottom>
                Click History
              </Typography>
              
              {selectedUrl.clicks.length === 0 ? (
                <Alert severity="info">No clicks recorded yet.</Alert>
              ) : (
                <List>
                  {selectedUrl.clicks.map((click, index) => (
                    <ListItem key={click.id} divider={index < selectedUrl.clicks.length - 1}>
                      <ListItemText
                        primary={`Click ${index + 1}`}
                        secondary={
                          <Box>
                            <Typography variant="body2">
                              <strong>Time:</strong> {formatDateTime(click.timestamp)}
                            </Typography>
                            <Typography variant="body2">
                              <strong>Source:</strong> {click.source}
                            </Typography>
                            <Typography variant="body2">
                              <strong>Location:</strong> {click.location}
                            </Typography>
                            <Typography variant="body2" sx={{ fontSize: '0.75rem', color: 'text.secondary' }}>
                              <strong>User Agent:</strong> {click.userAgent}
                            </Typography>
                          </Box>
                        }
                      />
                    </ListItem>
                  ))}
                </List>
              )}
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDetailsOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};