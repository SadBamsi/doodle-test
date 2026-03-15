"use server";

import { revalidatePath } from "next/cache";

import { createMessage } from "@/lib/chat-api";
import { DEFAULT_LIMIT, MAX_LIMIT, MIN_LIMIT } from "@/lib/constants";
import { parseIsoTimestamp } from "@/lib/date-time";

type SendResult = { error: string | null };

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

function toErrorMessage(error: unknown): string {
  if (error instanceof Error && error.message.trim().length > 0) {
    return error.message;
  }

  return "Unable to send message.";
}

export async function sendMessageAction(
  formData: FormData,
): Promise<SendResult> {
  const author = readFormValue(formData.get("author")).trim();
  const message = readFormValue(formData.get("message")).trim();

  // Suppress unused reads — kept for future use
  void toLimit(readFormValue(formData.get("limit")));
  void parseIsoTimestamp(readFormValue(formData.get("before")));
  void parseIsoTimestamp(readFormValue(formData.get("after")));

  if (!author || !message) {
    return { error: "Author and message are required." };
  }

  try {
    await createMessage({ author, message });
  } catch (error) {
    return { error: toErrorMessage(error) };
  }

  revalidatePath("/");

  return { error: null };
}
