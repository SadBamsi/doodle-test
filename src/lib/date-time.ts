type DateInput = string | Date;

export function toIsoTimestamp(value: DateInput): string | null {
  const parsed = new Date(value);

  if (Number.isNaN(parsed.getTime())) {
    return null;
  }

  return parsed.toISOString();
}

export function toIsoTimestampOrNow(value: DateInput): string {
  return toIsoTimestamp(value) ?? new Date().toISOString();
}

export function parseIsoTimestamp(
  rawValue: string | undefined,
): string | undefined {
  if (!rawValue) {
    return undefined;
  }

  const normalized = rawValue.trim();

  if (normalized.length === 0) {
    return undefined;
  }

  return toIsoTimestamp(normalized) ?? undefined;
}

export function parseIsoTimestampOrThrow(
  rawValue: string | undefined,
  fieldName: string,
): string | undefined {
  const parsed = parseIsoTimestamp(rawValue);

  if (rawValue && rawValue.trim().length > 0 && !parsed) {
    throw new Error(`${fieldName} must be a valid ISO 8601 timestamp.`);
  }

  return parsed;
}

export function formatDateTime(value: DateInput, locale = "ru-RU"): string {
  const parsed = new Date(value);

  if (Number.isNaN(parsed.getTime())) {
    return String(value);
  }

  return new Intl.DateTimeFormat(locale, {
    dateStyle: "short",
    timeStyle: "short",
  }).format(parsed);
}

export function formatDateTimeLocalInput(value: string | undefined): string {
  const parsedIso = parseIsoTimestamp(value);

  if (!parsedIso) {
    return "";
  }

  const parsed = new Date(parsedIso);

  const year = parsed.getFullYear();
  const month = String(parsed.getMonth() + 1).padStart(2, "0");
  const day = String(parsed.getDate()).padStart(2, "0");
  const hours = String(parsed.getHours()).padStart(2, "0");
  const minutes = String(parsed.getMinutes()).padStart(2, "0");

  return `${year}-${month}-${day}T${hours}:${minutes}`;
}
