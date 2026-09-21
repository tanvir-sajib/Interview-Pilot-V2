import { Request, Response, NextFunction } from "express";
import { v4 as uuidv4 } from "uuid";

export class CorrelationIdMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    const correlationId = req.headers["x-correlation-id"] as string | undefined || uuidv4();
    res.setHeader("x-correlation-id", correlationId);
    (req as any).correlationId = correlationId;
    next();
  }
}
