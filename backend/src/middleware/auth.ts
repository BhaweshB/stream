import { Request, Response, NextFunction } from 'express';
import config from '../config';

export const apiKeyAuth = (req: Request, res: Response, next: NextFunction) => {
  const apiKey = req.headers['x-api-key'] || req.query.apiKey;

  if (config.nodeEnv === 'development') {
    // Skip auth in development
    return next();
  }

  if (!apiKey || apiKey !== config.security.apiKey) {
    return res.status(401).json({
      success: false,
      error: 'Unauthorized - Invalid API key',
    });
  }

  next();
};
