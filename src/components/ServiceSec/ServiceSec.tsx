"use client";

/* Service icons use user-provided URLs, so they intentionally remain plain images. */
/* eslint-disable @next/next/no-img-element */

import { useState } from "react";
import { ArrowUpLeft, GripVertical, LayoutGrid, Plus, Search } from "lucide-react";
import type { Service } from "@/context/DashboardContext/DashboardContext";
import { useDashboardContext } from "@/context/DashboardContext/DashboardContext";
import CategorySec from "@/components/common/CategorySec/CategorySec";
import EmptyBox from "@/components/common/EmptyBox/EmptyBox";
import ErrorBox from "@/components/common/ErrorBox/ErrorBox";
import Loading from "@/components/common/loading/Loading";
import styles from "./ServiceSec.module.css";

export function ServiceIconVisual({ service, className = "", size = 16 }: { service: Service; className?: string; size?: number }) {
  const imageUrl = service.iconUrl ?? service.logo;
  const [failedImageUrl, setFailedImageUrl] = useState<string | null>(null);
  const FallbackIcon = service.icon;
  const showImage = Boolean(imageUrl) && imageUrl !== failedImageUrl;

  return (
    <span className={`${styles.icon} compact-service-icon compact-service-icon-${service.tone} ${showImage ? "compact-service-logo" : ""} ${className}`.trim()}>
      {showImage ? <img className={`${styles.iconImage} service-icon-image`} src={imageUrl ?? ""} alt="" onError={() => setFailedImageUrl(imageUrl ?? null)} /> : <FallbackIcon size={size} />}
    </span>
  );
}

export default function ServiceSec() {
  const {
    isLoading,
    activeCompany,
    loadError,
    reorderError,
    searchQuery,
    sortOption,
    searchResults,
    categoryOptions,
    displayedCategories,
    selectedCategory,
    canReorder,
    serviceCount,
    visibleCategories,
    visibleServiceCount,
    selectedCategoryHasNoServices,
    draggedCategoryOrderId,
    dropTargetCategoryId,
    draggedServiceId,
    dropTargetServiceId,
    canReorderCategories,
    loadDashboard,
    setSearchQuery,
    setSelectedCategory,
    setSortOption,
    setReorderError,
    openServiceDetails,
    openAddCompanyModal,
    openAddServiceModal,
    openAddCategoryModal,
    handleCategoryContextMenu,
    handleCategoryKeyboardContextMenu,
    handleCategoryDragStart,
    handleCategoryDragOver,
    handleCategoryDrop,
    clearCategoryDragState,
    handleServiceContextMenu,
    handleServiceDragStart,
    handleServiceDragOver,
    handleServiceDrop,
    clearDragState,
  } = useDashboardContext();

  return (
    <div className={styles.section}>
      {loadError && <ErrorBox message={loadError} actionLabel="تلاش دوباره" onAction={() => void loadDashboard()} />}
      {reorderError && <ErrorBox message={reorderError} actionLabel="بستن" onAction={() => setReorderError("")} />}

      {isLoading ? <Loading /> : !activeCompany ? <EmptyBox icon={<LayoutGrid size={25} />} title="هنوز شرکتی ثبت نشده است" description="برای شروع، اولین شرکت را بسازید و سرویس‌های آن را اضافه کنید." actionLabel="افزودن اولین شرکت" onAction={openAddCompanyModal} /> : <section className="content-section services-section" aria-labelledby="services-title">
        <section className="service-filters glass-card" aria-label="جست‌وجو و فیلتر سرویس‌ها">
          <div className="filter-toolbar">
            <div className="filter-search-wrap">
              <label className="filter-search" aria-label="جست‌وجو بین سرویس‌ها"><Search size={16} /><input value={searchQuery} onChange={(event) => setSearchQuery(event.target.value)} placeholder="جست‌وجوی سرویس‌ها..." type="search" /></label>
              {searchQuery.trim() && <div className="search-results filter-search-results" role="listbox" aria-label="نتایج جست‌وجو"><div className="search-results-heading">نتایج جست‌وجو <span>{searchResults.length}</span></div>{searchResults.length > 0 ? searchResults.slice(0, 8).map((service) => <button className="search-result" type="button" role="option" aria-selected={false} key={service.id} onClick={() => { setSelectedCategory(service.categoryId); setSearchQuery(""); openServiceDetails(service); }}><ServiceIconVisual service={service} className="search-result-icon" size={15} /><span className="search-result-copy"><strong>{service.title}</strong><small>{service.categoryTitle} · {service.description || "بدون توضیحات"}</small></span><ArrowUpLeft size={14} /></button>) : <p className="search-empty">سرویسی با این عبارت پیدا نشد.</p>}</div>}
            </div>
            <div className="toolbar-actions">
              <label className="sort-control"><span>مرتب‌سازی</span><select value={sortOption} onChange={(event) => setSortOption(event.target.value as typeof sortOption)}><option value="custom">ترتیب سفارشی</option><option value="name">نام A-Z</option><option value="latest">جدیدترین</option></select></label>
              <button className="section-action service-add-action" type="button" onClick={openAddServiceModal}><Plus size={16} /> افزودن سرویس</button>
            </div>
          </div>
          <CategorySec
            categories={categoryOptions}
            categoryCount={displayedCategories.length}
            selectedCategory={selectedCategory}
            onSelectCategory={(categoryId) => { setSelectedCategory(categoryId); setSearchQuery(""); }}
            onCategoryContextMenu={(event, categoryId) => {
              const sourceCategory = displayedCategories.find((item) => item.id === categoryId);
              if (sourceCategory) handleCategoryContextMenu(event, sourceCategory);
            }}
            onAddCategory={openAddCategoryModal}
          />
        </section>
        <div className="section-heading"><div><h2 id="services-title">سرویس‌های {activeCompany.name}</h2><span>{visibleServiceCount === serviceCount ? `${serviceCount} سرویس فعال` : `${visibleServiceCount} از ${serviceCount} سرویس نمایش داده می‌شود`} · {activeCompany.subtitle || "فضای مدیریت سرویس‌های شرکت"}</span></div></div>
        {serviceCount === 0 || selectedCategoryHasNoServices ? (
          <EmptyBox small icon={<LayoutGrid size={22} />} title="هنوز سرویسی ثبت نشده است" description="اولین سرویس را ثبت کنید و دسته‌بندی مناسب آن را انتخاب کنید." actionLabel="افزودن سرویس" onAction={openAddServiceModal} />
        ) : visibleCategories.length === 0 ? (
          <EmptyBox small icon={<Search size={22} />} title="نتیجه‌ای پیدا نشد" description="عبارت جست‌وجو یا دسته‌بندی دیگری را امتحان کنید." actionLabel="پاک‌کردن فیلترها" onAction={() => { setSearchQuery(""); setSelectedCategory("all"); setSortOption("custom"); }} />
        ) : (
          <div className="service-rows">
            {visibleCategories.map((category) => {
              const CategoryIcon = category.icon;
              const visibleServices = category.services;

              return (
                <section className="service-row glass-card" key={category.id}>
                  <div className={`service-row-label ${draggedCategoryOrderId === category.id ? "service-row-category-dragging" : ""} ${dropTargetCategoryId === category.id ? "service-row-category-drop-target" : ""}`} role="button" tabIndex={0} aria-haspopup="menu" onContextMenu={(event) => handleCategoryContextMenu(event, category)} onKeyDown={(event) => { if (event.key === "ContextMenu" || (event.shiftKey && event.key === "F10")) { event.preventDefault(); handleCategoryKeyboardContextMenu(category, event.currentTarget); } else if (event.key === "Enter" || event.key === " ") { event.preventDefault(); setSelectedCategory(category.id); setSearchQuery(""); } }} onDragOver={(event) => handleCategoryDragOver(event, category.id)} onDrop={(event) => void handleCategoryDrop(event, category.id)}>
                    <span className="category-icon"><CategoryIcon size={17} /></span>
                    <div><h3>{category.title}</h3><span>{category.services.length} سرویس</span></div>
                    <div className="category-label-actions"><button className="category-drag-handle" type="button" draggable={canReorderCategories} aria-label={`جابجایی دسته‌بندی ${category.title}`} title="برای تغییر ترتیب بکشید" onDragStart={(event) => handleCategoryDragStart(event, category.id)} onDragEnd={clearCategoryDragState}><GripVertical size={17} /></button></div>
                  </div>
                  <div className="service-row-list">
                    {visibleServices.map((service) => (
                      <div className={`row-service-card ${draggedServiceId === service.id ? "row-service-card-dragging" : ""} ${dropTargetServiceId === service.id ? "row-service-card-drop-target" : ""}`} key={service.id} draggable={canReorder} role="button" tabIndex={0} aria-haspopup="menu" aria-label={`نمایش اطلاعات ${service.title}`} title={service.title} onClick={() => openServiceDetails(service)} onContextMenu={(event) => handleServiceContextMenu(event, service)} onKeyDown={(event) => { if (event.key === "Enter" || event.key === " ") { event.preventDefault(); openServiceDetails(service); } }} onDragStart={(event) => handleServiceDragStart(event, service, category.id)} onDragOver={(event) => handleServiceDragOver(event, service.id, category.id)} onDrop={(event) => void handleServiceDrop(event, service.id, category.id)} onDragEnd={clearDragState}>
                        <div className="row-service-main">
                          <ServiceIconVisual service={service} />
                          <span className="row-service-copy"><span className="row-service-name">{service.title}</span></span>
                        </div>
                      </div>
                    ))}
                  </div>
                </section>
              );
            })}
          </div>
        )}
      </section>}
    </div>
  );
}
