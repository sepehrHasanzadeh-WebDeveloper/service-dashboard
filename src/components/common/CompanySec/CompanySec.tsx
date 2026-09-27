"use client";

import { Plus } from "lucide-react";
import type { MouseEvent } from "react";
import type { Company } from "@/context/DashboardContext/DashboardContext";
import CompaniesCard from "../CompaniesCard/CompaniesCard";
import styles from "./CompanySec.module.css";

type CompanySecProps = {
  companies: Company[];
  activeCompanyId: string;
  onSelectCompany: (companyId: string) => void;
  onCompanyContextMenu: (event: MouseEvent<HTMLButtonElement>, company: Company) => void;
  onAddCompany: () => void;
};

export default function CompanySec({
  companies,
  activeCompanyId,
  onSelectCompany,
  onCompanyContextMenu,
  onAddCompany,
}: CompanySecProps) {
  return (
    <nav className={styles.section} aria-label="انتخاب شرکت">
      <span className={styles.label}>شرکت‌ها</span>
      <div className={styles.list}>
        {companies.map((company) => (
          <CompaniesCard
            key={company.id}
            company={company}
            isActive={activeCompanyId === company.id}
            onSelect={onSelectCompany}
            onContextMenu={onCompanyContextMenu}
          />
        ))}
        <button className={styles.addCard} type="button" onClick={onAddCompany}>
          <Plus size={16} />
          <span>
            <strong>افزودن شرکت</strong>
            <small>ساخت فضای جدید</small>
          </span>
        </button>
      </div>
    </nav>
  );
}
