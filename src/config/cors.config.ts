export const corsConfig = {
  production: [
    // front end em produçao
    'https://escritorio-dnascimento.cloud',
    'https://www.escritorio-dnascimento.cloud',
  ],

  development: ['http://localhost:3001'],

  test: ['http://localhost:3001', 'http://127.0.0.1:3001'],
};
export function getAllowedOrigins(): string[] {
  const env = process.env.NODE_ENV || 'development';

  switch (env) {
    case 'production':
      return corsConfig.production;
    case 'test':
      return corsConfig.test;
    default:
      return corsConfig.development;
  }
}

export function isOriginAllowed(origin: string): boolean {
  const allowedOrigins = getAllowedOrigins();
  return allowedOrigins.includes(origin);
}
