const TIMEZONE_SUFFIX_PATTERN = /(Z|[+-]\d{2}:?\d{2})$/i;
const MYSQL_TIMESTAMP_PATTERN =
  /^\d{4}-\d{2}-\d{2}[ T]\d{2}:\d{2}:\d{2}(?:\.\d+)?$/;
const NUMERIC_TIMESTAMP_PATTERN = /^\d+(?:\.\d+)?$/;

export function parseApiTimestamp(value, fallback = Date.now()) {
  if (!value) {
    return fallback;
  }

  if (typeof value === "number") {
    return Number.isFinite(value) ? value : fallback;
  }

  if (value instanceof Date) {
    const timestamp = value.getTime();
    return Number.isNaN(timestamp) ? fallback : timestamp;
  }

  const rawValue = String(value).trim();
  if (NUMERIC_TIMESTAMP_PATTERN.test(rawValue)) {
    const numericTimestamp = Number(rawValue);
    if (Number.isFinite(numericTimestamp)) {
      return numericTimestamp < 1000000000000
        ? numericTimestamp * 1000
        : numericTimestamp;
    }
  }

  const normalizedValue =
    MYSQL_TIMESTAMP_PATTERN.test(rawValue) &&
    !TIMEZONE_SUFFIX_PATTERN.test(rawValue)
      ? `${rawValue.replace(" ", "T")}Z`
      : rawValue;

  const timestamp = new Date(normalizedValue).getTime();
  return Number.isNaN(timestamp) ? fallback : timestamp;
}
