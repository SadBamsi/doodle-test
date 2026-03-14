import type { ChatViewModel } from "@/lib/chat-view-model";

import { ChatComposer } from "@/components/chat-composer";
import { ChatFilters } from "@/components/chat-filters";
import { ChatMessages } from "@/components/chat-messages";
import { ChatPagination } from "@/components/chat-pagination";

import styles from "./styles.module.css";

type ChatPageProps = {
  view: ChatViewModel;
  onSendMessage: (formData: FormData) => Promise<void>;
};

export function ChatPage({ view, onSendMessage }: ChatPageProps) {
  return (
    <section className={styles.chatCard}>
      <header className={styles.header}>
        <div>
          <h1 className={styles.title}>Team Chat</h1>
          <p className={styles.subtitle}>
            Messages are fetched on the server via GET /api/v1/messages.
          </p>
        </div>
        <p className={styles.pageInfo}>Limit: {view.limit}</p>
      </header>

      <ChatFilters
        limit={view.limit}
        before={view.before}
        after={view.after}
        latestHref={view.latestHref}
      />

      <ChatMessages
        messages={view.messages}
        queryWarning={view.queryWarning}
        actionError={view.actionError}
        sent={view.sent}
        loadError={view.loadError}
      />

      <ChatPagination newerHref={view.newerHref} olderHref={view.olderHref} />

      <ChatComposer
        limit={view.limit}
        before={view.before}
        after={view.after}
        onSendMessage={onSendMessage}
      />
    </section>
  );
}
