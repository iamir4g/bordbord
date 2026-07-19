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

async function sendViaIppanel(payload: SmsPayload) {
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
    strapi.log.error(
      `[otp:ippanel] send failed phone=${payload.phone} detail=${detail} errors=${JSON.stringify(body?.meta?.errors ?? {})}`,
    );
    throw new Error(`ippanel SMS send failed: ${detail}`);
  }

  const outboxIds = body.data?.message_outbox_ids ?? [];
  strapi.log.info(
    `[otp:ippanel] sent phone=${payload.phone} outboxIds=${outboxIds.join(",")}`,
  );

  return { provider: "ippanel" as const, accepted: true as const, outboxIds };
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
