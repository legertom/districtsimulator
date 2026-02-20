export function isGoogleProviderEnabled() {
    const { GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET } = process.env;
    return !!(
        GOOGLE_CLIENT_ID &&
        GOOGLE_CLIENT_SECRET &&
        GOOGLE_CLIENT_ID !== "YOUR_GOOGLE_CLIENT_ID" &&
        GOOGLE_CLIENT_SECRET !== "YOUR_GOOGLE_CLIENT_SECRET" &&
        GOOGLE_CLIENT_ID !== "placeholder_id" &&
        GOOGLE_CLIENT_SECRET !== "placeholder_secret"
    );
}
