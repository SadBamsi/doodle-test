import "server-only";

import { parseIsoTimestampOrThrow, toIsoTimestamp } from "@/lib/date-time";
import {
  DEFAULT_API_BASE_URL,
  DEFAULT_LIMIT,
  MAX_LIMIT,
  MESSAGES_API_PATH,
  MIN_LIMIT,
} from "@/lib/constants";
import type {
  CreateMessageRequest,
  IGetMessagesRequest,
  IMessage,
  IMessagesPagination,
  IMessagesResult,
} from "@/types";

type UnknownRecord = Record<string, unknown>;

function isRecord(value: unknown): value is UnknownRecord {
  return typeof value === "object" && value !== null;
}

function readText(value: unknown): string | null {
  if (typeof value === "string") {
    return value;
  }

  if (typeof value === "number" || typeof value === "boolean") {
    return String(value);
  }

  return null;
}

function readNonEmptyText(value: unknown): string | null {
  const text = readText(value)?.trim();
  return text && text.length > 0 ? text : null;
}

function readInt(value: unknown): number | null {
  if (typeof value === "number" && Number.isFinite(value)) {
    return Math.trunc(value);
  }

  if (typeof value === "string") {
    const parsed = Number.parseInt(value, 10);
    if (Number.isFinite(parsed)) {
      return parsed;
    }
  }

  return null;
}

function clampLimit(value: number | null, fallback = DEFAULT_LIMIT): number {
  if (value === null || !Number.isFinite(value)) {
    return fallback;
  }

  if (value < MIN_LIMIT) {
    return MIN_LIMIT;
  }

  if (value > MAX_LIMIT) {
    return MAX_LIMIT;
  }

  return Math.floor(value);
}

function getApiBaseUrl(): string {
  return process.env.CHAT_API_BASE_URL?.trim() || DEFAULT_API_BASE_URL;
}

function getApiToken(): string {
  const token = process.env.CHAT_API_TOKEN?.trim();

  if (!token) {
    throw new Error("CHAT_API_TOKEN is missing. Add it to .env.local.");
  }

  return token;
}

function buildUrl(pathname: string, query?: Record<string, string>): string {
  const url = new URL(pathname, getApiBaseUrl());

  if (query) {
    for (const [key, value] of Object.entries(query)) {
      url.searchParams.set(key, value);
    }
  }

  return url.toString();
}

async function parsePayload(response: Response): Promise<unknown> {
  if (response.status === 204) {
    return null;
  }

  const contentType = response.headers.get("content-type")?.toLowerCase() || "";

  if (contentType.includes("application/json")) {
    return response.json();
  }

  const text = await response.text();
  return text.length > 0 ? text : null;
}

function parseErrorMessage(payload: unknown, fallback: string): string {
  if (typeof payload === "string") {
    const normalized = payload.trim();
    return normalized.length > 0 ? normalized : fallback;
  }

  if (!isRecord(payload)) {
    return fallback;
  }

  const directMessage = readNonEmptyText(payload.message);
  if (directMessage) {
    return directMessage;
  }

  const directError = readNonEmptyText(payload.error);
  if (directError) {
    return directError;
  }

  if (isRecord(payload.error)) {
    const nested = readNonEmptyText(payload.error.message);
    if (nested) {
      return nested;
    }
  }

  if (Array.isArray(payload.details)) {
    const detail = payload.details.find(
      (entry) => isRecord(entry) && readNonEmptyText(entry.msg),
    );
    if (isRecord(detail)) {
      const detailMessage = readNonEmptyText(detail.msg);
      if (detailMessage) {
        return detailMessage;
      }
    }
  }

  return fallback;
}

function pickMessages(payload: unknown): unknown[] {
  if (Array.isArray(payload)) {
    return payload;
  }

  if (!isRecord(payload)) {
    return [];
  }

  if (Array.isArray(payload.messages)) {
    return payload.messages;
  }

  if (Array.isArray(payload.data)) {
    return payload.data;
  }

  if (Array.isArray(payload.items)) {
    return payload.items;
  }

  return [];
}

function normalizeDate(value: unknown): string {
  const raw = readNonEmptyText(value);

  if (!raw) {
    return new Date().toISOString();
  }

  return toIsoTimestamp(raw) ?? new Date().toISOString();
}

function normalizeMessage(entry: unknown, index: number): IMessage | null {
  if (!isRecord(entry)) {
    return null;
  }

  const message = readNonEmptyText(
    entry.message ?? entry.text ?? entry.content,
  );
  const author = readNonEmptyText(
    entry.author ??
      entry.senderName ??
      (isRecord(entry.sender) ? entry.sender.name : undefined),
  );

  if (!message || !author) {
    return null;
  }

  const fallbackId = `message-${Date.now()}-${index}`;

  return {
    _id:
      readNonEmptyText(entry._id ?? entry.id ?? entry.messageId) || fallbackId,
    message,
    author,
    createdAt: normalizeDate(
      entry.createdAt ?? entry.created_at ?? entry.timestamp,
    ),
  };
}

function normalizePagination(
  payload: unknown,
  messages: IMessage[],
  limit: number,
  hasBeforeFilter: boolean,
  hasAfterFilter: boolean,
): IMessagesPagination {
  const newestTimestamp =
    messages.length > 0 ? toIsoTimestamp(messages[0].createdAt) : null;
  const oldestTimestamp =
    messages.length > 0
      ? toIsoTimestamp(messages[messages.length - 1].createdAt)
      : null;

  let hasOlder = messages.length >= limit;
  let hasNewer = hasBeforeFilter;

  if (isRecord(payload)) {
    const paginationSource = isRecord(payload.pagination)
      ? payload.pagination
      : payload;

    if (typeof paginationSource.hasNextPage === "boolean") {
      hasOlder = paginationSource.hasNextPage;
    }

    if (typeof paginationSource.hasPreviousPage === "boolean") {
      hasNewer = paginationSource.hasPreviousPage;
    } else if (hasAfterFilter) {
      hasNewer = messages.length >= limit;
    }
  }

  return {
    limit,
    hasOlder,
    hasNewer,
    nextBefore: oldestTimestamp,
    nextAfter: newestTimestamp,
  };
}

export async function getMessages(
  options: IGetMessagesRequest = {},
): Promise<IMessagesResult> {
  const limit = clampLimit(readInt(options.limit));
  const before = parseIsoTimestampOrThrow(options.before, "before");
  const after = parseIsoTimestampOrThrow(options.after, "after");

  if (before && after) {
    throw new Error(
      'Use either "before" or "after" query parameter, not both.',
    );
  }

  const query: Record<string, string> = {
    limit: String(limit),
  };

  if (before) {
    query.before = before;
  }

  if (after) {
    query.after = after;
  }

  const response = await fetch(buildUrl(MESSAGES_API_PATH, query), {
    method: "GET",
    headers: {
      Accept: "application/json",
      Authorization: `Bearer ${getApiToken()}`,
    },
    cache: "no-store",
  });

  const payload = await parsePayload(response);

  if (!response.ok) {
    throw new Error(
      parseErrorMessage(
        payload,
        `Unable to load messages (${response.status}).`,
      ),
    );
  }

  const messages = pickMessages(payload)
    .map((entry, index) => normalizeMessage(entry, index))
    .filter((entry): entry is IMessage => entry !== null);

  return {
    messages,
    pagination: normalizePagination(
      payload,
      messages,
      limit,
      Boolean(before),
      Boolean(after),
    ),
    filters: {
      before,
      after,
    },
  };
}

export async function createMessage(
  input: CreateMessageRequest,
): Promise<void> {
  const author = input.author.trim();
  const message = input.message.trim();

  if (!author || !message) {
    throw new Error("Author and message are required.");
  }

  const payload: CreateMessageRequest = {
    author,
    message,
  };

  const response = await fetch(buildUrl(MESSAGES_API_PATH), {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      Authorization: `Bearer ${getApiToken()}`,
    },
    body: JSON.stringify(payload),
    cache: "no-store",
  });

  if (response.ok) {
    return;
  }

  const errorPayload = await parsePayload(response);

  throw new Error(
    parseErrorMessage(
      errorPayload,
      `Unable to send message (${response.status}).`,
    ),
  );
}
