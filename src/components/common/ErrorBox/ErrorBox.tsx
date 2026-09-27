import type { ReactNode } from "react";
import styles from "./ErrorBox.module.css";

type ErrorBoxProps = {
  message: string;
  title?: string;
  actionLabel?: string;
  onAction?: () => void;
  icon?: ReactNode;
  variant?: "compact" | "page";
};

export default function ErrorBox({
  message,
  title,
  actionLabel,
  onAction,
  icon,
  variant = "compact",
}: ErrorBoxProps) {
  if (variant === "page") {
    return (
      <section className={`glass-card ${styles.page}`} role="alert">
        {icon && <span className={styles.icon}>{icon}</span>}
        <h2>{title ?? "خطایی رخ داد"}</h2>
        <p>{message}</p>
        {actionLabel && onAction && (
          <button className={styles.actionButton} type="button" onClick={onAction}>
            {actionLabel}
          </button>
        )}
      </section>
    );
  }

  return (
    <div className={styles.compact} role="alert">
      <span>{message}</span>
      {actionLabel && onAction && (
        <button type="button" onClick={onAction}>
          {actionLabel}
        </button>
      )}
    </div>
  );
}
