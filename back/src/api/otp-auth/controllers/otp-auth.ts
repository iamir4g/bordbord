function getStringField(body: Record<string, unknown>, key: string) {
  const value = body[key];
  return typeof value === "string" ? value : "";
}

export default {
  async sendCode(ctx: any) {
    const body = (ctx.request.body ?? {}) as Record<string, unknown>;
    const phone = getStringField(body, "phone");

    const service = strapi.service("api::otp-auth.otp-auth");
    const result = await service.sendCode(phone, ctx);

    if (!result.ok) {
      return ctx.throw(result.status, result.message);
    }

    ctx.body = result.data;
  },

  async verifyCode(ctx: any) {
    const body = (ctx.request.body ?? {}) as Record<string, unknown>;
    const phone = getStringField(body, "phone");
    const code = getStringField(body, "code");

    const service = strapi.service("api::otp-auth.otp-auth");
    const result = await service.verifyCode(phone, code);

    if (!result.ok) {
      ctx.status = result.status;
      ctx.body = {
        error: result.message,
        ...(typeof result.remainingAttempts === "number"
          ? { remainingAttempts: result.remainingAttempts }
          : {}),
      };
      return;
    }

    ctx.body = result.data;
  },

  async setPassword(ctx: any) {
    const userId = ctx.state?.user?.id;
    if (typeof userId !== "number") {
      return ctx.unauthorized();
    }

    const body = (ctx.request.body ?? {}) as Record<string, unknown>;
    const password = getStringField(body, "password");

    const service = strapi.service("api::otp-auth.otp-auth");
    const result = await service.setPassword(userId, password);

    if (!result.ok) {
      ctx.status = result.status;
      ctx.body = { error: result.message };
      return;
    }

    ctx.body = result.data;
  },
};
