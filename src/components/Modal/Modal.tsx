"use client";

import { ArrowUpLeft, LoaderCircle, LogOut, Pencil, Plus, Trash2 } from "lucide-react";
import { useEffect, useRef } from "react";
import type { FormEvent, ReactNode } from "react";
import type {
  CategoryForm,
  Company,
  CompanyForm,
  Service,
  ServiceCategory,
  ServiceForm,
} from "@/context/DashboardContext/DashboardContext";
import styles from "./Modal.module.css";

type CategoryOption = { id: string; title: string };

type ServiceModalProps = {
  activeCompany: Company;
  editingServiceId: string | null;
  isSaving: boolean;
  saveError: string;
  serviceForm: ServiceForm;
  serviceCategoryOptions: CategoryOption[];
  onClose: () => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  onChange: (form: ServiceForm) => void;
};

type CategoryModalProps = {
  activeCompany: Company;
  editingCategoryId: string | null;
  isSaving: boolean;
  saveError: string;
  categoryForm: CategoryForm;
  onClose: () => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  onChange: (form: CategoryForm) => void;
};

type CompanyModalProps = {
  editingCompanyId: string | null;
  isSaving: boolean;
  saveError: string;
  companyForm: CompanyForm;
  onClose: () => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  onChange: (form: CompanyForm) => void;
};

type ServiceDetailsModalProps = {
  service: Service;
  icon: ReactNode;
  saveError: string;
  onClose: () => void;
  onEdit: () => void;
  onDelete: () => void;
};

type DeleteModalProps = {
  eyebrow: string;
  title: string;
  message: string;
  saveError: string;
  isDeleting: boolean;
  onClose: () => void;
  onDelete: () => void;
};

type LogoutModalProps = {
  isLoggingOut: boolean;
  onClose: () => void;
  onConfirm: () => void;
};

type ModalLayerProps = {
  children: ReactNode;
  className?: string;
  onClose: () => void;
  closeOnBackdrop?: boolean;
};

function ModalLayer({ children, className, onClose, closeOnBackdrop = true }: ModalLayerProps) {
  const layerRef = useRef<HTMLDivElement>(null);
  const onCloseRef = useRef(onClose);

  useEffect(() => {
    onCloseRef.current = onClose;
  }, [onClose]);

  useEffect(() => {
    const layer = layerRef.current;
    const previouslyFocused = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    const focusableSelector = "button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), a[href], [tabindex]:not([tabindex='-1'])";
    const focusInitialElement = () => {
      const autofocusElement = layer?.querySelector<HTMLElement>("[autofocus]");
      const firstFocusableElement = layer?.querySelector<HTMLElement>(focusableSelector);
      (autofocusElement ?? firstFocusableElement)?.focus();
    };

    focusInitialElement();

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        event.preventDefault();
        onCloseRef.current();
        return;
      }

      if (event.key !== "Tab") return;

      const focusableElements = Array.from(layer?.querySelectorAll<HTMLElement>(focusableSelector) ?? []);
      if (focusableElements.length === 0) return;

      const firstElement = focusableElements[0];
      const lastElement = focusableElements[focusableElements.length - 1];

      if (event.shiftKey && document.activeElement === firstElement) {
        event.preventDefault();
        lastElement.focus();
      } else if (!event.shiftKey && document.activeElement === lastElement) {
        event.preventDefault();
        firstElement.focus();
      }
    }

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      if (previouslyFocused?.isConnected) previouslyFocused.focus();
    };
  }, []);

  return (
    <div
      ref={layerRef}
      className={className}
      role="presentation"
      onClick={(event) => { if (closeOnBackdrop && event.target === event.currentTarget) onClose(); }}
      onContextMenu={(event) => { event.preventDefault(); event.stopPropagation(); }}
    >
      {children}
    </div>
  );
}

function ModalHeader({
  eyebrow,
  title,
  description,
  titleId,
  onClose,
  closeLabel = "بستن",
}: {
  eyebrow: string;
  title: string;
  description: string;
  titleId?: string;
  onClose: () => void;
  closeLabel?: string;
}) {
  return (
    <div className={styles.header}>
      <div>
        <span className={styles.eyebrow}>{eyebrow}</span>
        <h2 id={titleId}>{title}</h2>
        <p>{description}</p>
      </div>
      <button className={styles.closeButton} type="button" aria-label={closeLabel} onClick={onClose}>
        ×
      </button>
    </div>
  );
}

function FormError({ message }: { message: string }) {
  return message ? <div className={styles.error} role="alert">{message}</div> : null;
}

function ModalActions({ children }: { children: ReactNode }) {
  return <div className={styles.actions}>{children}</div>;
}

export function ServiceModal({
  activeCompany,
  editingServiceId,
  isSaving,
  saveError,
  serviceForm,
  serviceCategoryOptions,
  onClose,
  onSubmit,
  onChange,
}: ServiceModalProps) {
  return (
    <ModalLayer className={styles.layer} onClose={onClose}>
      <form className={styles.formModal} role="dialog" aria-modal="true" aria-labelledby="service-modal-title" onSubmit={onSubmit}>
        <ModalHeader
          eyebrow={`${activeCompany.name} · ${editingServiceId ? "ویرایش سرویس" : "سرویس جدید"}`}
          title={editingServiceId ? "ویرایش سرویس" : "افزودن سرویس"}
          titleId="service-modal-title"
          description={editingServiceId ? "اطلاعات سرویس را به‌روزرسانی کنید." : "سرویس را به شرکت و دسته‌بندی مورد نظر اضافه کنید."}
          onClose={onClose}
        />
        <FormError message={saveError} />
        <div className={styles.fields}>
          <label className={styles.field}>
            <span>عنوان سرویس <b>*</b></span>
            <input autoFocus required value={serviceForm.title} onChange={(event) => onChange({ ...serviceForm, title: event.target.value })} placeholder="مثلاً: مدیریت مالی" />
          </label>
          <label className={styles.field}>
            <span>دسته‌بندی <b>*</b></span>
            <select required value={serviceForm.categoryId} onChange={(event) => onChange({ ...serviceForm, categoryId: event.target.value })}>
              <option value="" disabled>انتخاب دسته‌بندی</option>
              {serviceCategoryOptions.map((category) => <option key={category.id} value={category.id}>{category.title}</option>)}
            </select>
          </label>
          <label className={styles.field}>
            <span>توضیحات</span>
            <textarea rows={3} value={serviceForm.description} onChange={(event) => onChange({ ...serviceForm, description: event.target.value })} placeholder="توضیح کوتاه درباره‌ی این سرویس" />
          </label>
          <label className={styles.field}>
            <span>آدرس سرویس <b>*</b></span>
            <input required type="text" inputMode="url" value={serviceForm.link} onChange={(event) => onChange({ ...serviceForm, link: event.target.value })} placeholder="https://service.company.ir یا 192.168.1.10:8080" dir="ltr" />
          </label>
        </div>
        <ModalActions>
          <button className={styles.submit} type="submit" disabled={isSaving}>
            {isSaving ? <><LoaderCircle className={styles.spinner} size={15} /> در حال ذخیره...</> : <>{editingServiceId ? <Pencil size={15} /> : <Plus size={16} />} {editingServiceId ? "ذخیره تغییرات" : "افزودن سرویس"}</>}
          </button>
        </ModalActions>
      </form>
    </ModalLayer>
  );
}

export function CategoryModal({
  activeCompany,
  editingCategoryId,
  isSaving,
  saveError,
  categoryForm,
  onClose,
  onSubmit,
  onChange,
}: CategoryModalProps) {
  return (
    <ModalLayer className={styles.layer} onClose={onClose}>
      <form className={styles.formModal} role="dialog" aria-modal="true" aria-labelledby="category-modal-title" onSubmit={onSubmit}>
        <ModalHeader
          eyebrow={`${activeCompany.name} · دسته‌بندی‌ها`}
          title={editingCategoryId ? "ویرایش دسته‌بندی" : "افزودن دسته‌بندی"}
          titleId="category-modal-title"
          description={editingCategoryId ? "نام دسته‌بندی را به‌روزرسانی کنید." : "یک دسته‌بندی جدید برای مرتب‌سازی سرویس‌ها بسازید."}
          onClose={onClose}
        />
        <FormError message={saveError} />
        <div className={styles.fields}>
          <label className={styles.field}>
            <span>نام دسته‌بندی <b>*</b></span>
            <input autoFocus required value={categoryForm.title} onChange={(event) => onChange({ title: event.target.value })} placeholder="مثلاً: ابزارهای داخلی" />
          </label>
        </div>
        <ModalActions>
          <button className={styles.submit} type="submit" disabled={isSaving}>
            {isSaving ? <><LoaderCircle className={styles.spinner} size={15} /> در حال ذخیره...</> : <>{editingCategoryId ? <Pencil size={15} /> : <Plus size={16} />} {editingCategoryId ? "ذخیره تغییرات" : "افزودن دسته‌بندی"}</>}
          </button>
        </ModalActions>
      </form>
    </ModalLayer>
  );
}

export function CompanyModal({
  editingCompanyId,
  isSaving,
  saveError,
  companyForm,
  onClose,
  onSubmit,
  onChange,
}: CompanyModalProps) {
  return (
    <ModalLayer className={styles.layer} onClose={onClose}>
      <form className={styles.formModal} role="dialog" aria-modal="true" aria-labelledby="company-modal-title" onSubmit={onSubmit}>
        <ModalHeader
          eyebrow="داشبورد چندسازمانی"
          title={editingCompanyId ? "ویرایش شرکت" : "افزودن شرکت"}
          titleId="company-modal-title"
          description={editingCompanyId ? "نام و اطلاعات شرکت را به‌روزرسانی کنید." : "یک فضای مستقل برای سرویس‌های شرکت بسازید."}
          onClose={onClose}
        />
        <FormError message={saveError} />
        <div className={styles.fields}>
          <label className={styles.field}>
            <span>نام شرکت <b>*</b></span>
            <input autoFocus required value={companyForm.name} onChange={(event) => onChange({ ...companyForm, name: event.target.value })} placeholder="مثلاً: شرکت آهن آنلاین" />
          </label>
          <label className={styles.field}>
            <span>توضیح کوتاه</span>
            <input value={companyForm.subtitle} onChange={(event) => onChange({ ...companyForm, subtitle: event.target.value })} placeholder="مثلاً: فناوری اطلاعات و عملیات" />
          </label>
          <label className={styles.field}>
            <span>لینک شرکت <small>(اختیاری)</small></span>
            <input type="url" dir="ltr" value={companyForm.link} onChange={(event) => onChange({ ...companyForm, link: event.target.value })} placeholder="https://company.ir" />
          </label>
        </div>
        <ModalActions>
          <button className={styles.submit} type="submit" disabled={isSaving}>
            {isSaving ? <><LoaderCircle className={styles.spinner} size={15} /> در حال ذخیره...</> : <>{editingCompanyId ? <Pencil size={15} /> : <Plus size={16} />} {editingCompanyId ? "ذخیره تغییرات" : "افزودن شرکت"}</>}
          </button>
        </ModalActions>
      </form>
    </ModalLayer>
  );
}

export function ServiceDetailsModal({ service, icon, saveError, onClose, onEdit, onDelete }: ServiceDetailsModalProps) {
  return (
    <ModalLayer className={styles.layer} onClose={onClose}>
      <section className={styles.detailsModal} role="dialog" aria-modal="true" aria-labelledby="service-details-title">
        <div className={styles.detailsHeader}>
          <div className={styles.detailsIdentity}>
            <span className={styles.detailsIcon}>{icon}</span>
            <div>
              <span className={styles.eyebrow}>اطلاعات سرویس</span>
              <h2 id="service-details-title">{service.title}</h2>
              {service.name && service.name !== service.title && <p>{service.name}</p>}
            </div>
          </div>
          <button className={styles.closeButton} type="button" aria-label="بستن اطلاعات سرویس" onClick={onClose}>×</button>
        </div>
        <FormError message={saveError} />
        <div className={styles.detailsContent}>
          <div className={styles.detailItem}><span>دسته‌بندی</span><strong>{service.categoryTitle}</strong></div>
          <div className={`${styles.detailItem} ${styles.detailDescription}`}><span>توضیحات</span><strong>{service.description || "توضیحی برای این سرویس ثبت نشده است."}</strong></div>
          <div className={styles.detailItem}><span>لینک سرویس</span><a href={service.link} target="_blank" rel="noreferrer" dir="ltr">{service.link}</a></div>
        </div>
        <div className={styles.detailsActions}>
          <div className={styles.detailsActionGroup}>
            <button className={`${styles.submit} ${styles.detailsEdit}`} type="button" aria-label="ویرایش سرویس" title="ویرایش سرویس" onClick={onEdit}><Pencil size={15} /></button>
            <button className={`${styles.danger} ${styles.detailsDelete}`} type="button" aria-label="حذف سرویس" title="حذف سرویس" onClick={onDelete}><Trash2 size={15} /></button>
          </div>
          <a className={`${styles.submit} ${styles.detailsOpen}`} href={service.link} target="_blank" rel="noreferrer">باز کردن سرویس <ArrowUpLeft size={15} /></a>
        </div>
      </section>
    </ModalLayer>
  );
}

function DeleteModal({ eyebrow, title, message, saveError, isDeleting, onClose, onDelete }: DeleteModalProps) {
  return (
    <ModalLayer className={`${styles.layer} ${styles.deleteLayer}`} onClose={onClose}>
      <section className={`${styles.confirmModal} ${styles.formModal}`} role="alertdialog" aria-modal="true" aria-labelledby="delete-modal-title">
        <div className={styles.confirmIcon}><Trash2 size={21} /></div>
        <ModalHeader eyebrow={eyebrow} title={title} description={message} titleId="delete-modal-title" closeLabel="بستن تأیید حذف" onClose={onClose} />
        <FormError message={saveError} />
        <ModalActions>
          <button className={styles.danger} type="button" disabled={isDeleting} onClick={onDelete}>
            {isDeleting ? <><LoaderCircle className={styles.spinner} size={15} /> در حال حذف...</> : <><Trash2 size={15} /> حذف</>}
          </button>
        </ModalActions>
      </section>
    </ModalLayer>
  );
}

export function DeleteServiceModal(props: Omit<DeleteModalProps, "eyebrow" | "title" | "message"> & { service: Service }) {
  return <DeleteModal {...props} eyebrow="حذف سرویس" title={`حذف «${props.service.title}»؟`} message="این سرویس برای همیشه از دسته‌بندی و داشبورد حذف خواهد شد. این عملیات قابل بازگشت نیست." />;
}

export function DeleteCategoryModal(props: Omit<DeleteModalProps, "eyebrow" | "title" | "message"> & { category: ServiceCategory }) {
  return <DeleteModal {...props} eyebrow="حذف دسته‌بندی" title={`حذف «${props.category.title}»؟`} message={`تمام ${props.category.services.length} سرویس این دسته‌بندی هم حذف خواهند شد. این عملیات قابل بازگشت نیست.`} />;
}

export function DeleteCompanyModal(props: Omit<DeleteModalProps, "eyebrow" | "title" | "message"> & { company: Company }) {
  return <DeleteModal {...props} eyebrow="حذف شرکت" title={`حذف ${props.company.name}؟`} message="تمام دسته‌بندی‌ها و سرویس‌های این شرکت نیز حذف خواهند شد. این عملیات قابل بازگشت نیست." />;
}

export function LogoutModal({ isLoggingOut, onClose, onConfirm }: LogoutModalProps) {
  return (
    <ModalLayer className={`${styles.layer} ${styles.deleteLayer}`} onClose={onClose}>
      <section className={`${styles.confirmModal} ${styles.formModal}`} role="alertdialog" aria-modal="true" aria-labelledby="logout-modal-title">
        <div className={styles.confirmIcon}><LogOut size={21} /></div>
        <ModalHeader eyebrow="خروج از پنل" title="از پنل خارج شوید؟" description="برای دسترسی دوباره، باید مجدداً با نام کاربری و رمز عبور وارد شوید." titleId="logout-modal-title" closeLabel="بستن پنجره خروج" onClose={onClose} />
        <ModalActions>
          <button className={styles.danger} type="button" disabled={isLoggingOut} onClick={onConfirm}>
            {isLoggingOut ? <><LoaderCircle className={styles.spinner} size={15} /> در حال خروج...</> : <><LogOut size={15} /> خروج از پنل</>}
          </button>
        </ModalActions>
      </section>
    </ModalLayer>
  );
}
