const apiBaseUrl = import.meta.env.VITE_API_BASE_URL;

if (import.meta.env.PROD && !apiBaseUrl) {
  throw new Error('Missing required environment variable: VITE_API_BASE_URL');
}

const rawClientUrl = import.meta.env.VITE_CLIENT_URL || (typeof window !== 'undefined' ? window.location.origin : 'http://localhost:5173');

export const env = {
  apiBaseUrl: apiBaseUrl || 'http://localhost:3000',
  clientUrl: rawClientUrl.replace(/\/+$/, '')
};
