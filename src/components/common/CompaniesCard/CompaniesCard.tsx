"use client";

/* Company icons use user-provided URLs, so they intentionally remain plain images. */
/* eslint-disable @next/next/no-img-element */

import { useState, type MouseEvent } from "react";
import type { Company } from "@/context/DashboardContext/DashboardContext";
import styles from "./CompaniesCard.module.css";

export function CompanyIconVisual({ company }: { company: Company }) {
  const [failedImageUrl, setFailedImageUrl] = useState<string | null>(null);
  const showImage = Boolean(company.icon) && company.icon !== failedImageUrl;

  return (
    <span className={`${styles.mark} ${showImage ? styles.markImage : ""}`.trim()}>
      {showImage ? <img className={styles.logo} src={company.icon ?? ""} alt="" onError={() => setFailedImageUrl(company.icon ?? null)} /> : company.name.slice(0, 1)}
    </span>
  );
}

type CompaniesCardProps = {
  company: Company;
  isActive: boolean;
  onSelect: (companyId: string) => void;
  onContextMenu: (event: MouseEvent<HTMLButtonElement>, company: Company) => void;
};

export default function CompaniesCard({ company, isActive, onSelect, onContextMenu }: CompaniesCardProps) {
  return (
    <div className={`${styles.wrapper} ${isActive ? styles.wrapperActive : ""}`.trim()}>
      <button
        className={`${styles.card} ${isActive ? styles.cardActive : ""}`.trim()}
        type="button"
        aria-haspopup="menu"
        aria-pressed={isActive}
        onClick={() => onSelect(company.id)}
        onContextMenu={(event) => onContextMenu(event, company)}
      >
        <CompanyIconVisual company={company} />
        <span className={styles.copy}>
          <strong>{company.name}</strong>
          <small>{company.subtitle || "شرکت سازمانی"}</small>
        </span>
      </button>
    </div>
  );
}
