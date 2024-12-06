import { env } from './env';

export const config = {
  initialSuperUserEmail: env.initialSuperUserEmail,
} as const;
