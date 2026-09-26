import { DEFAULT_SERVICE_CATEGORIES } from "@/lib/service-categories";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

function cleanTitle(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

export async function GET() {
  try {
    const categories = await prisma.category.findMany({
      distinct: ["title"],
      orderBy: [{ order: "asc" }, { createdAt: "asc" }],
      select: { title: true },
    });
    const titles = categories.length > 0 ? categories.map((category) => category.title) : [...DEFAULT_SERVICE_CATEGORIES];
    return Response.json({ categories: titles }, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    console.error("GET /api/categories failed", error);
    return Response.json({ error: "دریافت دسته‌بندی‌ها با خطا مواجه شد." }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json() as { companyId?: unknown; title?: unknown };
    const companyId = typeof body.companyId === "string" ? body.companyId.trim() : "";
    const title = cleanTitle(body.title);

    if (!companyId || !title) return Response.json({ error: "نام دسته‌بندی و شرکت الزامی است." }, { status: 400 });

    const company = await prisma.company.findUnique({ where: { id: companyId }, select: { id: true } });
    if (!company) return Response.json({ error: "شرکت پیدا نشد." }, { status: 404 });

    const duplicate = await prisma.category.findFirst({ where: { companyId, title }, select: { id: true } });
    if (duplicate) return Response.json({ error: "این دسته‌بندی قبلاً برای شرکت ثبت شده است." }, { status: 409 });

    const lastCategory = await prisma.category.findFirst({ where: { companyId }, orderBy: { order: "desc" }, select: { order: true } });
    const category = await prisma.category.create({ data: { companyId, title, order: (lastCategory?.order ?? -1) + 1 } });

    return Response.json({ success: true, category }, { status: 201 });
  } catch (error) {
    console.error("POST /api/categories failed", error);
    return Response.json({ error: "افزودن دسته‌بندی با خطا مواجه شد." }, { status: 500 });
  }
}
