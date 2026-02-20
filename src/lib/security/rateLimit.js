import { ENV } from './env';
import { logSecurityEvent } from './audit';

const loginAttempts = new Map();

export function isRateLimited(identifier) {
    if (process.env.NODE_ENV === 'test') return false;

    const now = Date.now();
    const attempts = loginAttempts.get(identifier) || [];
    const windowMs = ENV.AUTH_RATE_LIMIT_WINDOW_MS;
    const maxAttempts = ENV.AUTH_MAX_ATTEMPTS;

    const recentAttempts = attempts.filter(time => now - time < windowMs);

    if (recentAttempts.length >= maxAttempts) {
        logSecurityEvent('rate-limit-triggered', { identifier });
        return true;
    }

    recentAttempts.push(now);
    loginAttempts.set(identifier, recentAttempts);
    return false;
}

export function clearRateLimit(identifier) {
    loginAttempts.delete(identifier);
}
