import type { ChatViewModel } from "@/lib/chat-view-model";

import { ChatClient } from "@/components/chat-client";
import { ChatFilters } from "@/components/chat-filters";

import styles from "./styles.module.css";

type ChatPageProps = {
  view: ChatViewModel;
  onSendMessage: (formData: FormData) => Promise<{ error: string | null }>;
};

export function ChatPage({ view, onSendMessage }: ChatPageProps) {
  return (
    <section className={styles.chatCard}>
      <header className={styles.header}>
        <div className={styles.avatar}>💬</div>
        <div className={styles.headerInfo}>
          <h1 className={styles.title}>Team Chat</h1>
          <p className={styles.subtitle}>
            {view.messages.length > 0
              ? `${view.messages.length} messages`
              : "no messages"}
          </p>
        </div>
      </header>

      <details className={styles.filtersDetails}>
        <summary className={styles.filtersSummary}>⚙️ Filters</summary>
        <div className={styles.filtersPanel}>
          <ChatFilters
            limit={view.limit}
            before={view.before}
            after={view.after}
            latestHref={view.latestHref}
          />
        </div>
      </details>

      <ChatClient
        messages={view.messages}
        limit={view.limit}
        before={view.before}
        after={view.after}
        queryWarning={view.queryWarning}
        loadError={view.loadError}
        sendAction={onSendMessage}
      />
    </section>
  );
}
