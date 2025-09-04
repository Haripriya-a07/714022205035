import { UrlData, CreateUrlRequest, ClickData } from '../types/url';
import { logger } from '../middleware/logger';

class UrlService {
  private readonly STORAGE_KEY = 'shortened-urls';
  private readonly BASE_URL = window.location.origin;

  generateShortCode(): string {
    const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    for (let i = 0; i < 6; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  }

  validateUrl(url: string): boolean {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  }

  validateShortCode(code: string): boolean {
    const regex = /^[a-zA-Z0-9]{3,20}$/;
    return regex.test(code);
  }

  isShortCodeTaken(code: string): boolean {
    const urls = this.getAllUrls();
    return urls.some(url => url.shortCode === code);
  }

  createShortUrl(request: CreateUrlRequest): UrlData {
    logger.info('Creating short URL', { originalUrl: request.originalUrl });

    if (!this.validateUrl(request.originalUrl)) {
      const error = 'Invalid URL format';
      logger.error(error, { url: request.originalUrl });
      throw new Error(error);
    }

    let shortCode = request.customShortCode;
    
    if (shortCode) {
      if (!this.validateShortCode(shortCode)) {
        const error = 'Invalid shortcode format. Use 3-20 alphanumeric characters only.';
        logger.error(error, { shortCode });
        throw new Error(error);
      }
      
      if (this.isShortCodeTaken(shortCode)) {
        const error = 'Shortcode already exists. Please choose a different one.';
        logger.error(error, { shortCode });
        throw new Error(error);
      }
    } else {
      do {
        shortCode = this.generateShortCode();
      } while (this.isShortCodeTaken(shortCode));
    }

    const validityMinutes = request.validityMinutes || 30;
    const now = new Date();
    const expiresAt = new Date(now.getTime() + validityMinutes * 60000);

    const urlData: UrlData = {
      id: crypto.randomUUID(),
      originalUrl: request.originalUrl,
      shortCode,
      shortUrl: `${this.BASE_URL}/${shortCode}`,
      createdAt: now.toISOString(),
      expiresAt: expiresAt.toISOString(),
      validityMinutes,
      clicks: [],
      isExpired: false
    };

    this.saveUrl(urlData);
    logger.info('Short URL created successfully', { shortCode, originalUrl: request.originalUrl });
    
    return urlData;
  }

  createMultipleUrls(requests: CreateUrlRequest[]): UrlData[] {
    const results: UrlData[] = [];
    const errors: string[] = [];

    for (let i = 0; i < requests.length; i++) {
      try {
        const result = this.createShortUrl(requests[i]);
        results.push(result);
      } catch (error) {
        errors.push(`URL ${i + 1}: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    }

    if (errors.length > 0) {
      logger.warn('Some URLs failed to process', { errors });
      throw new Error(errors.join('\n'));
    }

    return results;
  }

  getAllUrls(): UrlData[] {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      if (!stored) return [];
      
      const urls: UrlData[] = JSON.parse(stored);
      return urls.map(url => ({
        ...url,
        isExpired: new Date() > new Date(url.expiresAt)
      }));
    } catch (error) {
      logger.error('Failed to retrieve URLs from storage', { error });
      return [];
    }
  }

  getUrlByShortCode(shortCode: string): UrlData | null {
    const urls = this.getAllUrls();
    return urls.find(url => url.shortCode === shortCode) || null;
  }

  trackClick(shortCode: string, source: string = 'direct'): void {
    const urls = this.getAllUrls();
    const urlIndex = urls.findIndex(url => url.shortCode === shortCode);
    
    if (urlIndex === -1) {
      logger.warn('Attempted to track click for non-existent URL', { shortCode });
      return;
    }

    const clickData: ClickData = {
      id: crypto.randomUUID(),
      timestamp: new Date().toISOString(),
      source,
      userAgent: navigator.userAgent,
      location: this.getApproximateLocation(),
      ipAddress: 'xxx.xxx.xxx.xxx' // Simulated for client-side
    };

    urls[urlIndex].clicks.push(clickData);
    this.saveAllUrls(urls);
    
    logger.info('Click tracked', { shortCode, source, clickId: clickData.id });
  }

  private getApproximateLocation(): string {
    // Simulate geolocation for demo purposes
    const locations = [
      'San Francisco, CA',
      'New York, NY',
      'Los Angeles, CA',
      'Chicago, IL',
      'Seattle, WA',
      'Boston, MA',
      'Austin, TX',
      'Denver, CO'
    ];
    return locations[Math.floor(Math.random() * locations.length)];
  }

  private saveUrl(url: UrlData): void {
    const urls = this.getAllUrls();
    urls.push(url);
    this.saveAllUrls(urls);
  }

  private saveAllUrls(urls: UrlData[]): void {
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(urls));
    } catch (error) {
      logger.error('Failed to save URLs to storage', { error });
      throw new Error('Failed to save URL data');
    }
  }

  deleteUrl(id: string): void {
    const urls = this.getAllUrls();
    const filteredUrls = urls.filter(url => url.id !== id);
    this.saveAllUrls(filteredUrls);
    logger.info('URL deleted', { id });
  }

  clearExpiredUrls(): void {
    const urls = this.getAllUrls();
    const validUrls = urls.filter(url => !url.isExpired);
    this.saveAllUrls(validUrls);
    logger.info('Expired URLs cleared', { removedCount: urls.length - validUrls.length });
  }
}

export const urlService = new UrlService();