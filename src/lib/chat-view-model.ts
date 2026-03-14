import { getMessages } from "@/lib/chat-api";
import { DEFAULT_LIMIT, MAX_LIMIT, MIN_LIMIT } from "@/lib/constants";
import { parseIsoTimestamp, toIsoTimestamp } from "@/lib/date-time";
import type { IGetMessagesRequest, IMessage } from "@/types";

export type SearchParamValue = string | string[] | undefined;
export type SearchParams = Record<string, SearchParamValue>;

export type ChatViewModel = {
  messages: IMessage[];
  limit: number;
  before?: string;
  after?: string;
  latestHref: string;
  olderHref: string | null;
  newerHref: string | null;
  loadError: string | null;
  queryWarning: string | null;
  actionError: string | null;
  sent: boolean;
};

function getText(value: SearchParamValue): string | undefined {
  if (Array.isArray(value)) {
    return value[0];
  }

  return value;
}

function toPositiveInt(
  rawValue: string | undefined,
  fallback: number,
  max: number,
): number {
  if (!rawValue) {
    return fallback;
  }

  const parsed = Number.parseInt(rawValue, 10);

  if (!Number.isFinite(parsed)) {
    return fallback;
  }

  if (parsed < MIN_LIMIT) {
    return MIN_LIMIT;
  }

  if (parsed > max) {
    return max;
  }

  return Math.floor(parsed);
}

function toErrorMessage(error: unknown): string {
  if (error instanceof Error && error.message.trim().length > 0) {
    return error.message;
  }

  return "Unable to load messages.";
}

export function buildMessagesHref(query: IGetMessagesRequest): string {
  const searchParams = new URLSearchParams();

  const limit =
    typeof query.limit === "number" && Number.isFinite(query.limit)
      ? Math.max(MIN_LIMIT, Math.min(MAX_LIMIT, Math.floor(query.limit)))
      : DEFAULT_LIMIT;

  searchParams.set("limit", String(limit));

  if (query.before) {
    searchParams.set("before", query.before);
  } else if (query.after) {
    searchParams.set("after", query.after);
  }

  return `/?${searchParams.toString()}`;
}

export async function buildChatViewModel(
  searchParams: SearchParams | Promise<SearchParams> | undefined,
): Promise<ChatViewModel> {
  const params = (await searchParams) ?? {};

  const limit = toPositiveInt(getText(params.limit), DEFAULT_LIMIT, MAX_LIMIT);
  const before = parseIsoTimestamp(getText(params.before));
  const after = parseIsoTimestamp(getText(params.after));

  const sent = getText(params.sent) === "1";
  const actionError = getText(params.error) ?? null;

  let queryWarning: string | null = null;

  const request: IGetMessagesRequest = {
    limit,
  };

  if (before && after) {
    queryWarning = 'Use either "before" or "after", not both. Using "before".';
    request.before = before;
  } else if (before) {
    request.before = before;
  } else if (after) {
    request.after = after;
  }

  const latestHref = buildMessagesHref({ limit });

  try {
    const result = await getMessages(request);

    const newest = result.messages[0];
    const oldest = result.messages[result.messages.length - 1];

    const newerTimestamp =
      result.pagination.nextAfter ??
      (newest ? toIsoTimestamp(newest.createdAt) : null);
    const olderTimestamp =
      result.pagination.nextBefore ??
      (oldest ? toIsoTimestamp(oldest.createdAt) : null);

    return {
      messages: result.messages,
      limit,
      before: result.filters.before,
      after: result.filters.after,
      latestHref,
      olderHref:
        result.pagination.hasOlder && olderTimestamp
          ? buildMessagesHref({ limit, before: olderTimestamp })
          : null,
      newerHref:
        result.pagination.hasNewer && newerTimestamp
          ? buildMessagesHref({ limit, after: newerTimestamp })
          : null,
      loadError: null,
      queryWarning,
      actionError,
      sent,
    };
  } catch (error) {
    return {
      messages: [],
      limit,
      before: request.before,
      after: request.after,
      latestHref,
      olderHref: null,
      newerHref: null,
      loadError: toErrorMessage(error),
      queryWarning,
      actionError,
      sent,
    };
  }
}
