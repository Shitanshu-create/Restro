const apiBaseUrl = import.meta.env.VITE_API_BASE_URL;

if (import.meta.env.PROD && !apiBaseUrl) {
  throw new Error('Missing required environment variable: VITE_API_BASE_URL');
}

const rawClientUrl = import.meta.env.VITE_CLIENT_URL;

export const env = {
  apiBaseUrl: apiBaseUrl,
  clientUrl: rawClientUrl
};


