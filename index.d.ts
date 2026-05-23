import type { Request, Response, NextFunction } from 'express';

export interface IpLimOptions {
    /** Milliseconds of timeout when limit is exceeded (default: 60000) */
    timeout?: number;
    /** Number of requests allowed within the window (default: 15) */
    limit?: number;
    /** Milliseconds of the window for counting requests (default: 60000) */
    window?: number;
    /** Array of paths to exclude from rate limiting (default: []) */
    exclude?: string[];
    /** HTTP status code to send when rate limit is exceeded (default: 429) */
    statusCode?: number;
    /** Message to send when rate limit is exceeded (default: "Too many requests") */
    message?: string;
    /** Whether to log detailed information about requests and rate limiting decisions (default: false) */
    verbose?: boolean;
}

export default function iplim(
    options?: IpLimOptions
): (req: Request, res: Response, next: NextFunction) => void;
