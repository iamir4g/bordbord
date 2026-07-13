import type { Core } from "@strapi/strapi";

const config = ({
  env,
}: Core.Config.Shared.ConfigParams): Core.Config.Admin => {
  // Liara envs are sometimes added incrementally; fall back to JWT_SECRET so
  // Strapi can boot while dedicated admin secrets are being configured.
  const sharedSecret = env("ADMIN_JWT_SECRET", env("JWT_SECRET", ""));

  return {
    auth: {
      secret: sharedSecret,
    },
    apiToken: {
      salt: env("API_TOKEN_SALT", sharedSecret),
    },
    transfer: {
      token: {
        salt: env("TRANSFER_TOKEN_SALT", sharedSecret),
      },
    },
    secrets: {
      encryptionKey: env("ENCRYPTION_KEY", sharedSecret),
    },
    flags: {
      nps: env.bool("FLAG_NPS", true),
      promoteEE: env.bool("FLAG_PROMOTE_EE", true),
    },
  };
};

export default config;
