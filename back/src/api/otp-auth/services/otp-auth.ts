import crypto from "crypto";

import {
  sendOtpSms,
  shouldExposeDebugCode,
} from "../../../utils/otp-sms-provider";

type OtpPurpose = "auth";

type OtpRecord = {
  id: number;
  phone?: string;
  purpose?: OtpPurpose;
  codeHash?: string;
  attempts?: number;
  expiresAt?: string;
  resendAvailableAt?: string;
  consumedAt?: string | null;
  lastSentAt?: string;
  ipAddress?: string | null;
  user?: { id?: number } | null;
};

type UserEntity = {
  id: number;
  username?: string;
  email?: string;
  blocked?: boolean;
  confirmed?: boolean;
};

const OTP_REQUEST_UID = "api::otp-request.otp-request";
const USER_UID = "plugin::users-permissions.user";
const ROLE_UID = "plugin::users-permissions.role";
const AUTH_PURPOSE: OtpPurpose = "auth";

function getNumericEnv(key: string, fallback: number) {
  const raw = process.env[key];
  const value = raw ? Number(raw) : NaN;
  return Number.isFinite(value) && value > 0 ? value : fallback;
}

function getOtpConfig() {
  return {
    expiresInSeconds: getNumericEnv("OTP_EXPIRES_SECONDS", 120),
    resendIntervalSeconds: getNumericEnv("OTP_RESEND_SECONDS", 60),
    maxAttempts: getNumericEnv("OTP_MAX_ATTEMPTS", 5),
  };
}

function toEnglishDigits(value: string) {
  return value.replace(/[۰-۹]/g, (digit) =>
    String("۰۱۲۳۴۵۶۷۸۹".indexOf(digit)),
  );
}

function normalizePhone(phone: string) {
  const english = toEnglishDigits(phone).replace(/\D/g, "");
  if (!english) return null;

  let normalized = english;
  if (normalized.startsWith("0098")) normalized = `0${normalized.slice(4)}`;
  if (normalized.startsWith("98") && normalized.length === 12) {
    normalized = `0${normalized.slice(2)}`;
  }
  if (normalized.startsWith("9") && normalized.length === 10) {
    normalized = `0${normalized}`;
  }

  if (!/^09\d{9}$/.test(normalized)) return null;

  return {
    local: normalized,
    e164: `+98${normalized.slice(1)}`,
  };
}

function generateOtpCode() {
  return String(crypto.randomInt(1000, 10000));
}

function hashOtp(phone: string, code: string) {
  const pepper =
    process.env.OTP_HASH_SECRET || process.env.JWT_SECRET || "otp-dev-secret";
  return crypto
    .createHash("sha256")
    .update(`${phone}:${code}:${pepper}`)
    .digest("hex");
}

function safeEqual(a: string, b: string) {
  const left = Buffer.from(a);
  const right = Buffer.from(b);
  if (left.length !== right.length) return false;
  return crypto.timingSafeEqual(left, right);
}

function createSyntheticEmail(phone: string) {
  return `${phone}@otp.local`;
}

function createDefaultUsername(phone: string) {
  return phone;
}

function getRequestIp(ctx: any) {
  return (
    ctx.request?.ip ||
    ctx.request?.header?.["x-forwarded-for"] ||
    ctx.request?.header?.["x-real-ip"] ||
    null
  );
}

async function getAuthenticatedRoleId() {
  const role = await strapi.db.query(ROLE_UID).findOne({
    where: { type: "authenticated" },
    select: ["id"],
  });

  const roleId = (role as { id?: number } | null)?.id;
  if (typeof roleId !== "number") {
    throw new Error("Authenticated role is missing.");
  }

  return roleId;
}

async function findUserByPhone(phone: string) {
  const user = await strapi.db.query(USER_UID).findOne({
    where: {
      $or: [{ username: phone }, { email: createSyntheticEmail(phone) }],
    },
  });

  return (user as UserEntity | null) ?? null;
}

async function createUserForPhone(phone: string) {
  const userService = strapi.plugin("users-permissions").service("user");
  const roleId = await getAuthenticatedRoleId();

  const created = await userService.add({
    username: createDefaultUsername(phone),
    email: createSyntheticEmail(phone),
    password: crypto.randomBytes(24).toString("hex"),
    provider: "local",
    confirmed: true,
    blocked: false,
    role: roleId,
  });

  return created as UserEntity;
}

async function findOrCreateUserByPhone(phone: string) {
  const existing = await findUserByPhone(phone);
  if (existing) return { user: existing, isNewUser: false };
  const created = await createUserForPhone(phone);
  return { user: created, isNewUser: true };
}

async function getLatestOtpRecord(phone: string, purpose: OtpPurpose) {
  const records = await strapi.db.query(OTP_REQUEST_UID).findMany({
    where: {
      phone,
      purpose,
      consumedAt: null,
    },
    orderBy: {
      createdAt: "desc",
    },
    limit: 1,
    populate: {
      user: true,
    },
  });

  return (Array.isArray(records) ? records[0] : null) as OtpRecord | null;
}

function getCooldownSeconds(record: OtpRecord | null) {
  const resendAt = record?.resendAvailableAt
    ? new Date(record.resendAvailableAt)
    : null;
  if (!resendAt) return 0;
  return Math.max(0, Math.ceil((resendAt.getTime() - Date.now()) / 1000));
}

async function issueJwtForUser(userId: number) {
  const jwtService = strapi.plugin("users-permissions").service("jwt");
  return await jwtService.issue({ id: userId });
}

function validatePassword(password: string) {
  if (password.length < 8) {
    return "رمز عبور باید حداقل ۸ کاراکتر باشد.";
  }

  return null;
}

export default () => ({
  normalizePhone,

  async sendCode(rawPhone: string, ctx: any) {
    const normalized = normalizePhone(rawPhone);
    if (!normalized) {
      return {
        ok: false as const,
        status: 400,
        message: "شماره موبایل معتبر نیست.",
      };
    }

    const latest = await getLatestOtpRecord(normalized.local, AUTH_PURPOSE);
    const cooldownSeconds = getCooldownSeconds(latest);
    if (cooldownSeconds > 0) {
      return {
        ok: false as const,
        status: 429,
        message: `لطفا ${cooldownSeconds} ثانیه دیگر دوباره تلاش کنید.`,
        cooldownSeconds,
      };
    }

    const config = getOtpConfig();
    const code = generateOtpCode();
    const now = new Date();
    const expiresAt = new Date(now.getTime() + config.expiresInSeconds * 1000);
    const resendAvailableAt = new Date(
      now.getTime() + config.resendIntervalSeconds * 1000,
    );

    await strapi.db.query(OTP_REQUEST_UID).create({
      data: {
        phone: normalized.local,
        purpose: AUTH_PURPOSE,
        codeHash: hashOtp(normalized.local, code),
        attempts: 0,
        expiresAt,
        resendAvailableAt,
        lastSentAt: now,
        ipAddress: getRequestIp(ctx),
      },
    });

    await sendOtpSms({
      phone: normalized.e164,
      code,
      message: `کد ورود شما: ${code}`,
    });

    return {
      ok: true as const,
      status: 200,
      data: {
        phone: normalized.local,
        expiresInSeconds: config.expiresInSeconds,
        resendInSeconds: config.resendIntervalSeconds,
        ...(shouldExposeDebugCode() ? { debugCode: code } : {}),
      },
    };
  },

  async verifyCode(rawPhone: string, rawCode: string) {
    const normalized = normalizePhone(rawPhone);
    if (!normalized) {
      return {
        ok: false as const,
        status: 400,
        message: "شماره موبایل معتبر نیست.",
      };
    }

    const code = toEnglishDigits(rawCode).replace(/\D/g, "");
    if (!/^\d{4}$/.test(code)) {
      return {
        ok: false as const,
        status: 400,
        message: "کد تایید باید ۴ رقمی باشد.",
      };
    }

    const record = await getLatestOtpRecord(normalized.local, AUTH_PURPOSE);
    if (!record?.id || !record.codeHash) {
      return {
        ok: false as const,
        status: 404,
        message: "درخواست OTP فعالی برای این شماره پیدا نشد.",
      };
    }

    const config = getOtpConfig();
    const attempts = typeof record.attempts === "number" ? record.attempts : 0;
    if (attempts >= config.maxAttempts) {
      return {
        ok: false as const,
        status: 429,
        message: "تعداد تلاش‌های مجاز به پایان رسیده است. دوباره کد بگیرید.",
      };
    }

    const expiresAt = record.expiresAt ? new Date(record.expiresAt) : null;
    if (
      !expiresAt ||
      Number.isNaN(expiresAt.getTime()) ||
      expiresAt.getTime() < Date.now()
    ) {
      return {
        ok: false as const,
        status: 410,
        message: "کد تایید منقضی شده است. دوباره کد بگیرید.",
      };
    }

    const isValid = safeEqual(record.codeHash, hashOtp(normalized.local, code));

    if (!isValid) {
      await strapi.db.query(OTP_REQUEST_UID).update({
        where: { id: record.id },
        data: {
          attempts: attempts + 1,
        },
      });

      return {
        ok: false as const,
        status: 400,
        message: "کد تایید درست نیست.",
        remainingAttempts: Math.max(0, config.maxAttempts - attempts - 1),
      };
    }

    const { user, isNewUser } = await findOrCreateUserByPhone(normalized.local);
    if (!user?.id) {
      throw new Error("Could not create or load user for OTP login.");
    }

    if (user.blocked) {
      return {
        ok: false as const,
        status: 403,
        message: "این حساب کاربری مسدود شده است.",
      };
    }

    await strapi.db.query(OTP_REQUEST_UID).update({
      where: { id: record.id },
      data: {
        consumedAt: new Date(),
        attempts: attempts + 1,
        user: user.id,
      },
    });

    const jwt = await issueJwtForUser(user.id);

    return {
      ok: true as const,
      status: 200,
      data: {
        jwt,
        isNewUser,
        user: {
          id: user.id,
          username: user.username ?? createDefaultUsername(normalized.local),
          email: user.email ?? createSyntheticEmail(normalized.local),
          phone: normalized.local,
        },
      },
    };
  },

  async setPassword(userId: number, password: string) {
    const validationError = validatePassword(password);
    if (validationError) {
      return {
        ok: false as const,
        status: 400,
        message: validationError,
      };
    }

    const userService = strapi.plugin("users-permissions").service("user");
    const existing = await strapi.db.query(USER_UID).findOne({
      where: { id: userId },
      select: ["id"],
    });

    if (!existing) {
      return {
        ok: false as const,
        status: 404,
        message: "کاربر پیدا نشد.",
      };
    }

    await userService.edit(userId, { password });

    return {
      ok: true as const,
      status: 200,
      data: {
        ok: true,
        message: "رمز عبور با موفقیت ذخیره شد.",
      },
    };
  },
});
