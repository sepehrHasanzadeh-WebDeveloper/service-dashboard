"use client";

import { Plus } from "lucide-react";
import type { MouseEvent } from "react";
import CategoriesCard, { type CategoryCardItem } from "../CategoriesCard/CategoriesCard";
import styles from "./CategorySec.module.css";

type CategorySecProps = {
  categories: CategoryCardItem[];
  categoryCount: number;
  selectedCategory: string;
  onSelectCategory: (categoryId: string) => void;
  onCategoryContextMenu: (event: MouseEvent<HTMLButtonElement>, categoryId: string) => void;
  onAddCategory: () => void;
};

export default function CategorySec({
  categories,
  categoryCount,
  selectedCategory,
  onSelectCategory,
  onCategoryContextMenu,
  onAddCategory,
}: CategorySecProps) {
  return (
    <section className={styles.section} aria-labelledby="categories-title">
      <div className={styles.heading}>
        <h2 id="categories-title">دسته‌بندی‌ها</h2>
        <small>{categoryCount} دسته</small>
      </div>
      <div className={styles.list} role="list">
        {categories.map((category) => (
          <CategoriesCard
            key={category.id}
            category={category}
            isActive={selectedCategory === category.id}
            onSelect={onSelectCategory}
            onContextMenu={onCategoryContextMenu}
          />
        ))}
        <button className={styles.addCard} type="button" onClick={onAddCategory}>
          <Plus size={14} />
          افزودن دسته‌بندی
        </button>
      </div>
    </section>
  );
}
