"use client";

import type { MouseEvent } from "react";
import styles from "./CategoriesCard.module.css";

export type CategoryCardItem = {
  id: string;
  title: string;
  count: number;
};

type CategoriesCardProps = {
  category: CategoryCardItem;
  isActive: boolean;
  onSelect: (categoryId: string) => void;
  onContextMenu: (event: MouseEvent<HTMLButtonElement>, categoryId: string) => void;
};

export default function CategoriesCard({ category, isActive, onSelect, onContextMenu }: CategoriesCardProps) {
  return (
    <button
      className={`${styles.card} ${isActive ? styles.cardActive : ""}`.trim()}
      type="button"
      aria-haspopup="menu"
      aria-pressed={isActive}
      onClick={() => onSelect(category.id)}
      onContextMenu={(event) => onContextMenu(event, category.id)}
    >
      <span>{category.title}</span>
      <b>{category.count}</b>
    </button>
  );
}
