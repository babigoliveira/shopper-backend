export const GEMINI_API_KEY = process.env.GEMINI_API_KEY ?? '';

export const MONGODB_CONNECTION_URI =
  process.env.MONGODB_CONNECTION_URI ?? 'mongodb://admin:admin@localhost';

export const PORT = parseInt(process.env.PORT ?? '3000');
