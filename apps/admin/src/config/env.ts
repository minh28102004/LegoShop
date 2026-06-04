const FALLBACK_API_URL = 'http://localhost:3002';

export const env = {
  apiUrl: process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, '') ?? FALLBACK_API_URL,
};
