"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import type { KeyboardEvent as ReactKeyboardEvent } from "react";
import {
  LogOut,
  Pencil,
  Plus,
  Sparkles,
  Trash2,
} from "lucide-react";
import { DashboardProvider, useDashboardContext } from "@/context/DashboardContext/DashboardContext";
import ServiceSec, { ServiceIconVisual } from "@/components/ServiceSec/ServiceSec";
import CompanySec from "@/components/common/CompanySec/CompanySec";
import ThemeToggle from "@/components/ThemeToggle/ThemeToggle";
import {
  CategoryModal,
  CompanyModal,
  DeleteCategoryModal,
  DeleteCompanyModal,
  DeleteServiceModal,
  LogoutModal,
  ServiceDetailsModal,
  ServiceModal,
} from "@/components/Modal/Modal";

function DashboardContent() {
  const router = useRouter();
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const {
    companies,
    activeCompany,
    isModalOpen,
    isCompanyModalOpen,
    editingCompanyId,
    companyToDelete,
    companyContextMenu,
    isCategoryModalOpen,
    editingCategoryId,
    categoryContextMenu,
    serviceContextMenu,
    siteContextMenu,
    categoryToDelete,
    isSaving,
    isCompanySaving,
    isDeletingCompany,
    isDeletingCategory,
    isDeletingService,
    editingServiceId,
    selectedService,
    serviceToDelete,
    serviceForm,
    companyForm,
    categoryForm,
    isCategorySaving,
    saveError,
    serviceCategoryOptions,
    selectCompany,
    handleSiteContextMenu,
    handleCompanyContextMenu,
    closeServiceDetails,
    openDeleteServiceModal,
    closeDeleteServiceModal,
    deleteService,
    openEditServiceModal,
    closeServiceModal,
    saveService,
    openAddCompanyModal,
    openEditCompanyModal,
    closeCompanyModal,
    saveCompany,
    openDeleteCompanyModal,
    closeDeleteCompanyModal,
    deleteCompany,
    openAddCategoryModal,
    openEditCategoryModal,
    closeCategoryModal,
    saveCategory,
    openDeleteCategoryModal,
    closeDeleteCategoryModal,
    deleteCategory,
    setCompanyContextMenu,
    setCategoryContextMenu,
    setServiceContextMenu,
    setSiteContextMenu,
    setServiceForm,
    setCompanyForm,
    setCategoryForm,
  } = useDashboardContext();

  useEffect(() => {
    function handleContextMenuEscape(event: KeyboardEvent) {
      if (event.key !== "Escape") return;
      setCompanyContextMenu(null);
      setCategoryContextMenu(null);
      setServiceContextMenu(null);
      setSiteContextMenu(null);
    }

    document.addEventListener("keydown", handleContextMenuEscape);
    return () => document.removeEventListener("keydown", handleContextMenuEscape);
  }, [setCategoryContextMenu, setCompanyContextMenu, setServiceContextMenu, setSiteContextMenu]);

  useEffect(() => {
    if (!companyContextMenu && !categoryContextMenu && !serviceContextMenu && !siteContextMenu) return;
    const frame = window.requestAnimationFrame(() => {
      document.querySelector<HTMLElement>("[role='menu'] button[role='menuitem']")?.focus();
    });
    return () => window.cancelAnimationFrame(frame);
  }, [categoryContextMenu, companyContextMenu, serviceContextMenu, siteContextMenu]);

  function handleMenuKeyDown(event: ReactKeyboardEvent<HTMLElement>) {
    if (!(["ArrowDown", "ArrowUp", "Home", "End"].includes(event.key))) return;
    const items = Array.from(event.currentTarget.querySelectorAll<HTMLElement>("[role='menuitem']:not([disabled])"));
    if (items.length === 0) return;
    const currentIndex = items.indexOf(document.activeElement as HTMLElement);
    const nextIndex = event.key === "Home"
      ? 0
      : event.key === "End"
        ? items.length - 1
        : (currentIndex + (event.key === "ArrowUp" ? -1 : 1) + items.length) % items.length;
    event.preventDefault();
    items[nextIndex]?.focus();
  }

  async function handleLogout() {
    setIsLoggingOut(true);

    try {
      await fetch("/api/auth/logout", { method: "POST" });
    } finally {
      setIsLogoutModalOpen(false);
      setIsLoggingOut(false);
      router.replace("/login");
      router.refresh();
    }
  }

return (
    <main className="dashboard-shell min-h-screen" dir="rtl" onContextMenu={handleSiteContextMenu}>
      <div className="dashboard-container">
        {siteContextMenu && <div className="site-context-menu-layer" role="presentation" onClick={() => setSiteContextMenu(null)} onContextMenu={(event) => event.preventDefault()}><div className="site-context-menu" role="menu" aria-label="عملیات داشبورد" style={{ left: siteContextMenu.x, top: siteContextMenu.y }} onClick={(event) => event.stopPropagation()} onKeyDown={handleMenuKeyDown}>
          <button type="button" role="menuitem" onClick={openAddCompanyModal}><Plus size={15} /> افزودن شرکت</button>
          <button type="button" role="menuitem" disabled={!activeCompany} onClick={openAddCategoryModal}><Plus size={15} /> افزودن دسته‌بندی</button>
        </div></div>}

        <header className="dashboard-header">
          <div className="brand-lockup"><div className="brand-symbol" aria-hidden="true"><Sparkles size={19} strokeWidth={2} /></div><div><div className="brand-name">مرکز دسترسی شرکت</div><div className="brand-subtitle">داشبورد چندسازمانی سرویس‌ها</div></div></div>
          <div className="header-actions"><ThemeToggle /><button className="header-icon" type="button" aria-label="خروج از حساب" title="خروج" onClick={() => setIsLogoutModalOpen(true)}><LogOut size={17} /></button></div>
        </header>

        <CompanySec companies={companies} activeCompanyId={activeCompany?.id ?? ""} onSelectCompany={selectCompany} onCompanyContextMenu={handleCompanyContextMenu} onAddCompany={openAddCompanyModal} />

        {companyContextMenu && <div className="company-context-menu-layer" role="presentation" onClick={() => setCompanyContextMenu(null)} onKeyDown={(event) => { if (event.key === "Escape") setCompanyContextMenu(null); }}><div className="company-context-menu" role="menu" aria-label={`عملیات شرکت ${companyContextMenu.company.name}`} style={{ left: companyContextMenu.x, top: companyContextMenu.y }} onClick={(event) => event.stopPropagation()} onKeyDown={handleMenuKeyDown}><span className="company-context-menu-title">{companyContextMenu.company.name}</span><button type="button" role="menuitem" onClick={() => openEditCompanyModal(companyContextMenu.company)}><Pencil size={15} /> ویرایش شرکت</button><button className="company-context-menu-danger" type="button" role="menuitem" onClick={() => openDeleteCompanyModal(companyContextMenu.company)}><Trash2 size={15} /> حذف شرکت</button></div></div>}

        {categoryContextMenu && <div className="company-context-menu-layer" role="presentation" onClick={() => setCategoryContextMenu(null)} onKeyDown={(event) => { if (event.key === "Escape") setCategoryContextMenu(null); }}><div className="company-context-menu" role="menu" aria-label={`عملیات دسته‌بندی ${categoryContextMenu.category.title}`} style={{ left: categoryContextMenu.x, top: categoryContextMenu.y }} onClick={(event) => event.stopPropagation()} onKeyDown={handleMenuKeyDown}><span className="company-context-menu-title">{categoryContextMenu.category.title}</span><button type="button" role="menuitem" onClick={() => openEditCategoryModal(categoryContextMenu.category)}><Pencil size={15} /> ویرایش دسته‌بندی</button><button className="company-context-menu-danger" type="button" role="menuitem" onClick={() => openDeleteCategoryModal(categoryContextMenu.category)}><Trash2 size={15} /> حذف دسته‌بندی</button></div></div>}

        {serviceContextMenu && <div className="company-context-menu-layer" role="presentation" onClick={() => setServiceContextMenu(null)} onKeyDown={(event) => { if (event.key === "Escape") setServiceContextMenu(null); }}><div className="company-context-menu" role="menu" aria-label={`عملیات سرویس ${serviceContextMenu.service.title}`} style={{ left: serviceContextMenu.x, top: serviceContextMenu.y }} onClick={(event) => event.stopPropagation()} onKeyDown={handleMenuKeyDown}><span className="company-context-menu-title">{serviceContextMenu.service.title}</span><button type="button" role="menuitem" onClick={() => openEditServiceModal(serviceContextMenu.service)}><Pencil size={15} /> ویرایش سرویس</button><button className="company-context-menu-danger" type="button" role="menuitem" onClick={() => openDeleteServiceModal(serviceContextMenu.service)}><Trash2 size={15} /> حذف سرویس</button></div></div>}

        <ServiceSec />

      </div>

      {isModalOpen && activeCompany && <ServiceModal
        activeCompany={activeCompany}
        editingServiceId={editingServiceId}
        isSaving={isSaving}
        saveError={saveError}
        serviceForm={serviceForm}
        serviceCategoryOptions={serviceCategoryOptions}
        onClose={closeServiceModal}
        onSubmit={saveService}
        onChange={setServiceForm}
      />}

      {isCategoryModalOpen && activeCompany && <CategoryModal
        activeCompany={activeCompany}
        editingCategoryId={editingCategoryId}
        isSaving={isCategorySaving}
        saveError={saveError}
        categoryForm={categoryForm}
        onClose={closeCategoryModal}
        onSubmit={saveCategory}
        onChange={setCategoryForm}
      />}

      {selectedService && <ServiceDetailsModal
        service={selectedService}
        icon={<ServiceIconVisual service={selectedService} size={22} />}
        saveError={saveError}
        onClose={closeServiceDetails}
        onEdit={() => openEditServiceModal(selectedService)}
        onDelete={() => openDeleteServiceModal()}
      />}

      {serviceToDelete && <DeleteServiceModal
        service={serviceToDelete}
        saveError={saveError}
        isDeleting={isDeletingService}
        onClose={closeDeleteServiceModal}
        onDelete={() => void deleteService()}
      />}

      {categoryToDelete && <DeleteCategoryModal
        category={categoryToDelete}
        saveError={saveError}
        isDeleting={isDeletingCategory}
        onClose={closeDeleteCategoryModal}
        onDelete={() => void deleteCategory()}
      />}

      {isLogoutModalOpen && <LogoutModal
        isLoggingOut={isLoggingOut}
        onClose={() => setIsLogoutModalOpen(false)}
        onConfirm={() => void handleLogout()}
      />}

      {isCompanyModalOpen && <CompanyModal
        editingCompanyId={editingCompanyId}
        isSaving={isCompanySaving}
        saveError={saveError}
        companyForm={companyForm}
        onClose={closeCompanyModal}
        onSubmit={saveCompany}
        onChange={setCompanyForm}
      />}

      {companyToDelete && <DeleteCompanyModal
        company={companyToDelete}
        saveError={saveError}
        isDeleting={isDeletingCompany}
        onClose={closeDeleteCompanyModal}
        onDelete={() => void deleteCompany()}
      />}

    </main>
  );
}

export default function DashboardPage() {
  return (
    <DashboardProvider>
      <DashboardContent />
    </DashboardProvider>
  );
}
