import type { Core } from '@strapi/strapi';

const config = ({ env }: Core.Config.Shared.ConfigParams): Core.Config.Server => {
  const rawAppKeys =
    env('APP_KEYS', '') || env('ADMIN_JWT_SECRET', '') || env('JWT_SECRET', '');

  return {
    host: env('HOST', '0.0.0.0'),
    port: env.int('PORT', 1337),
    app: {
      keys: rawAppKeys
        .split(',')
        .map((item) => item.trim())
        .filter(Boolean),
    },
  };
};

export default config;
