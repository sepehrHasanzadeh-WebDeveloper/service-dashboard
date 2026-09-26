import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

function cleanTitle(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

export async function PATCH(request: Request, context: RouteContext<"/api/categories/[id]">) {
  try {
    const { id } = await context.params;
    const body = await request.json() as { title?: unknown };
    const title = cleanTitle(body.title);

    if (!title) return Response.json({ error: "نام دسته‌بندی الزامی است." }, { status: 400 });

    const existingCategory = await prisma.category.findUnique({ where: { id }, select: { id: true, companyId: true } });
    if (!existingCategory) return Response.json({ error: "دسته‌بندی پیدا نشد." }, { status: 404 });

    const duplicate = await prisma.category.findFirst({ where: { companyId: existingCategory.companyId, title, NOT: { id } }, select: { id: true } });
    if (duplicate) return Response.json({ error: "این دسته‌بندی قبلاً برای شرکت ثبت شده است." }, { status: 409 });

    const category = await prisma.category.update({ where: { id }, data: { title } });
    return Response.json({ success: true, category });
  } catch (error) {
    console.error("PATCH /api/categories/[id] failed", error);
    return Response.json({ error: "ویرایش دسته‌بندی با خطا مواجه شد." }, { status: 500 });
  }
}

export async function DELETE(_request: Request, context: RouteContext<"/api/categories/[id]">) {
  try {
    const { id } = await context.params;
    const category = await prisma.category.findUnique({
      where: { id },
      select: { id: true, title: true, _count: { select: { services: true } } },
    });

    if (!category) return Response.json({ error: "دسته‌بندی پیدا نشد." }, { status: 404 });

    await prisma.category.delete({ where: { id } });

    return Response.json({
      success: true,
      deletedCategory: { id: category.id, title: category.title, serviceCount: category._count.services },
    });
  } catch (error) {
    console.error("DELETE /api/categories/[id] failed", error);
    return Response.json({ error: "حذف دسته‌بندی با خطا مواجه شد." }, { status: 500 });
  }
}
