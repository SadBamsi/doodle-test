import { Button } from "@/components/button";

import styles from "./styles.module.css";

type ChatComposerProps = {
  limit: number;
  before?: string;
  after?: string;
  onSendMessage: (formData: FormData) => Promise<void>;
};

export function ChatComposer({
  limit,
  before,
  after,
  onSendMessage,
}: ChatComposerProps) {
  return (
    <form action={onSendMessage} className={styles.composer}>
      <input type="hidden" name="limit" value={String(limit)} />
      {before ? <input type="hidden" name="before" value={before} /> : null}
      {after ? <input type="hidden" name="after" value={after} /> : null}

      <div className={styles.formFields}>
        <label className={styles.field}>
          <span className={styles.label}>Author</span>
          <input
            className={styles.input}
            name="author"
            type="text"
            maxLength={80}
            placeholder="Your name"
            required
          />
        </label>

        <label className={styles.field}>
          <span className={styles.label}>Message</span>
          <textarea
            className={styles.textarea}
            name="message"
            rows={3}
            maxLength={2000}
            placeholder="Write your message"
            required
          />
        </label>
      </div>

      <Button type="submit" variant="primary">
        Send
      </Button>
    </form>
  );
}
