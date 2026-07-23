const apiBaseUrl = import.meta.env.VITE_API_BASE_URL;

if (import.meta.env.PROD && !apiBaseUrl) {
  throw new Error('Missing required environment variable: VITE_API_BASE_URL');
}

export const env = {
  apiBaseUrl: apiBaseUrl || 'http://localhost:3000'
};
