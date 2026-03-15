"use client";

import { useEffect, useState } from "react";

import styles from "./styles.module.css";

type ToastProps = {
  message: string;
};

export function Toast({ message }: ToastProps) {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setVisible(false), 5000);
    return () => clearTimeout(timer);
  }, []);

  if (!visible) {
    return null;
  }

  return (
    <div className={styles.toast} role="alert">
      <span className={styles.text}>{message}</span>
      <button
        className={styles.close}
        onClick={() => setVisible(false)}
        aria-label="Dismiss"
      >
        ✕
      </button>
    </div>
  );
}
