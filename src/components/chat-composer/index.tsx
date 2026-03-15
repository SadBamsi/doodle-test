"use client";

import { useRef } from "react";

import { Button } from "@/components/button";

import styles from "./styles.module.css";

type ChatComposerProps = {
  limit: number;
  before?: string;
  after?: string;
  onSendMessage: (payload: FormData) => void;
};

export function ChatComposer({
  limit,
  before,
  after,
  onSendMessage,
}: ChatComposerProps) {
  const formRef = useRef<HTMLFormElement>(null);

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    const isNewline = e.metaKey || e.ctrlKey; // Cmd+Enter (mac) or Ctrl+Enter (win/linux)

    if (e.key === "Enter" && !isNewline) {
      e.preventDefault();
      formRef.current?.requestSubmit();
    }
  }

  return (
    <form ref={formRef} action={onSendMessage} className={styles.composer}>
      <input type="hidden" name="limit" value={String(limit)} />
      <input type="hidden" name="author" value="user" />
      {before ? <input type="hidden" name="before" value={before} /> : null}
      {after ? <input type="hidden" name="after" value={after} /> : null}

      <textarea
        className={styles.textarea}
        name="message"
        rows={2}
        maxLength={2000}
        placeholder="Write a message"
        onKeyDown={handleKeyDown}
        required
      />

      <Button type="submit" variant="primary" className={styles.sendButton}>
        ➤
      </Button>
    </form>
  );
}
