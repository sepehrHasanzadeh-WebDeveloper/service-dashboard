import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

type ReorderPayload = {
  companyId?: unknown;
  categoryId?: unknown;
  serviceIds?: unknown;
};

function stringValue(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

export async function POST(request: Request) {
  try {
    const body = await request.json() as ReorderPayload;
    const companyId = stringValue(body.companyId);
    const categoryId = stringValue(body.categoryId);
    const serviceIds = Array.isArray(body.serviceIds) ? body.serviceIds.filter((id): id is string => typeof id === "string" && id.trim().length > 0).map((id) => id.trim()) : [];

    if (!companyId || !categoryId || serviceIds.length === 0) {
      return Response.json({ error: "اطلاعات ترتیب سرویس‌ها کامل نیست." }, { status: 400 });
    }

    if (new Set(serviceIds).size !== serviceIds.length) {
      return Response.json({ error: "ترتیب سرویس‌ها معتبر نیست." }, { status: 400 });
    }

    const category = await prisma.category.findFirst({ where: { id: categoryId, companyId }, select: { id: true } });
    if (!category) return Response.json({ error: "دسته‌بندی انتخاب‌شده پیدا نشد." }, { status: 404 });

    const existingServices = await prisma.service.findMany({
      where: { companyId, categoryId },
      select: { id: true },
    });
    const existingIds = new Set(existingServices.map((service) => service.id));
    if (existingServices.length !== serviceIds.length || serviceIds.some((id) => !existingIds.has(id))) {
      return Response.json({ error: "فهرست سرویس‌ها با اطلاعات فعلی داشبورد هماهنگ نیست." }, { status: 409 });
    }

    await prisma.$transaction(
      serviceIds.map((id, index) => prisma.service.update({ where: { id }, data: { order: index } })),
    );

    return Response.json({ success: true, serviceIds });
  } catch (error) {
    console.error("POST /api/services/reorder failed", error);
    return Response.json({ error: "ذخیره ترتیب سرویس‌ها با خطا مواجه شد." }, { status: 500 });
  }
}
