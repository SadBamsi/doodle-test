import { formatDateTime, toIsoTimestampOrNow } from "@/lib/date-time";
import type { IMessage } from "@/types";

import styles from "./styles.module.css";

type MessageProps = {
  message: IMessage;
};

export function Message({ message }: MessageProps) {
  return (
    <li className={styles.root}>
      <div className={styles.meta}>
        <strong className={styles.author}>{message.author}</strong>
        <time
          className={styles.timestamp}
          dateTime={toIsoTimestampOrNow(message.createdAt)}
        >
          {formatDateTime(message.createdAt)}
        </time>
      </div>
      <p className={styles.text}>{message.message}</p>
    </li>
  );
}
