import { formatDateTime, toIsoTimestampOrNow } from "@/lib/date-time";
import type { IMessage } from "@/types";

import styles from "./styles.module.css";

const CURRENT_USER = "user";

type MessageProps = {
  message: IMessage;
};

export function Message({ message }: MessageProps) {
  const isOwn = message.author === CURRENT_USER;

  return (
    <li className={`${styles.root} ${isOwn ? styles.own : styles.other}`}>
      {!isOwn && <span className={styles.authorName}>{message.author}</span>}
      <div className={isOwn ? styles.bubbleOwn : styles.bubbleOther}>
        <p className={styles.text}>{message.message}</p>
        <time
          className={styles.timestamp}
          dateTime={toIsoTimestampOrNow(message.createdAt)}
        >
          {formatDateTime(message.createdAt)}
        </time>
      </div>
    </li>
  );
}
