export function getNumericEnv(key, defaultValue) {
    const val = process.env[key];
    if (!val) return defaultValue;
    const parsed = parseInt(val, 10);
    if (isNaN(parsed) || parsed <= 0) return defaultValue;
    return parsed;
}

export const ENV = {
    get AUTH_RATE_LIMIT_WINDOW_MS() {
        return getNumericEnv('AUTH_RATE_LIMIT_WINDOW_MS', 15 * 60 * 1000);
    },
    get AUTH_MAX_ATTEMPTS() {
        return getNumericEnv('AUTH_MAX_ATTEMPTS', 5);
    },
    validateAuthSecret() {
        if (process.env.NODE_ENV === 'production') {
            const secret = process.env.NEXTAUTH_SECRET || process.env.AUTH_SECRET;
            if (!secret || secret.length < 32) {
                throw new Error("CRITICAL: NEXTAUTH_SECRET is weakly configured or missing in production.");
            }
        }
    }
};
