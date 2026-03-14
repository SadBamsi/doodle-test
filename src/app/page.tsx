import { sendMessageAction } from "@/app/actions";
import { ChatPage } from "@/components/chat-page";
import { buildChatViewModel, type SearchParams } from "@/lib/chat-view-model";

import styles from "./page.module.css";

type HomePageProps = {
  searchParams?: SearchParams | Promise<SearchParams>;
};

export default async function Home({ searchParams }: HomePageProps) {
  const view = await buildChatViewModel(searchParams);

  return (
    <main className={styles.page}>
      <ChatPage view={view} onSendMessage={sendMessageAction} />
    </main>
  );
}
