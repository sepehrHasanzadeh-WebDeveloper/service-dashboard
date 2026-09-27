"use client";

import { createContext, useCallback, useContext, useEffect, useState, type DragEvent, type FormEvent, type MouseEvent, type ReactNode } from "react";
import {
  Activity,
  BarChart3,
  BookOpen,
  Cloud,
  Code2,
  Container,
  Database,
  GitBranch,
  KeyRound,
  LayoutGrid,
  MessageSquare,
  MonitorCog,
  Server,
  ShieldCheck,
  Users,
} from "lucide-react";

export type IconComponent = typeof Activity;

export type Service = {
  id: string;
  name?: string | null;
  title: string;
  description: string;
  link: string;
  icon: IconComponent;
  iconUrl?: string | null;
  tone: string;
  order: number;
  logo?: string | null;
  logoName?: string | null;
  categoryId: string;
  categoryTitle: string;
  createdAt: string;
};

export type ServiceCategory = {
  id: string;
  title: string;
  icon: IconComponent;
  services: Service[];
};

export type Company = {
  id: string;
  name: string;
  subtitle?: string | null;
  link?: string | null;
  icon?: string | null;
  categories: ServiceCategory[];
};

type ApiService = {
  id: string;
  name?: string | null;
  title: string;
  description: string;
  link: string;
  icon?: string | null;
  tone: string;
  order: number;
  logo?: string | null;
  logoName?: string | null;
  createdAt: string;
};

type ApiCompany = {
  id: string;
  name: string;
  subtitle?: string | null;
  link?: string | null;
  icon?: string | null;
  categories: Array<{
    id: string;
    title: string;
    services: ApiService[];
  }>;
};

type ApiCategories = {
  categories?: string[];
};

export type ServiceForm = {
  title: string;
  description: string;
  link: string;
  categoryId: string;
};

export type CompanyForm = {
  name: string;
  subtitle: string;
  link: string;
};

export type CategoryForm = {
  title: string;
};

type CompanyContextMenu = {
  company: Company;
  x: number;
  y: number;
};

type CategoryContextMenu = {
  category: ServiceCategory;
  x: number;
  y: number;
};

type ServiceContextMenu = {
  service: Service;
  x: number;
  y: number;
};

type SiteContextMenu = {
  x: number;
  y: number;
};

export type SortOption = "name" | "latest" | "custom";

const iconMap: Record<string, IconComponent> = {
  Activity,
  BarChart3,
  BookOpen,
  Cloud,
  Code2,
  Container,
  Database,
  GitBranch,
  KeyRound,
  LayoutGrid,
  MessageSquare,
  MonitorCog,
  Server,
  ShieldCheck,
  Users,
};

const categoryIconMap: Record<string, IconComponent> = {
  "پایگاه‌های داده": Database,
  "DevOps و توسعه": GitBranch,
  "توسعه و تحویل": GitBranch,
  "زیرساخت و کلاود": Cloud,
  "زیرساخت و شبکه": Cloud,
  "شبکه و ارتباطات": Cloud,
  "مانیتورینگ و لاگینگ": MonitorCog,
  "امنیت و دسترسی": ShieldCheck,
  "امنیت و ارتباطات": ShieldCheck,
  "محصول و تحلیل": BarChart3,
  "داده و گزارش": BarChart3,
  "پشتیبانی و کاربران": Users,
  "پشتیبانی و همکاری": Users,
  "ذخیره‌سازی و فایل": Cloud,
  "پیام‌رسانی و اتوماسیون": MessageSquare,
};

const emptyServiceForm: ServiceForm = { title: "", description: "", link: "", categoryId: "" };
const emptyCompanyForm: CompanyForm = { name: "", subtitle: "", link: "" };
const emptyCategoryForm: CategoryForm = { title: "" };

function normalizeCompanies(data: ApiCompany[]): Company[] {
  return data.map((company) => ({
    ...company,
    categories: company.categories.map((category) => ({
      ...category,
      icon: categoryIconMap[category.title] ?? LayoutGrid,
      services: category.services.map((service) => ({
        ...service,
        categoryId: category.id,
        categoryTitle: category.title,
        icon: iconMap[service.icon ?? ""] ?? categoryIconMap[category.title] ?? Activity,
        iconUrl: service.icon?.startsWith("http://") || service.icon?.startsWith("https://") ? service.icon : null,
      })),
    })),
  }));
}

async function readApiPayload(response: Response) {
  const payload = await response.json().catch(() => ({})) as { error?: string };
  if (!response.ok) throw new Error(payload.error || "درخواست با خطا مواجه شد.");
  return payload;
}

function sortServices(services: Service[], sortOption: SortOption) {
  if (sortOption === "name") {
    return [...services].sort((first, second) => first.title.localeCompare(second.title, "fa-IR", { numeric: true, sensitivity: "base" }));
  }
  if (sortOption === "latest") {
    return [...services].sort((first, second) => new Date(second.createdAt).getTime() - new Date(first.createdAt).getTime());
  }
  return services;
}

function useDashboardController() {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [availableCategoryTitles, setAvailableCategoryTitles] = useState<string[]>([]);
  const [activeCompanyId, setActiveCompanyId] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isCompanyModalOpen, setIsCompanyModalOpen] = useState(false);
  const [editingCompanyId, setEditingCompanyId] = useState<string | null>(null);
  const [companyToDelete, setCompanyToDelete] = useState<Company | null>(null);
  const [companyContextMenu, setCompanyContextMenu] = useState<CompanyContextMenu | null>(null);
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [editingCategoryId, setEditingCategoryId] = useState<string | null>(null);
  const [categoryContextMenu, setCategoryContextMenu] = useState<CategoryContextMenu | null>(null);
  const [serviceContextMenu, setServiceContextMenu] = useState<ServiceContextMenu | null>(null);
  const [siteContextMenu, setSiteContextMenu] = useState<SiteContextMenu | null>(null);
  const [categoryToDelete, setCategoryToDelete] = useState<ServiceCategory | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isCompanySaving, setIsCompanySaving] = useState(false);
  const [isDeletingCompany, setIsDeletingCompany] = useState(false);
  const [isDeletingCategory, setIsDeletingCategory] = useState(false);
  const [isDeletingService, setIsDeletingService] = useState(false);
  const [editingServiceId, setEditingServiceId] = useState<string | null>(null);
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [serviceToDelete, setServiceToDelete] = useState<Service | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [sortOption, setSortOption] = useState<SortOption>("custom");
  const [draggedServiceId, setDraggedServiceId] = useState<string | null>(null);
  const [draggedCategoryId, setDraggedCategoryId] = useState<string | null>(null);
  const [dropTargetServiceId, setDropTargetServiceId] = useState<string | null>(null);
  const [draggedCategoryOrderId, setDraggedCategoryOrderId] = useState<string | null>(null);
  const [dropTargetCategoryId, setDropTargetCategoryId] = useState<string | null>(null);
  const [isReordering, setIsReordering] = useState(false);
  const [isCategoryReordering, setIsCategoryReordering] = useState(false);
  const [serviceForm, setServiceForm] = useState<ServiceForm>(emptyServiceForm);
  const [companyForm, setCompanyForm] = useState<CompanyForm>(emptyCompanyForm);
  const [categoryForm, setCategoryForm] = useState<CategoryForm>(emptyCategoryForm);
  const [isCategorySaving, setIsCategorySaving] = useState(false);
  const [loadError, setLoadError] = useState("");
  const [saveError, setSaveError] = useState("");
  const [reorderError, setReorderError] = useState("");

  const loadDashboard = useCallback(async (showLoading = true) => {
    if (showLoading) setIsLoading(true);
    setLoadError("");

    try {
      const [companiesResponse, categoriesResponse] = await Promise.all([
        fetch("/api/companies", { cache: "no-store" }),
        fetch("/api/categories", { cache: "no-store" }),
      ]);
      const payload = await readApiPayload(companiesResponse) as { companies?: ApiCompany[] };
      const categoryPayload = await readApiPayload(categoriesResponse) as ApiCategories;
      setAvailableCategoryTitles(categoryPayload.categories ?? []);
      const nextCompanies = normalizeCompanies(payload.companies ?? []);
      setCompanies(nextCompanies);
      setActiveCompanyId((current) => nextCompanies.some((company) => company.id === current) ? current : nextCompanies[0]?.id ?? "");
      return nextCompanies;
    } catch (error) {
      setLoadError(error instanceof Error ? error.message : "دریافت داشبورد با خطا مواجه شد.");
      return [];
    } finally {
      if (showLoading) setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(() => { void loadDashboard(); }, 0);
    return () => window.clearTimeout(timer);
  }, [loadDashboard]);

  const activeCompany = companies.find((company) => company.id === activeCompanyId);
  const displayedCategories = activeCompany?.categories ?? [];
  const serviceCount = displayedCategories.reduce((count, category) => count + category.services.length, 0);
  const normalizedQuery = searchQuery.trim().toLocaleLowerCase("fa-IR");
  const allServices = displayedCategories.flatMap((category) => category.services);
  const searchResults = allServices.filter((service) => normalizedQuery && [service.name ?? "", service.title, service.description, service.categoryTitle].some((value) => value.toLocaleLowerCase("fa-IR").includes(normalizedQuery)));
  const categoryOptions = [{ id: "all", title: "همه سرویس‌ها", count: serviceCount }, ...displayedCategories.map((category) => ({ id: category.id, title: category.title, count: category.services.length }))];
  const visibleCategories = displayedCategories
    .filter((category) => selectedCategory === "all" || category.id === selectedCategory)
    .map((category) => ({ ...category, services: sortServices(category.services.filter((service) => !normalizedQuery || [service.name ?? "", service.title, service.description, category.title].some((value) => value.toLocaleLowerCase("fa-IR").includes(normalizedQuery))), sortOption) }))
    .filter((category) => category.services.length > 0);
  const visibleServiceCount = visibleCategories.reduce((count, category) => count + category.services.length, 0);
  const selectedCategoryHasNoServices = selectedCategory !== "all" && !normalizedQuery && displayedCategories.some((category) => category.id === selectedCategory && category.services.length === 0);
  const hasActiveFilters = Boolean(normalizedQuery) || selectedCategory !== "all";
  const canReorder = sortOption === "custom" && !hasActiveFilters && !isReordering;
  const canReorderCategories = canReorder && !isCategoryReordering;
  const serviceCategoryOptions = activeCompany?.categories.length
    ? activeCompany.categories
    : availableCategoryTitles.map((title) => ({ id: `category-title:${title}`, title }));

  function selectCompany(companyId: string) {
    setCompanyContextMenu(null);
    setCategoryContextMenu(null);
    setServiceContextMenu(null);
    setSiteContextMenu(null);
    setActiveCompanyId(companyId);
    setSelectedCategory("all");
    setSearchQuery("");
    setSortOption("custom");
    setReorderError("");
    setSelectedService(null);
  }

  function handleCompanyContextMenu(event: MouseEvent<HTMLButtonElement>, company: Company) {
    event.preventDefault();
    event.stopPropagation();
    setCategoryContextMenu(null);
    setSiteContextMenu(null);
    const menuWidth = 190;
    const menuHeight = 126;
    setCompanyContextMenu({
      company,
      x: Math.max(8, Math.min(event.clientX, window.innerWidth - menuWidth - 8)),
      y: Math.max(8, Math.min(event.clientY, window.innerHeight - menuHeight - 8)),
    });
  }

  function handleCategoryContextMenu(event: MouseEvent<HTMLElement>, category: ServiceCategory) {
    event.preventDefault();
    event.stopPropagation();
    setCompanyContextMenu(null);
    setServiceContextMenu(null);
    setSiteContextMenu(null);
    const menuWidth = 190;
    const menuHeight = 126;
    setCategoryContextMenu({
      category,
      x: Math.max(8, Math.min(event.clientX, window.innerWidth - menuWidth - 8)),
      y: Math.max(8, Math.min(event.clientY, window.innerHeight - menuHeight - 8)),
    });
  }

  function handleCategoryKeyboardContextMenu(category: ServiceCategory, element: HTMLElement) {
    setCompanyContextMenu(null);
    setServiceContextMenu(null);
    setSiteContextMenu(null);
    const rect = element.getBoundingClientRect();
    const menuWidth = 190;
    const menuHeight = 126;
    setCategoryContextMenu({
      category,
      x: Math.max(8, Math.min(rect.left, window.innerWidth - menuWidth - 8)),
      y: Math.max(8, Math.min(rect.bottom, window.innerHeight - menuHeight - 8)),
    });
  }

  function handleServiceContextMenu(event: MouseEvent<HTMLDivElement>, service: Service) {
    event.preventDefault();
    event.stopPropagation();
    setCompanyContextMenu(null);
    setCategoryContextMenu(null);
    setSiteContextMenu(null);
    const menuWidth = 190;
    const menuHeight = 126;
    setServiceContextMenu({
      service,
      x: Math.max(8, Math.min(event.clientX, window.innerWidth - menuWidth - 8)),
      y: Math.max(8, Math.min(event.clientY, window.innerHeight - menuHeight - 8)),
    });
  }

  function handleSiteContextMenu(event: MouseEvent<HTMLElement>) {
    event.preventDefault();
    const menuWidth = 210;
    const menuHeight = 84;
    setCompanyContextMenu(null);
    setCategoryContextMenu(null);
    setServiceContextMenu(null);
    setSiteContextMenu({
      x: Math.max(8, Math.min(event.clientX, window.innerWidth - menuWidth - 8)),
      y: Math.max(8, Math.min(event.clientY, window.innerHeight - menuHeight - 8)),
    });
  }

  function openServiceDetails(service: Service) {
    setServiceContextMenu(null);
    setSelectedService(service);
    setSaveError("");
  }

  function closeServiceDetails() {
    setSelectedService(null);
    setServiceToDelete(null);
  }

  function openDeleteServiceModal(service = selectedService) {
    if (!service) return;
    setServiceContextMenu(null);
    setServiceToDelete(service);
    setSaveError("");
  }

  function closeDeleteServiceModal(force = false) {
    if (isDeletingService && !force) return;
    setServiceToDelete(null);
    setSaveError("");
  }

  async function deleteService() {
    if (!serviceToDelete || isDeletingService) return;

    setIsDeletingService(true);
    setSaveError("");

    try {
      const response = await fetch(`/api/services/${serviceToDelete.id}`, { method: "DELETE" });
      await readApiPayload(response);
      await loadDashboard(false);
      setSelectedService(null);
      closeDeleteServiceModal(true);
    } catch (error) {
      setSaveError(error instanceof Error ? error.message : "حذف سرویس با خطا مواجه شد.");
    } finally {
      setIsDeletingService(false);
    }
  }

  function clearDragState() {
    setDraggedServiceId(null);
    setDraggedCategoryId(null);
    setDropTargetServiceId(null);
  }

  function clearCategoryDragState() {
    setDraggedCategoryOrderId(null);
    setDropTargetCategoryId(null);
  }

  function handleCategoryDragStart(event: DragEvent<HTMLButtonElement>, categoryId: string) {
    if (!canReorderCategories) return;
    event.dataTransfer.effectAllowed = "move";
    event.dataTransfer.setData("text/plain", categoryId);
    setDraggedCategoryOrderId(categoryId);
    setDropTargetCategoryId(null);
  }

  function handleCategoryDragOver(event: DragEvent<HTMLElement>, categoryId: string) {
    if (!canReorderCategories || !draggedCategoryOrderId || draggedCategoryOrderId === categoryId) return;
    event.preventDefault();
    event.dataTransfer.dropEffect = "move";
    setDropTargetCategoryId(categoryId);
  }

  async function handleCategoryDrop(event: DragEvent<HTMLElement>, targetCategoryId: string) {
    event.preventDefault();
    const sourceCategoryId = draggedCategoryOrderId;
    clearCategoryDragState();
    if (!canReorderCategories || !sourceCategoryId || sourceCategoryId === targetCategoryId || !activeCompany) return;

    const visibleCategoryIds = visibleCategories.map((category) => category.id);
    const sourceIndex = visibleCategoryIds.indexOf(sourceCategoryId);
    const targetIndex = visibleCategoryIds.indexOf(targetCategoryId);
    if (sourceIndex < 0 || targetIndex < 0) return;

    const reorderedVisibleIds = [...visibleCategoryIds];
    const [movedCategoryId] = reorderedVisibleIds.splice(sourceIndex, 1);
    reorderedVisibleIds.splice(targetIndex, 0, movedCategoryId);
    const visibleIdSet = new Set(visibleCategoryIds);
    const reorderedCategoryIds = [
      ...reorderedVisibleIds,
      ...activeCompany.categories.filter((category) => !visibleIdSet.has(category.id)).map((category) => category.id),
    ];
    const categoryById = new Map(activeCompany.categories.map((category) => [category.id, category]));
    const reorderedCategories = reorderedCategoryIds.map((id) => categoryById.get(id)).filter((category): category is ServiceCategory => Boolean(category));

    setCompanies((current) => current.map((company) => company.id !== activeCompany.id ? company : { ...company, categories: reorderedCategories }));
    setIsCategoryReordering(true);
    setReorderError("");

    try {
      const response = await fetch("/api/categories/reorder", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ companyId: activeCompany.id, categoryIds: reorderedCategoryIds }),
      });
      await readApiPayload(response);
      setReorderError("");
    } catch (error) {
      await loadDashboard(false);
      setReorderError(error instanceof Error ? error.message : "ذخیره ترتیب دسته‌بندی‌ها با خطا مواجه شد.");
    } finally {
      setIsCategoryReordering(false);
    }
  }

  function handleServiceDragStart(event: DragEvent<HTMLDivElement>, service: Service, categoryId: string) {
    if (!canReorder) return;
    event.dataTransfer.effectAllowed = "move";
    event.dataTransfer.setData("text/plain", service.id);
    setDraggedServiceId(service.id);
    setDraggedCategoryId(categoryId);
    setDropTargetServiceId(null);
  }

  function handleServiceDragOver(event: DragEvent<HTMLDivElement>, serviceId: string, categoryId: string) {
    if (!canReorder || !draggedServiceId || draggedCategoryId !== categoryId || draggedServiceId === serviceId) return;
    event.preventDefault();
    event.dataTransfer.dropEffect = "move";
    setDropTargetServiceId(serviceId);
  }

  async function handleServiceDrop(event: DragEvent<HTMLDivElement>, targetServiceId: string, categoryId: string) {
    event.preventDefault();
    const sourceServiceId = draggedServiceId;
    const sourceCategoryId = draggedCategoryId;
    clearDragState();
    if (!canReorder || !sourceServiceId || !sourceCategoryId || sourceCategoryId !== categoryId || sourceServiceId === targetServiceId || !activeCompany) return;

    const category = activeCompany.categories.find((item) => item.id === categoryId);
    if (!category) return;
    const sourceIndex = category.services.findIndex((service) => service.id === sourceServiceId);
    const targetIndex = category.services.findIndex((service) => service.id === targetServiceId);
    if (sourceIndex < 0 || targetIndex < 0) return;

    const reorderedServices = [...category.services];
    const [movedService] = reorderedServices.splice(sourceIndex, 1);
    reorderedServices.splice(targetIndex, 0, movedService);
    const serviceIds = reorderedServices.map((service) => service.id);

    setCompanies((current) => current.map((company) => company.id !== activeCompany.id ? company : {
      ...company,
      categories: company.categories.map((item) => item.id === categoryId ? { ...item, services: reorderedServices } : item),
    }));
    setIsReordering(true);
    setReorderError("");

    try {
      const response = await fetch("/api/services/reorder", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ companyId: activeCompany.id, categoryId, serviceIds }),
      });
      await readApiPayload(response);
      setReorderError("");
    } catch (error) {
      await loadDashboard(false);
      setReorderError(error instanceof Error ? error.message : "ذخیره ترتیب سرویس‌ها با خطا مواجه شد.");
    } finally {
      setIsReordering(false);
    }
  }

  function openAddServiceModal() {
    if (!activeCompany) return;
    setSiteContextMenu(null);
    setEditingServiceId(null);
    const preferredCategoryId = selectedCategory !== "all" && activeCompany.categories.some((category) => category.id === selectedCategory)
      ? selectedCategory
      : serviceCategoryOptions[0]?.id ?? "";
    setServiceForm({ ...emptyServiceForm, categoryId: preferredCategoryId });
    setSaveError("");
    setIsModalOpen(true);
  }

  function openEditServiceModal(service: Service) {
    setServiceContextMenu(null);
    setSiteContextMenu(null);
    setSelectedService(null);
    setEditingServiceId(service.id);
    setServiceForm({ title: service.title, description: service.description, link: service.link, categoryId: service.categoryId });
    setSaveError("");
    setIsModalOpen(true);
  }

  function closeServiceModal() {
    if (isSaving) return;
    setIsModalOpen(false);
    setEditingServiceId(null);
    setServiceForm(emptyServiceForm);
    setSaveError("");
  }

  async function saveService(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!activeCompany || isSaving) return;

    setIsSaving(true);
    setSaveError("");

    try {
      const selectedCategory = activeCompany.categories.find((category) => category.id === serviceForm.categoryId);
      const categoryTitle = selectedCategory?.title ?? (serviceForm.categoryId.startsWith("category-title:") ? serviceForm.categoryId.slice("category-title:".length) : "");
      const response = await fetch(editingServiceId ? `/api/services/${editingServiceId}` : "/api/services", {
        method: editingServiceId ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: serviceForm.title.trim(),
          description: serviceForm.description.trim(),
          link: serviceForm.link.trim(),
          companyId: activeCompany.id,
          categoryId: selectedCategory?.id ?? "",
          categoryTitle,
        }),
      });
      await readApiPayload(response);
      await loadDashboard(false);
      closeServiceModal();
    } catch (error) {
      setSaveError(error instanceof Error ? error.message : "ذخیره سرویس با خطا مواجه شد.");
    } finally {
      setIsSaving(false);
    }
  }

  function openAddCompanyModal() {
    setCompanyContextMenu(null);
    setCategoryContextMenu(null);
    setSiteContextMenu(null);
    setEditingCompanyId(null);
    setCompanyForm(emptyCompanyForm);
    setSaveError("");
    setIsCompanyModalOpen(true);
  }

  function openEditCompanyModal(company: Company) {
    setCompanyContextMenu(null);
    setCategoryContextMenu(null);
    setSiteContextMenu(null);
    setEditingCompanyId(company.id);
    setCompanyForm({ name: company.name, subtitle: company.subtitle ?? "", link: company.link ?? "" });
    setSaveError("");
    setIsCompanyModalOpen(true);
  }

  function closeCompanyModal(force = false) {
    if (isCompanySaving && !force) return;
    setIsCompanyModalOpen(false);
    setEditingCompanyId(null);
    setCompanyForm(emptyCompanyForm);
    setSaveError("");
  }

  async function saveCompany(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (isCompanySaving) return;

    setIsCompanySaving(true);
    setSaveError("");

    try {
      const response = await fetch(editingCompanyId ? `/api/companies/${editingCompanyId}` : "/api/companies", { method: editingCompanyId ? "PATCH" : "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(companyForm) });
      const payload = await readApiPayload(response) as { company?: { id: string } };
      const nextCompanies = await loadDashboard(false);
      if (editingCompanyId) setActiveCompanyId(editingCompanyId);
      else if (payload.company) setActiveCompanyId(payload.company.id);
      else if (nextCompanies.length > 0) setActiveCompanyId(nextCompanies[nextCompanies.length - 1].id);
      closeCompanyModal(true);
    } catch (error) {
      setSaveError(error instanceof Error ? error.message : "ثبت شرکت با خطا مواجه شد.");
    } finally {
      setIsCompanySaving(false);
    }
  }

  function openDeleteCompanyModal(company: Company) {
    setCompanyContextMenu(null);
    setCategoryContextMenu(null);
    setSiteContextMenu(null);
    setCompanyToDelete(company);
    setSaveError("");
  }

  function closeDeleteCompanyModal(force = false) {
    if (isDeletingCompany && !force) return;
    setCompanyToDelete(null);
    setSaveError("");
  }

  async function deleteCompany() {
    if (!companyToDelete || isDeletingCompany) return;

    setIsDeletingCompany(true);
    setSaveError("");

    try {
      const deletedCompanyId = companyToDelete.id;
      const response = await fetch(`/api/companies/${deletedCompanyId}`, { method: "DELETE" });
      await readApiPayload(response);
      const nextCompanies = await loadDashboard(false);
      if (activeCompanyId === deletedCompanyId) {
        setActiveCompanyId(nextCompanies[0]?.id ?? "");
        setSelectedCategory("all");
        setSearchQuery("");
        setSortOption("custom");
      }
      closeDeleteCompanyModal(true);
    } catch (error) {
      setSaveError(error instanceof Error ? error.message : "حذف شرکت با خطا مواجه شد.");
    } finally {
      setIsDeletingCompany(false);
    }
  }

  function openAddCategoryModal() {
    if (!activeCompany) return;
    setCompanyContextMenu(null);
    setCategoryContextMenu(null);
    setSiteContextMenu(null);
    setEditingCategoryId(null);
    setCategoryForm(emptyCategoryForm);
    setSaveError("");
    setIsCategoryModalOpen(true);
  }

  function openEditCategoryModal(category: ServiceCategory) {
    setCompanyContextMenu(null);
    setCategoryContextMenu(null);
    setSiteContextMenu(null);
    setEditingCategoryId(category.id);
    setCategoryForm({ title: category.title });
    setSaveError("");
    setIsCategoryModalOpen(true);
  }

  function closeCategoryModal(force = false) {
    if (isCategorySaving && !force) return;
    setIsCategoryModalOpen(false);
    setEditingCategoryId(null);
    setCategoryForm(emptyCategoryForm);
    setSaveError("");
  }

  async function saveCategory(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!activeCompany || isCategorySaving) return;

    setIsCategorySaving(true);
    setSaveError("");

    try {
      const response = await fetch(editingCategoryId ? `/api/categories/${editingCategoryId}` : "/api/categories", {
        method: editingCategoryId ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: categoryForm.title.trim(), companyId: activeCompany.id }),
      });
      await readApiPayload(response);
      await loadDashboard(false);
      closeCategoryModal(true);
    } catch (error) {
      setSaveError(error instanceof Error ? error.message : "ذخیره دسته‌بندی با خطا مواجه شد.");
    } finally {
      setIsCategorySaving(false);
    }
  }

  function openDeleteCategoryModal(category: ServiceCategory) {
    setCompanyContextMenu(null);
    setCategoryContextMenu(null);
    setSiteContextMenu(null);
    setCategoryToDelete(category);
    setSaveError("");
  }

  function closeDeleteCategoryModal(force = false) {
    if (isDeletingCategory && !force) return;
    setCategoryToDelete(null);
    setSaveError("");
  }

  async function deleteCategory() {
    if (!categoryToDelete || isDeletingCategory) return;

    setIsDeletingCategory(true);
    setSaveError("");

    try {
      const deletedCategoryId = categoryToDelete.id;
      const response = await fetch(`/api/categories/${deletedCategoryId}`, { method: "DELETE" });
      await readApiPayload(response);
      await loadDashboard(false);
      if (selectedCategory === deletedCategoryId) setSelectedCategory("all");
      closeDeleteCategoryModal(true);
    } catch (error) {
      setSaveError(error instanceof Error ? error.message : "حذف دسته‌بندی با خطا مواجه شد.");
    } finally {
      setIsDeletingCategory(false);
    }
  }

  return {
    companies,
    availableCategoryTitles,
    activeCompanyId,
    isLoading,
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
    searchQuery,
    selectedCategory,
    sortOption,
    draggedServiceId,
    draggedCategoryId,
    dropTargetServiceId,
    draggedCategoryOrderId,
    dropTargetCategoryId,
    isReordering,
    isCategoryReordering,
    serviceForm,
    companyForm,
    categoryForm,
    isCategorySaving,
    loadError,
    saveError,
    reorderError,
    activeCompany,
    displayedCategories,
    serviceCount,
    searchResults,
    categoryOptions,
    visibleCategories,
    visibleServiceCount,
    selectedCategoryHasNoServices,
    hasActiveFilters,
    canReorder,
    canReorderCategories,
    serviceCategoryOptions,
    loadDashboard,
    selectCompany,
    handleCompanyContextMenu,
    handleCategoryContextMenu,
    handleCategoryKeyboardContextMenu,
    handleServiceContextMenu,
    handleSiteContextMenu,
    openServiceDetails,
    closeServiceDetails,
    openDeleteServiceModal,
    closeDeleteServiceModal,
    deleteService,
    clearDragState,
    clearCategoryDragState,
    handleCategoryDragStart,
    handleCategoryDragOver,
    handleCategoryDrop,
    handleServiceDragStart,
    handleServiceDragOver,
    handleServiceDrop,
    openAddServiceModal,
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
    setCompanies,
    setAvailableCategoryTitles,
    setActiveCompanyId,
    setIsLoading,
    setIsModalOpen,
    setIsCompanyModalOpen,
    setEditingCompanyId,
    setCompanyToDelete,
    setCompanyContextMenu,
    setIsCategoryModalOpen,
    setEditingCategoryId,
    setCategoryContextMenu,
    setServiceContextMenu,
    setSiteContextMenu,
    setCategoryToDelete,
    setIsSaving,
    setIsCompanySaving,
    setIsDeletingCompany,
    setIsDeletingCategory,
    setIsDeletingService,
    setEditingServiceId,
    setSelectedService,
    setServiceToDelete,
    setSearchQuery,
    setSelectedCategory,
    setSortOption,
    setDraggedServiceId,
    setDraggedCategoryId,
    setDropTargetServiceId,
    setDraggedCategoryOrderId,
    setDropTargetCategoryId,
    setIsReordering,
    setIsCategoryReordering,
    setServiceForm,
    setCompanyForm,
    setCategoryForm,
    setIsCategorySaving,
    setLoadError,
    setSaveError,
    setReorderError,
  };
}

export type DashboardContextValue = ReturnType<typeof useDashboardController>;

const DashboardContext = createContext<DashboardContextValue | null>(null);

export function DashboardProvider({ children }: { children: ReactNode }) {
  const value = useDashboardController();
  return <DashboardContext.Provider value={value}>{children}</DashboardContext.Provider>;
}

export function useDashboardContext() {
  const context = useContext(DashboardContext);
  if (!context) {
    throw new Error("useDashboardContext must be used inside DashboardProvider");
  }
  return context;
}
