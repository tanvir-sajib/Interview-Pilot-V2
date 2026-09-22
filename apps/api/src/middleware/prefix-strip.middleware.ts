import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

/**
 * Middleware to strip the global API prefix ("/api/v1") from incoming request URLs.
 * This allows the Nest application to work both with and without a global prefix set
 * (e.g., during e2e tests where the prefix is not applied).
 */
@Injectable()
export class PrefixStripMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    // Only modify the URL if it starts with the expected prefix.
    if (req.url.startsWith('/api/v1')) {
      req.url = req.url.replace(/^\/api\/v1/, '') || '/';
    }
    next();
  }
}
