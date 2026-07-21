type SmsPayload = {
  phone: string;
  code: string;
  message: string;
};

type IppanelResponse = {
  data?: { message_outbox_ids?: number[] } | null;
  meta?: {
    status?: boolean;
    message?: string;
    message_code?: string;
    errors?: Record<string, unknown>;
  };
};

const IPPANEL_SEND_URL = "https://edge.ippanel.com/v1/api/send";

function getProvider() {
  return process.env.OTP_SMS_PROVIDER?.trim().toLowerCase() || "mock";
}

function getRequiredEnv(key: string) {
  const value = process.env[key]?.trim();
  if (!value) {
    throw new Error(`Missing required env var "${key}" for ippanel SMS provider.`);
  }
  return value;
}

function getSmsRetryConfig() {
  const maxAttempts = Number(process.env.OTP_SMS_MAX_RETRIES ?? "3");
  const delayMs = Number(process.env.OTP_SMS_RETRY_DELAY_MS ?? "1000");
  return {
    maxAttempts:
      Number.isFinite(maxAttempts) && maxAttempts > 0 ? maxAttempts : 3,
    delayMs: Number.isFinite(delayMs) && delayMs >= 0 ? delayMs : 1000,
  };
}

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function sendViaIppanelOnce(payload: SmsPayload) {
  const token = getRequiredEnv("IPPANEL_API_TOKEN");
  const patternCode = getRequiredEnv("IPPANEL_PATTERN_CODE");
  const fromNumber = getRequiredEnv("IPPANEL_FROM_NUMBER");
  const patternVariable = process.env.IPPANEL_PATTERN_VARIABLE?.trim() || "code";

  const response = await fetch(IPPANEL_SEND_URL, {
    method: "POST",
    headers: {
      Authorization: token,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      sending_type: "pattern",
      from_number: fromNumber,
      code: patternCode,
      recipients: [payload.phone],
      params: {
        [patternVariable]: payload.code,
      },
    }),
  });

  let body: IppanelResponse | null = null;
  try {
    body = (await response.json()) as IppanelResponse;
  } catch {
    // non-JSON body; handled by status check below
  }

  if (!response.ok || !body?.meta?.status) {
    const detail =
      body?.meta?.message || `HTTP ${response.status} ${response.statusText}`;
    throw new Error(`ippanel SMS send failed: ${detail}`);
  }

  const outboxIds = body.data?.message_outbox_ids ?? [];
  strapi.log.info(
    `[otp:ippanel] sent phone=${payload.phone} outboxIds=${outboxIds.join(",")}`,
  );

  return { provider: "ippanel" as const, accepted: true as const, outboxIds };
}

async function sendViaIppanel(payload: SmsPayload) {
  const { maxAttempts, delayMs } = getSmsRetryConfig();
  let lastError: unknown = null;

  for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
    try {
      return await sendViaIppanelOnce(payload);
    } catch (error) {
      lastError = error;
      const detail =
        error instanceof Error ? error.message : "Unknown ippanel error";
      strapi.log.warn(
        `[otp:ippanel] attempt ${attempt}/${maxAttempts} failed phone=${payload.phone} detail=${detail}`,
      );

      if (attempt < maxAttempts) {
        await sleep(delayMs * attempt);
      }
    }
  }

  strapi.log.error(
    `[otp:ippanel] all ${maxAttempts} attempts failed phone=${payload.phone}`,
    lastError,
  );
  throw lastError instanceof Error
    ? lastError
    : new Error("ippanel SMS send failed after retries.");
}

export async function sendOtpSms(payload: SmsPayload) {
  const provider = getProvider();

  if (provider === "mock") {
    strapi.log.info(
      `[otp:mock] phone=${payload.phone} code=${payload.code} message="${payload.message}"`,
    );
    return { provider, accepted: true as const };
  }

  if (provider === "ippanel") {
    return await sendViaIppanel(payload);
  }

  throw new Error(
    `Unknown OTP_SMS_PROVIDER "${provider}". Supported values: mock, ippanel.`,
  );
}

export function shouldExposeDebugCode() {
  return (
    process.env.NODE_ENV !== "production" &&
    process.env.OTP_DEBUG_EXPOSE_CODE === "true"
  );
}
