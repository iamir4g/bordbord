type SmsPayload = {
  phone: string;
  code: string;
  message: string;
};

function getProvider() {
  return process.env.OTP_SMS_PROVIDER?.trim().toLowerCase() || "mock";
}

export async function sendOtpSms(payload: SmsPayload) {
  const provider = getProvider();

  if (provider === "mock") {
    strapi.log.info(
      `[otp:mock] phone=${payload.phone} code=${payload.code} message="${payload.message}"`,
    );
    return { provider, accepted: true as const };
  }

  throw new Error(
    "OTP SMS provider is not configured yet. Set OTP_SMS_PROVIDER=mock for local testing or wire the real provider adapter.",
  );
}

export function shouldExposeDebugCode() {
  return (
    process.env.NODE_ENV !== "production" &&
    process.env.OTP_DEBUG_EXPOSE_CODE === "true"
  );
}
