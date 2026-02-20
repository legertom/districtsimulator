export function logSecurityEvent(eventName, data) {
    if (process.env.NODE_ENV === 'test') {
        return; // Avoid noisy logs in test environments
    }

    // Lightweight structured logging
    console.log(JSON.stringify({
        timestamp: new Date().toISOString(),
        type: 'SECURITY_AUDIT',
        event: eventName,
        ...data
    }));
}
