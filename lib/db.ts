import { PrismaClient } from "@prisma/client";

declare global {
  var prisma: PrismaClient | undefined;
};

const prisma = globalThis.prisma || new PrismaClient();

if (!globalThis.prisma) {
  prisma.$use(async (params, next) => {
    const result = await next(params);
    const keepPassword =
      params.model === "Profile" && params.args?.select?.password === true;

    if (keepPassword) {
      return result;
    }

    const omitPassword = (value: unknown): unknown => {
      if (!value || typeof value !== "object") {
        return value;
      }

      if (value instanceof Date) {
        return value;
      }

      if (Array.isArray(value)) {
        return value.map(omitPassword);
      }

      const record = value as Record<string, unknown>;
      const nextValue: Record<string, unknown> = {};

      for (const [key, nested] of Object.entries(record)) {
        if (key === "password") {
          continue;
        }

        nextValue[key] = omitPassword(nested);
      }

      return nextValue;
    };

    return omitPassword(result);
  });
}

export const db = prisma;

if (process.env.NODE_ENV !== "production") globalThis.prisma = db
