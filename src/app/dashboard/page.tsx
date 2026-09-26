"use client";

/* Dynamic favicon URLs are user-provided and cannot be configured as static next/image remote patterns. */
/* eslint-disable @next/next/no-img-element */

import { useCallback, useEffect, useState, type DragEvent, type FormEvent, type MouseEvent } from "react";
import {
  Activity,
  ArrowUpLeft,
  BarChart3,
  BookOpen,
  Cloud,
  Code2,
  Container,
  Database,
  GitBranch,
  GripVertical,
  Heart,
  KeyRound,
  LayoutGrid,
  LoaderCircle,
  MessageSquare,
  MonitorCog,
  Pencil,
  Plus,
  Search,
  Server,
  Settings2,
  ShieldCheck,
  Sparkles,
  Trash2,
  Users,
} from "lucide-react";

type IconComponent = typeof Activity;

type Service = {
  id: string;
  name?: string | null;
  title: string;
  description: string;
  link: string;
  icon: IconComponent;
  iconUrl?: string | null;
  tone: string;
  isFavorite: boolean;
  order: number;
  logo?: string | null;
  logoName?: string | null;
  categoryId: string;
  categoryTitle: string;
  createdAt: string;
};

type ServiceCategory = {
  id: string;
  title: string;
  icon: IconComponent;
  services: Service[];
};

type Company = {
  id: string;
  name: string;
  subtitle?: string | null;
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
  isFavorite: boolean;
  order: number;
  logo?: string | null;
  logoName?: string | null;
  createdAt: string;
};

type ApiCompany = {
  id: string;
  name: string;
  subtitle?: string | null;
  categories: Array<{
    id: string;
    title: string;
    services: ApiService[];
  }>;
};

type ApiCategories = {
  categories?: string[];
};

type ServiceForm = {
  title: string;
  description: string;
  link: string;
  categoryId: string;
};

type CompanyForm = {
  name: string;
  subtitle: string;
};

type CategoryForm = {
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

type ThemeName = "dark" | "light" | "orange" | "slate" | "forest" | "graphite" | "sand";
type SortOption = "name" | "latest" | "custom" | "favorites";

const themeOptions: Array<{ id: ThemeName; label: string; background: string; accent: string }> = [
  { id: "dark", label: "سرمه‌ای سازمانی", background: "#102238", accent: "#6e91b6" },
  { id: "light", label: "روشن اداری", background: "#f2f5f8", accent: "#315f88" },
  { id: "orange", label: "خاکستری و آبی", background: "#eef2f5", accent: "#4e718f" },
  { id: "slate", label: "ذغالی رسمی", background: "#1b2733", accent: "#7a9bb8" },
  { id: "forest", label: "سبز جنگلی سازمانی", background: "#102c27", accent: "#5eaa91" },
  { id: "graphite", label: "گرافیتی خنثی", background: "#20262d", accent: "#9aabba" },
  { id: "sand", label: "شن روشن اداری", background: "#f1eee8", accent: "#82735f" },
];

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
const emptyCompanyForm: CompanyForm = { name: "", subtitle: "" };
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

function ServiceIconVisual({ service, className = "", size = 16 }: { service: Service; className?: string; size?: number }) {
  const imageUrl = service.iconUrl ?? service.logo;
  const [failedImageUrl, setFailedImageUrl] = useState<string | null>(null);
  const FallbackIcon = service.icon;
  const showImage = Boolean(imageUrl) && imageUrl !== failedImageUrl;

  return (
    <span className={`compact-service-icon compact-service-icon-${service.tone} ${showImage ? "compact-service-logo" : ""} ${className}`.trim()}>
      {showImage ? <img className="service-icon-image" src={imageUrl ?? ""} alt="" onError={() => setFailedImageUrl(imageUrl ?? null)} /> : <FallbackIcon size={size} />}
    </span>
  );
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

export default function DashboardPage() {
  const [theme, setTheme] = useState<ThemeName>("dark");
  const [themeMenuOpen, setThemeMenuOpen] = useState(false);
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
  const [categoryToDelete, setCategoryToDelete] = useState<ServiceCategory | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isCompanySaving, setIsCompanySaving] = useState(false);
  const [isDeletingCompany, setIsDeletingCompany] = useState(false);
  const [isDeletingCategory, setIsDeletingCategory] = useState(false);
  const [isDeletingService, setIsDeletingService] = useState(false);
  const [isTogglingFavorite, setIsTogglingFavorite] = useState(false);
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
    .map((category) => ({ ...category, services: sortServices(category.services.filter((service) => (sortOption !== "favorites" || service.isFavorite) && (!normalizedQuery || [service.name ?? "", service.title, service.description, category.title].some((value) => value.toLocaleLowerCase("fa-IR").includes(normalizedQuery)))), sortOption === "favorites" ? "custom" : sortOption) }))
    .filter((category) => category.services.length > 0);
  const visibleServiceCount = visibleCategories.reduce((count, category) => count + category.services.length, 0);
  const hasActiveFilters = Boolean(normalizedQuery) || selectedCategory !== "all";
  const canReorder = sortOption === "custom" && !hasActiveFilters && !isReordering;
  const canReorderCategories = canReorder && !isCategoryReordering;
  const serviceCategoryOptions = activeCompany?.categories.length
    ? activeCompany.categories
    : availableCategoryTitles.map((title) => ({ id: `category-title:${title}`, title }));

  function selectCompany(companyId: string) {
    setCompanyContextMenu(null);
    setCategoryContextMenu(null);
    setActiveCompanyId(companyId);
    setSelectedCategory("all");
    setSearchQuery("");
    setSortOption("custom");
    setReorderError("");
    setSelectedService(null);
  }

  function handleCompanyContextMenu(event: MouseEvent<HTMLButtonElement>, company: Company) {
    event.preventDefault();
    setCategoryContextMenu(null);
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
    setCompanyContextMenu(null);
    const menuWidth = 190;
    const menuHeight = 126;
    setCategoryContextMenu({
      category,
      x: Math.max(8, Math.min(event.clientX, window.innerWidth - menuWidth - 8)),
      y: Math.max(8, Math.min(event.clientY, window.innerHeight - menuHeight - 8)),
    });
  }

  function openServiceDetails(service: Service) {
    setSelectedService(service);
    setSaveError("");
  }

  function closeServiceDetails() {
    setSelectedService(null);
    setServiceToDelete(null);
  }

  function openDeleteServiceModal() {
    if (!selectedService) return;
    setServiceToDelete(selectedService);
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

  async function toggleFavorite() {
    if (!selectedService || isTogglingFavorite) return;

    setIsTogglingFavorite(true);
    setSaveError("");

    try {
      const response = await fetch(`/api/services/${selectedService.id}/favorite`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isFavorite: !selectedService.isFavorite }),
      });
      await readApiPayload(response);
      const nextCompanies = await loadDashboard(false);
      const updatedService = nextCompanies
        .flatMap((company) => company.categories.flatMap((category) => category.services))
        .find((service) => service.id === selectedService.id);
      if (updatedService) setSelectedService(updatedService);
    } catch (error) {
      setSaveError(error instanceof Error ? error.message : "ذخیره وضعیت علاقه‌مندی با خطا مواجه شد.");
    } finally {
      setIsTogglingFavorite(false);
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
    setEditingServiceId(null);
    setServiceForm({ ...emptyServiceForm, categoryId: serviceCategoryOptions[0]?.id ?? "" });
    setSaveError("");
    setIsModalOpen(true);
  }

  function openEditServiceModal(service: Service) {
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
    setEditingCompanyId(null);
    setCompanyForm(emptyCompanyForm);
    setSaveError("");
    setIsCompanyModalOpen(true);
  }

  function openEditCompanyModal(company: Company) {
    setCompanyContextMenu(null);
    setCategoryContextMenu(null);
    setEditingCompanyId(company.id);
    setCompanyForm({ name: company.name, subtitle: company.subtitle ?? "" });
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
    setEditingCategoryId(null);
    setCategoryForm(emptyCategoryForm);
    setSaveError("");
    setIsCategoryModalOpen(true);
  }

  function openEditCategoryModal(category: ServiceCategory) {
    setCompanyContextMenu(null);
    setCategoryContextMenu(null);
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

  const selectedTheme = themeOptions.find((option) => option.id === theme) ?? themeOptions[0];

  return (
    <main className={`dashboard-shell theme-${theme} min-h-screen`} dir="rtl">
      <div className="dashboard-container">
        <header className="dashboard-header">
          <div className="brand-lockup"><div className="brand-symbol" aria-hidden="true"><Sparkles size={19} strokeWidth={2} /></div><div><div className="brand-name">مرکز دسترسی شرکت</div><div className="brand-subtitle">داشبورد چندسازمانی سرویس‌ها</div></div></div>

          <div className="header-actions">
            <button className="theme-toggle" type="button" aria-label="انتخاب تم داشبورد" title="انتخاب تم" aria-expanded={themeMenuOpen} onClick={() => setThemeMenuOpen((open) => !open)}><span className="theme-swatch" aria-hidden="true" style={{ background: `linear-gradient(135deg, ${selectedTheme.background} 0 50%, ${selectedTheme.accent} 50% 100%)` }}><span /></span><Settings2 size={18} /></button>
            {themeMenuOpen && <div className="theme-menu" role="menu" aria-label="تم‌های داشبورد"><span className="theme-menu-title">انتخاب تم</span>{themeOptions.map((option) => <button className={`theme-option ${theme === option.id ? "theme-option-active" : ""}`} key={option.id} type="button" role="menuitem" onClick={() => { setTheme(option.id); setThemeMenuOpen(false); }}><span className="theme-option-dot" style={{ background: `linear-gradient(135deg, ${option.background} 0 50%, ${option.accent} 50% 100%)` }} /><span>{option.label}</span></button>)}</div>}
          </div>
        </header>

        <nav className="company-switcher" aria-label="انتخاب شرکت"><span className="company-switcher-label">شرکت‌ها</span><div className="company-tabs">{companies.map((company) => <div className={`company-tab-wrapper ${activeCompany?.id === company.id ? "company-tab-wrapper-active" : ""}`} key={company.id}><button className={`company-tab ${activeCompany?.id === company.id ? "company-tab-active" : ""}`} type="button" aria-haspopup="menu" onClick={() => selectCompany(company.id)} onContextMenu={(event) => handleCompanyContextMenu(event, company)}><span className="company-tab-mark">{company.name.slice(0, 1)}</span><span><strong>{company.name}</strong><small>{company.subtitle || "شرکت سازمانی"}</small></span></button></div>)}<button className="company-tab company-tab-add" type="button" onClick={openAddCompanyModal}><Plus size={16} /><span><strong>افزودن شرکت</strong><small>ساخت فضای جدید</small></span></button><button className="company-tab company-tab-add category-tab-add" type="button" disabled={!activeCompany} onClick={openAddCategoryModal}><Plus size={16} /><span><strong>افزودن دسته‌بندی</strong><small>برای شرکت فعال</small></span></button></div></nav>

        {companyContextMenu && <div className="company-context-menu-layer" role="presentation" onClick={() => setCompanyContextMenu(null)} onKeyDown={(event) => { if (event.key === "Escape") setCompanyContextMenu(null); }}><div className="company-context-menu" role="menu" aria-label={`عملیات شرکت ${companyContextMenu.company.name}`} style={{ left: companyContextMenu.x, top: companyContextMenu.y }} onClick={(event) => event.stopPropagation()}><span className="company-context-menu-title">{companyContextMenu.company.name}</span><button type="button" role="menuitem" onClick={() => openEditCompanyModal(companyContextMenu.company)}><Pencil size={15} /> ویرایش شرکت</button><button className="company-context-menu-danger" type="button" role="menuitem" onClick={() => openDeleteCompanyModal(companyContextMenu.company)}><Trash2 size={15} /> حذف شرکت</button></div></div>}

        {categoryContextMenu && <div className="company-context-menu-layer" role="presentation" onClick={() => setCategoryContextMenu(null)} onKeyDown={(event) => { if (event.key === "Escape") setCategoryContextMenu(null); }}><div className="company-context-menu" role="menu" aria-label={`عملیات دسته‌بندی ${categoryContextMenu.category.title}`} style={{ left: categoryContextMenu.x, top: categoryContextMenu.y }} onClick={(event) => event.stopPropagation()}><span className="company-context-menu-title">{categoryContextMenu.category.title}</span><button type="button" role="menuitem" onClick={() => openEditCategoryModal(categoryContextMenu.category)}><Pencil size={15} /> ویرایش دسته‌بندی</button><button className="company-context-menu-danger" type="button" role="menuitem" onClick={() => openDeleteCategoryModal(categoryContextMenu.category)}><Trash2 size={15} /> حذف دسته‌بندی</button></div></div>}

        {loadError && <div className="dashboard-alert dashboard-alert-error" role="alert"><span>{loadError}</span><button type="button" onClick={() => void loadDashboard()}>تلاش دوباره</button></div>}
        {reorderError && <div className="dashboard-alert dashboard-alert-error" role="alert"><span>{reorderError}</span><button type="button" onClick={() => setReorderError("")}>بستن</button></div>}

        {isLoading ? <section className="dashboard-loading" aria-live="polite" aria-busy="true"><LoaderCircle className="loading-spinner" size={28} /><strong>در حال دریافت سرویس‌ها...</strong><span>اطلاعات داشبورد از پایگاه داده خوانده می‌شود.</span></section> : !activeCompany ? <section className="dashboard-empty glass-card"><span className="empty-icon"><LayoutGrid size={25} /></span><h2>هنوز شرکتی ثبت نشده است</h2><p>برای شروع، اولین شرکت را بسازید و سرویس‌های آن را اضافه کنید.</p><button className="modal-submit" type="button" onClick={openAddCompanyModal}><Plus size={16} /> افزودن اولین شرکت</button></section> : <section className="content-section services-section" aria-labelledby="services-title">
          <section className="service-filters glass-card" aria-label="جست‌وجو و فیلتر سرویس‌ها">
            <div className="filter-toolbar">
              <div className="filter-search-wrap">
                <label className="filter-search" aria-label="جست‌وجو بین سرویس‌ها"><Search size={17} /><input value={searchQuery} onChange={(event) => setSearchQuery(event.target.value)} placeholder="جست‌وجو بر اساس نام، عنوان، توضیحات یا دسته‌بندی" type="search" /></label>
                {searchQuery.trim() && <div className="search-results filter-search-results" role="listbox" aria-label="نتایج جست‌وجو"><div className="search-results-heading">نتایج جست‌وجو <span>{searchResults.length}</span></div>{searchResults.length > 0 ? searchResults.slice(0, 8).map((service) => <button className="search-result" type="button" key={service.id} onClick={() => { setSelectedCategory(service.categoryId); setSearchQuery(""); }}><ServiceIconVisual service={service} className="search-result-icon" size={15} /><span className="search-result-copy"><strong>{service.title}</strong><small>{service.categoryTitle} · {service.description || "بدون توضیحات"}</small></span><ArrowUpLeft size={14} /></button>) : <p className="search-empty">سرویسی با این عبارت پیدا نشد.</p>}</div>}
              </div>
              <label className="sort-control"><span>مرتب‌سازی</span><select value={sortOption} onChange={(event) => setSortOption(event.target.value as SortOption)}><option value="custom">ترتیب سفارشی</option><option value="name">نام A-Z</option><option value="latest">جدیدترین</option><option value="favorites">سرویس‌های مورد علاقه</option></select></label>
            </div>
            <div className="category-filter"><span className="category-filter-label">دسته‌بندی</span><div className="category-chips" role="list">{categoryOptions.map((category) => <button className={`category-chip ${selectedCategory === category.id ? "category-chip-active" : ""}`} key={category.id} type="button" onClick={() => { setSelectedCategory(category.id); setSearchQuery(""); }} onContextMenu={(event) => { const sourceCategory = displayedCategories.find((item) => item.id === category.id); if (sourceCategory) handleCategoryContextMenu(event, sourceCategory); }}><span>{category.title}</span><b>{category.count}</b></button>)}</div></div>
            <p className="reorder-hint" aria-live="polite">{canReorder ? "برای تغییر ترتیب، کارت‌ها را داخل هر دسته جابه‌جا کنید." : "برای مرتب‌سازی دستی، جست‌وجو و فیلتر دسته‌بندی را پاک کنید و «ترتیب سفارشی» را انتخاب کنید."}</p>
          </section>
          <div className="section-heading"><div><h2 id="services-title">سرویس‌های {activeCompany.name}</h2><span>{visibleServiceCount === serviceCount ? `${serviceCount} سرویس فعال` : `${visibleServiceCount} از ${serviceCount} سرویس نمایش داده می‌شود`} · {activeCompany.subtitle || "فضای مدیریت سرویس‌های شرکت"}</span></div><button className="section-action" type="button" onClick={openAddServiceModal}>افزودن سرویس <Plus size={15} /></button></div>
          {serviceCount === 0 ? (
            <div className="dashboard-empty dashboard-empty-small glass-card">
              <span className="empty-icon"><LayoutGrid size={22} /></span>
              <h2>هنوز سرویسی ثبت نشده است</h2>
              <p>اولین سرویس را ثبت کنید و دسته‌بندی مناسب آن را انتخاب کنید.</p>
              <button className="modal-submit" type="button" onClick={openAddServiceModal}><Plus size={16} /> افزودن سرویس</button>
            </div>
          ) : visibleCategories.length === 0 ? (
            <div className="dashboard-empty dashboard-empty-small glass-card">
              <span className="empty-icon"><Search size={22} /></span>
              <h2>نتیجه‌ای پیدا نشد</h2>
              <p>عبارت جست‌وجو یا دسته‌بندی دیگری را امتحان کنید.</p>
              <button className="modal-submit filter-clear" type="button" onClick={() => { setSearchQuery(""); setSelectedCategory("all"); setSortOption("custom"); }}>پاک‌کردن فیلترها</button>
            </div>
          ) : (
            <div className="service-rows">
              {visibleCategories.map((category) => {
                const CategoryIcon = category.icon;
                const visibleServices = category.services;

                return (
                  <section className="service-row glass-card" key={category.id}>
                    <div className={`service-row-label ${draggedCategoryOrderId === category.id ? "service-row-category-dragging" : ""} ${dropTargetCategoryId === category.id ? "service-row-category-drop-target" : ""}`} role="button" tabIndex={0} aria-haspopup="menu" onContextMenu={(event) => handleCategoryContextMenu(event, category)} onDragOver={(event) => handleCategoryDragOver(event, category.id)} onDrop={(event) => void handleCategoryDrop(event, category.id)}>
                      <span className="category-icon"><CategoryIcon size={17} /></span>
                      <div><h3>{category.title}</h3><span>{category.services.length} سرویس</span></div>
                      <div className="category-label-actions"><button className="category-drag-handle" type="button" draggable={canReorderCategories} aria-label={`جابجایی دسته‌بندی ${category.title}`} title="برای تغییر ترتیب بکشید" onDragStart={(event) => handleCategoryDragStart(event, category.id)} onDragEnd={clearCategoryDragState}><GripVertical size={17} /></button></div>
                    </div>
                    <div className="service-row-list">
                      {visibleServices.map((service) => {
                        return (
                          <div className={`row-service-card ${draggedServiceId === service.id ? "row-service-card-dragging" : ""} ${dropTargetServiceId === service.id ? "row-service-card-drop-target" : ""}`} key={service.id} draggable={canReorder} role="button" tabIndex={0} aria-label={`نمایش اطلاعات ${service.title}`} onClick={() => openServiceDetails(service)} onKeyDown={(event) => { if (event.key === "Enter" || event.key === " ") { event.preventDefault(); openServiceDetails(service); } }} onDragStart={(event) => handleServiceDragStart(event, service, category.id)} onDragOver={(event) => handleServiceDragOver(event, service.id, category.id)} onDrop={(event) => void handleServiceDrop(event, service.id, category.id)} onDragEnd={clearDragState}>
                            <div className="row-service-main">
                              <ServiceIconVisual service={service} />
                              <span className="row-service-copy"><span className="row-service-name">{service.title}</span></span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </section>
                );
              })}
              <button className="add-service glass-card" type="button" onClick={openAddServiceModal}><span className="add-service-icon"><Plus size={18} /></span><span><strong>افزودن سرویس</strong><small>لینک جدید به این شرکت اضافه کن</small></span><ArrowUpLeft size={15} /></button>
            </div>
          )}
        </section>}

        <footer className="dashboard-footer"><span><span className="status-dot" />{activeCompany ? `همه‌ی سرویس‌های ${activeCompany.name} در دسترس هستند` : "داشبورد آماده‌ی ثبت اطلاعات است"}</span><span>داشبورد داخلی شرکت · نسخه ۱.۰</span></footer>
      </div>

      {isModalOpen && activeCompany && <div className="modal-layer" role="presentation" onClick={(event) => { if (event.target === event.currentTarget) closeServiceModal(); }}><form className="service-modal glass-card" onSubmit={saveService}>
        <div className="modal-header"><div><span className="modal-eyebrow">{activeCompany.name} · {editingServiceId ? "ویرایش سرویس" : "سرویس جدید"}</span><h2>{editingServiceId ? "ویرایش سرویس" : "افزودن سرویس"}</h2><p>{editingServiceId ? "اطلاعات سرویس را به‌روزرسانی کنید." : "سرویس را به شرکت و دسته‌بندی مورد نظر اضافه کنید."}</p></div><button className="modal-close" type="button" aria-label="بستن" onClick={closeServiceModal}>×</button></div>
        {saveError && <div className="form-error" role="alert">{saveError}</div>}
        <div className="form-fields"><label className="form-field"><span>عنوان سرویس <b>*</b></span><input autoFocus required value={serviceForm.title} onChange={(event) => setServiceForm({ ...serviceForm, title: event.target.value })} placeholder="مثلاً: مدیریت مالی" /></label><label className="form-field"><span>دسته‌بندی <b>*</b></span><select required value={serviceForm.categoryId} onChange={(event) => setServiceForm({ ...serviceForm, categoryId: event.target.value })}><option value="" disabled>انتخاب دسته‌بندی</option>{serviceCategoryOptions.map((category) => <option key={category.id} value={category.id}>{category.title}</option>)}</select></label><label className="form-field"><span>توضیحات</span><textarea rows={3} value={serviceForm.description} onChange={(event) => setServiceForm({ ...serviceForm, description: event.target.value })} placeholder="توضیح کوتاه درباره‌ی این سرویس" /></label><label className="form-field"><span>لینک سرویس <b>*</b></span><input required type="url" value={serviceForm.link} onChange={(event) => setServiceForm({ ...serviceForm, link: event.target.value })} placeholder="https://service.company.ir" dir="ltr" /></label><div className="favicon-info"><span className="favicon-info-mark"><Sparkles size={16} /></span><div><strong>آیکون خودکار سرویس</strong><small>بعد از ذخیره، favicon سایت از لینک سرویس پیدا و برای کارت ذخیره می‌شود. اگر favicon در دسترس نباشد، آیکون جایگزین نمایش داده می‌شود.</small></div></div><small className="form-note">نام کاربری و رمز عبور فعلاً به‌دلیل ملاحظات امنیتی اضافه نشده‌اند.</small></div>
        <div className="modal-actions"><button className="modal-cancel" type="button" onClick={closeServiceModal}>انصراف</button><button className="modal-submit" type="submit" disabled={isSaving}>{isSaving ? <><LoaderCircle className="loading-spinner" size={15} /> در حال ذخیره...</> : <>{editingServiceId ? <Pencil size={15} /> : <Plus size={16} />} {editingServiceId ? "ذخیره تغییرات" : "افزودن سرویس"}</>}</button></div>
      </form></div>}

      {isCategoryModalOpen && activeCompany && <div className="modal-layer" role="presentation" onClick={(event) => { if (event.target === event.currentTarget) closeCategoryModal(); }}><form className="service-modal glass-card category-modal" onSubmit={saveCategory}>
        <div className="modal-header"><div><span className="modal-eyebrow">{activeCompany.name} · دسته‌بندی‌ها</span><h2>{editingCategoryId ? "ویرایش دسته‌بندی" : "افزودن دسته‌بندی"}</h2><p>{editingCategoryId ? "نام دسته‌بندی را به‌روزرسانی کنید." : "یک دسته‌بندی جدید برای مرتب‌سازی سرویس‌ها بسازید."}</p></div><button className="modal-close" type="button" aria-label="بستن" onClick={() => closeCategoryModal()}>×</button></div>
        {saveError && <div className="form-error" role="alert">{saveError}</div>}
        <div className="form-fields"><label className="form-field"><span>نام دسته‌بندی <b>*</b></span><input autoFocus required value={categoryForm.title} onChange={(event) => setCategoryForm({ title: event.target.value })} placeholder="مثلاً: ابزارهای داخلی" /></label></div>
        <div className="modal-actions"><button className="modal-cancel" type="button" onClick={() => closeCategoryModal()}>انصراف</button><button className="modal-submit" type="submit" disabled={isCategorySaving}>{isCategorySaving ? <><LoaderCircle className="loading-spinner" size={15} /> در حال ذخیره...</> : <>{editingCategoryId ? <Pencil size={15} /> : <Plus size={16} />} {editingCategoryId ? "ذخیره تغییرات" : "افزودن دسته‌بندی"}</>}</button></div>
      </form></div>}

      {selectedService && <div className="modal-layer" role="presentation" onClick={(event) => { if (event.target === event.currentTarget) closeServiceDetails(); }}><section className="service-details-modal glass-card" role="dialog" aria-modal="true" aria-labelledby="service-details-title">
        <div className="service-details-header"><div className="service-details-identity"><ServiceIconVisual service={selectedService} className="service-details-icon" size={22} /><div><span className="modal-eyebrow">اطلاعات سرویس</span><h2 id="service-details-title">{selectedService.title}</h2>{selectedService.name && selectedService.name !== selectedService.title && <p>{selectedService.name}</p>}</div></div><button className="modal-close" type="button" aria-label="بستن اطلاعات سرویس" onClick={closeServiceDetails}>×</button></div>
        {saveError && <div className="form-error" role="alert">{saveError}</div>}
        <div className="service-details-content"><div className="service-detail-item"><span>دسته‌بندی</span><strong>{selectedService.categoryTitle}</strong></div><div className="service-detail-item service-detail-description"><span>توضیحات</span><strong>{selectedService.description || "توضیحی برای این سرویس ثبت نشده است."}</strong></div><div className="service-detail-item"><span>لینک سرویس</span><a href={selectedService.link} target="_blank" rel="noreferrer" dir="ltr">{selectedService.link}</a></div></div>
        <div className="service-details-actions"><button className={`service-favorite-button ${selectedService.isFavorite ? "service-favorite-button-active" : ""}`} type="button" aria-pressed={selectedService.isFavorite} aria-label={selectedService.isFavorite ? "حذف از سرویس‌های مورد علاقه" : "افزودن به سرویس‌های مورد علاقه"} title={selectedService.isFavorite ? "حذف از علاقه‌مندی‌ها" : "افزودن به علاقه‌مندی‌ها"} disabled={isTogglingFavorite} onClick={() => void toggleFavorite()}><Heart size={16} fill={selectedService.isFavorite ? "currentColor" : "none"} /> {selectedService.isFavorite ? "مورد علاقه" : "افزودن به علاقه‌مندی‌ها"}</button><button className="modal-submit service-details-edit" type="button" onClick={() => openEditServiceModal(selectedService)}><Pencil size={15} /> ویرایش سرویس</button><button className="modal-danger service-details-delete" type="button" onClick={openDeleteServiceModal}><Trash2 size={15} /> حذف سرویس</button><button className="modal-cancel" type="button" onClick={closeServiceDetails}>بستن</button><a className="modal-submit service-details-open" href={selectedService.link} target="_blank" rel="noreferrer">باز کردن سرویس <ArrowUpLeft size={15} /></a></div>
      </section></div>}

      {serviceToDelete && <div className="modal-layer service-delete-confirm-layer" role="presentation" onClick={(event) => { if (event.target === event.currentTarget) closeDeleteServiceModal(); }}><section className="confirm-modal service-modal glass-card" role="alertdialog" aria-modal="true" aria-labelledby="delete-service-title"><div className="confirm-icon"><Trash2 size={21} /></div><div className="modal-header"><div><span className="modal-eyebrow confirm-eyebrow">حذف سرویس</span><h2 id="delete-service-title">حذف «{serviceToDelete.title}»؟</h2><p>این سرویس برای همیشه از دسته‌بندی و داشبورد حذف خواهد شد. این عملیات قابل بازگشت نیست.</p></div><button className="modal-close" type="button" aria-label="بستن تأیید حذف سرویس" onClick={() => closeDeleteServiceModal()}>×</button></div>{saveError && <div className="form-error" role="alert">{saveError}</div>}<div className="modal-actions"><button className="modal-cancel" type="button" onClick={() => closeDeleteServiceModal()}>انصراف</button><button className="modal-danger" type="button" disabled={isDeletingService} onClick={() => void deleteService()}>{isDeletingService ? <><LoaderCircle className="loading-spinner" size={15} /> در حال حذف...</> : <><Trash2 size={15} /> حذف سرویس</>}</button></div></section></div>}

      {categoryToDelete && <div className="modal-layer" role="presentation" onClick={(event) => { if (event.target === event.currentTarget) closeDeleteCategoryModal(); }}><section className="confirm-modal service-modal glass-card" role="alertdialog" aria-modal="true" aria-labelledby="delete-category-title"><div className="confirm-icon"><Trash2 size={21} /></div><div className="modal-header"><div><span className="modal-eyebrow confirm-eyebrow">حذف دسته‌بندی</span><h2 id="delete-category-title">حذف «{categoryToDelete.title}»؟</h2><p>تمام {categoryToDelete.services.length} سرویس این دسته‌بندی هم حذف خواهند شد. این عملیات قابل بازگشت نیست.</p></div><button className="modal-close" type="button" aria-label="بستن تأیید حذف دسته‌بندی" onClick={() => closeDeleteCategoryModal()}>×</button></div>{saveError && <div className="form-error" role="alert">{saveError}</div>}<div className="modal-actions"><button className="modal-cancel" type="button" onClick={() => closeDeleteCategoryModal()}>انصراف</button><button className="modal-danger" type="button" disabled={isDeletingCategory} onClick={() => void deleteCategory()}>{isDeletingCategory ? <><LoaderCircle className="loading-spinner" size={15} /> در حال حذف...</> : <><Trash2 size={15} /> حذف دسته‌بندی</>}</button></div></section></div>}

      {isCompanyModalOpen && <div className="modal-layer" role="presentation" onClick={(event) => { if (event.target === event.currentTarget) closeCompanyModal(); }}><form className="service-modal glass-card" onSubmit={saveCompany}><div className="modal-header"><div><span className="modal-eyebrow">داشبورد چندسازمانی</span><h2>{editingCompanyId ? "ویرایش شرکت" : "افزودن شرکت"}</h2><p>{editingCompanyId ? "نام و اطلاعات شرکت را به‌روزرسانی کنید." : "یک فضای مستقل برای سرویس‌های شرکت بسازید."}</p></div><button className="modal-close" type="button" aria-label="بستن" onClick={() => closeCompanyModal()}>×</button></div>{saveError && <div className="form-error" role="alert">{saveError}</div>}<div className="form-fields"><label className="form-field"><span>نام شرکت <b>*</b></span><input autoFocus required value={companyForm.name} onChange={(event) => setCompanyForm({ ...companyForm, name: event.target.value })} placeholder="مثلاً: شرکت آهن آنلاین" /></label><label className="form-field"><span>توضیح کوتاه</span><input value={companyForm.subtitle} onChange={(event) => setCompanyForm({ ...companyForm, subtitle: event.target.value })} placeholder="مثلاً: فناوری اطلاعات و عملیات" /></label></div><div className="modal-actions"><button className="modal-cancel" type="button" onClick={() => closeCompanyModal()}>انصراف</button><button className="modal-submit" type="submit" disabled={isCompanySaving}>{isCompanySaving ? <><LoaderCircle className="loading-spinner" size={15} /> در حال ذخیره...</> : <>{editingCompanyId ? <Pencil size={15} /> : <Plus size={16} />} {editingCompanyId ? "ذخیره تغییرات" : "افزودن شرکت"}</>}</button></div></form></div>}

      {companyToDelete && <div className="modal-layer" role="presentation" onClick={(event) => { if (event.target === event.currentTarget) closeDeleteCompanyModal(); }}><section className="confirm-modal service-modal glass-card" role="alertdialog" aria-modal="true" aria-labelledby="delete-company-title"><div className="confirm-icon"><Trash2 size={21} /></div><div className="modal-header"><div><span className="modal-eyebrow confirm-eyebrow">حذف شرکت</span><h2 id="delete-company-title">حذف {companyToDelete.name}؟</h2><p>تمام دسته‌بندی‌ها و سرویس‌های این شرکت نیز حذف خواهند شد. این عملیات قابل بازگشت نیست.</p></div><button className="modal-close" type="button" aria-label="بستن تأیید حذف" onClick={() => closeDeleteCompanyModal()}>×</button></div>{saveError && <div className="form-error" role="alert">{saveError}</div>}<div className="modal-actions"><button className="modal-cancel" type="button" onClick={() => closeDeleteCompanyModal()}>انصراف</button><button className="modal-danger" type="button" disabled={isDeletingCompany} onClick={() => void deleteCompany()}>{isDeletingCompany ? <><LoaderCircle className="loading-spinner" size={15} /> در حال حذف...</> : <><Trash2 size={15} /> حذف شرکت</>}</button></div></section></div>}
    </main>
  );
}
