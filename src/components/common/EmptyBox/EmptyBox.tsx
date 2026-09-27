import type { ReactNode } from "react";
import styles from "./EmptyBox.module.css";

type EmptyBoxProps = {
  title: string;
  description: string;
  icon?: ReactNode;
  actionLabel?: string;
  onAction?: () => void;
  small?: boolean;
};

export default function EmptyBox({
  title,
  description,
  icon,
  actionLabel,
  onAction,
  small = false,
}: EmptyBoxProps) {
  return (
    <section className={`glass-card ${styles.emptyBox} ${small ? styles.small : ""}`.trim()}>
      {icon && <span className={styles.icon}>{icon}</span>}
      <h2>{title}</h2>
      <p>{description}</p>
      {actionLabel && onAction && (
        <button className={styles.actionButton} type="button" onClick={onAction}>
          {actionLabel}
        </button>
      )}
    </section>
  );
}
