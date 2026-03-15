"use client";

import { useActionState, useEffect, useOptimistic, useRef } from "react";

import { ChatComposer } from "@/components/chat-composer";
import { ChatMessages } from "@/components/chat-messages";
import { Toast } from "@/components/toast";
import type { IMessage } from "@/types";

import styles from "./styles.module.css";

type SendResult = { error: string | null };
type ActionState = SendResult;

type ChatClientProps = {
  messages: IMessage[];
  limit: number;
  before?: string;
  after?: string;
  queryWarning: string | null;
  loadError: string | null;
  sendAction: (formData: FormData) => Promise<SendResult>;
};

export function ChatClient({
  messages,
  limit,
  before,
  after,
  queryWarning,
  loadError,
  sendAction,
}: ChatClientProps) {
  const messagesAreaRef = useRef<HTMLDivElement>(null);

  const [optimisticMessages, addOptimistic] = useOptimistic<
    IMessage[],
    IMessage
  >(messages, (current, msg) => [...current, msg]);

  useEffect(() => {
    const el = messagesAreaRef.current;
    if (!el) return;
    el.scrollTop = el.scrollHeight;
  }, [optimisticMessages.length]);

  const [actionState, formAction] = useActionState(
    async (_prev: ActionState, formData: FormData): Promise<ActionState> => {
      const msgText = formData.get("message");

      if (typeof msgText === "string" && msgText.trim()) {
        addOptimistic({
          _id: `optimistic-${Date.now()}`,
          message: msgText.trim(),
          author: "user",
          createdAt: new Date().toISOString(),
        });
      }

      return sendAction(formData);
    },
    { error: null },
  );

  return (
    <div className={styles.root}>
      <ChatMessages
        messages={optimisticMessages}
        queryWarning={queryWarning}
        loadError={loadError}
        messagesAreaRef={messagesAreaRef}
      />

      <ChatComposer
        limit={limit}
        before={before}
        after={after}
        onSendMessage={formAction}
      />

      {actionState.error ? (
        <Toast key={actionState.error} message={actionState.error} />
      ) : null}
    </div>
  );
}
