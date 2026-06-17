const FALLBACK_API_URL = 'http://localhost:3000';

export const env = {
  apiUrl: process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, '') ?? FALLBACK_API_URL,
};
