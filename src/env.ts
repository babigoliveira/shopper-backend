export const GEMINI_API_KEY = process.env.GEMINI_API_KEY ?? '';

export const GEMINI_GENERATIVE_MODEL_VERSION =
  process.env.GEMINI_GENERATIVE_MODEL_VERSION ?? 'gemini-1.5-pro';

export const MONGODB_CONNECTION_URI =
  process.env.MONGODB_CONNECTION_URI ?? 'mongodb://admin:admin@localhost';

export const PORT = parseInt(process.env.PORT ?? '3000');
