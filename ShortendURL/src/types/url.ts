export interface UrlData {
  id: string;
  originalUrl: string;
  shortCode: string;
  shortUrl: string;
  createdAt: string;
  expiresAt: string;
  validityMinutes: number;
  clicks: ClickData[];
  isExpired: boolean;
}

export interface ClickData {
  id: string;
  timestamp: string;
  source: string;
  userAgent: string;
  location: string;
  ipAddress: string;
}

export interface CreateUrlRequest {
  originalUrl: string;
  validityMinutes?: number;
  customShortCode?: string;
}