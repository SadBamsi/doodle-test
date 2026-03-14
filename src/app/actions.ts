"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { createMessage } from "@/lib/chat-api";
import { DEFAULT_LIMIT, MAX_LIMIT, MIN_LIMIT } from "@/lib/constants";
import { parseIsoTimestamp } from "@/lib/date-time";

type RedirectContext = {
  limit: number;
  before?: string;
  after?: string;
  error?: string;
  sent?: string;
};

function readFormValue(value: FormDataEntryValue | null): string {
  return typeof value === "string" ? value : "";
}

function toLimit(rawValue: string): number {
  const parsed = Number.parseInt(rawValue, 10);

  if (!Number.isFinite(parsed)) {
    return DEFAULT_LIMIT;
  }

  if (parsed < MIN_LIMIT) {
    return MIN_LIMIT;
  }

  if (parsed > MAX_LIMIT) {
    return MAX_LIMIT;
  }

  return Math.floor(parsed);
}

function buildRedirectPath(context: RedirectContext): string {
  const searchParams = new URLSearchParams();

  searchParams.set("limit", String(context.limit));

  if (context.before) {
    searchParams.set("before", context.before);
  } else if (context.after) {
    searchParams.set("after", context.after);
  }

  if (context.error) {
    searchParams.set("error", context.error);
  }

  if (context.sent) {
    searchParams.set("sent", context.sent);
  }

  return `/?${searchParams.toString()}`;
}

function toErrorMessage(error: unknown): string {
  if (error instanceof Error && error.message.trim().length > 0) {
    return error.message;
  }

  return "Unable to send message.";
}

export async function sendMessageAction(formData: FormData): Promise<void> {
  const limit = toLimit(readFormValue(formData.get("limit")));
  const before = parseIsoTimestamp(readFormValue(formData.get("before")));
  const after = parseIsoTimestamp(readFormValue(formData.get("after")));

  const author = readFormValue(formData.get("author")).trim();
  const message = readFormValue(formData.get("message")).trim();

  const context: RedirectContext = {
    limit,
    before,
    after,
  };

  if (context.before && context.after) {
    context.after = undefined;
  }

  if (!author || !message) {
    redirect(
      buildRedirectPath({
        ...context,
        error: "Author and message are required.",
      }),
    );
  }

  try {
    await createMessage({
      author,
      message,
    });
  } catch (error) {
    redirect(
      buildRedirectPath({
        ...context,
        error: toErrorMessage(error),
      }),
    );
  }

  revalidatePath("/");

  redirect(
    buildRedirectPath({
      limit,
      sent: "1",
    }),
  );
}
