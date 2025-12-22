export function replaceBigIntWithNumber<T>(value: T): T {
  if (typeof value === "bigint") {
    return Number(value) as unknown as T;
  }

  if (Array.isArray(value)) {
    return value.map((item) => replaceBigIntWithNumber(item)) as unknown as T;
  }

  if (value && typeof value === "object") {
    const result: Record<string, unknown> = {};
    for (const [key, val] of Object.entries(value as Record<string, unknown>)) {
      result[key] = replaceBigIntWithNumber(val);
    }
    return result as T;
  }

  return value;
}

