"use client";

import type { RefObject } from "react";

import { Message } from "@/components/message";
import type { IMessage } from "@/types";

import styles from "./styles.module.css";

type ChatMessagesProps = {
  messages: IMessage[];
  queryWarning: string | null;
  loadError: string | null;
  messagesAreaRef?: RefObject<HTMLDivElement | null>;
};

export function ChatMessages({
  messages,
  queryWarning,
  loadError,
  messagesAreaRef,
}: ChatMessagesProps) {
  return (
    <section className={styles.root}>
      {queryWarning ? (
        <p className={styles.errorBanner}>{queryWarning}</p>
      ) : null}

      <div ref={messagesAreaRef} className={styles.messagesArea}>
        {loadError ? (
          <p className={styles.errorBanner}>{loadError}</p>
        ) : messages.length === 0 ? (
          <p className={styles.emptyState}>No messages yet.</p>
        ) : (
          <ul className={styles.messageList}>
            {messages.map((message) => (
              <Message key={message._id} message={message} />
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}
