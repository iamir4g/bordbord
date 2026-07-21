import type { Core } from "@strapi/strapi";

const config = ({ env }: Core.Config.Shared.ConfigParams): Core.Config.Plugin => ({
  "users-permissions": {
    config: {
      register: {
        allowedFields: ["phone", "firstName", "lastName"],
      },
      jwt: {
        expiresIn: "30d",
      },
    },
  },
});

export default config;
