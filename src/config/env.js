const configuredApiUrl = process.env.EXPO_PUBLIC_API_URL;

if (!configuredApiUrl) {
  throw new Error("Missing EXPO_PUBLIC_API_URL. Add it to the .env file.");
}

export const API_BASE_URL = configuredApiUrl.endsWith("/")
  ? configuredApiUrl
  : `${configuredApiUrl}/`;
