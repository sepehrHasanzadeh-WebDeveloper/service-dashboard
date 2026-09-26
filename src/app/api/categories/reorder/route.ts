import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

type ReorderPayload = {
  companyId?: unknown;
  categoryIds?: unknown;
};

export async function POST(request: Request) {
  try {
    const body = await request.json() as ReorderPayload;
    const companyId = typeof body.companyId === "string" ? body.companyId.trim() : "";
    const categoryIds = Array.isArray(body.categoryIds) && body.categoryIds.every((id) => typeof id === "string")
      ? [...new Set(body.categoryIds as string[])]
      : [];

    if (!companyId || categoryIds.length === 0) {
      return Response.json({ error: "اطلاعات ترتیب دسته‌بندی‌ها کامل نیست." }, { status: 400 });
    }

    const existingCategories = await prisma.category.findMany({
      where: { companyId, id: { in: categoryIds } },
      select: { id: true },
    });

    if (existingCategories.length !== categoryIds.length) {
      return Response.json({ error: "یکی از دسته‌بندی‌های انتخاب‌شده پیدا نشد." }, { status: 404 });
    }

    await prisma.$transaction(
      categoryIds.map((id, order) => prisma.category.update({ where: { id }, data: { order } })),
    );

    return Response.json({ success: true });
  } catch (error) {
    console.error("POST /api/categories/reorder failed", error);
    return Response.json({ error: "ذخیره ترتیب دسته‌بندی‌ها با خطا مواجه شد." }, { status: 500 });
  }
}
