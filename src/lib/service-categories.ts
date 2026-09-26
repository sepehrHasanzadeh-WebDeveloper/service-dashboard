import { prisma } from "@/lib/prisma";

export const DEFAULT_SERVICE_CATEGORIES = [
  "پایگاه‌های داده",
  "DevOps و توسعه",
  "زیرساخت و کلاود",
  "مانیتورینگ و لاگینگ",
  "امنیت و دسترسی",
  "شبکه و ارتباطات",
  "پشتیبانی و همکاری",
  "محصول و تحلیل",
  "ذخیره‌سازی و فایل",
  "پیام‌رسانی و اتوماسیون",
] as const;

export async function ensureDefaultServiceCategories(companyId: string) {
  await prisma.$transaction(
    DEFAULT_SERVICE_CATEGORIES.map((title, order) => prisma.category.upsert({
      where: { companyId_title: { companyId, title } },
      update: {},
      create: { companyId, title, order },
    })),
  );
}
