import { Message } from "@/components/message";
import type { IMessage } from "@/types";

import styles from "./styles.module.css";

type ChatMessagesProps = {
  messages: IMessage[];
  queryWarning: string | null;
  actionError: string | null;
  sent: boolean;
  loadError: string | null;
};

export function ChatMessages({
  messages,
  queryWarning,
  actionError,
  sent,
  loadError,
}: ChatMessagesProps) {
  return (
    <section className={styles.root}>
      {queryWarning ? (
        <p className={styles.errorBanner}>{queryWarning}</p>
      ) : null}
      {actionError ? <p className={styles.errorBanner}>{actionError}</p> : null}
      {sent ? <p className={styles.successBanner}>Message sent.</p> : null}

      <div className={styles.messagesArea}>
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
