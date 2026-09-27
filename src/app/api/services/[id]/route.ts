import { prisma } from "@/lib/prisma";
import { resolveFaviconUrl } from "@/lib/favicon";
import { normalizeServiceUrl } from "@/lib/service-url";

export const runtime = "nodejs";

type ServicePayload = {
  title?: unknown;
  name?: unknown;
  description?: unknown;
  link?: unknown;
  tone?: unknown;
  companyId?: unknown;
  categoryId?: unknown;
  categoryTitle?: unknown;
};

function stringValue(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

function validateUpdatePayload(body: ServicePayload) {
  const title = stringValue(body.title);
  const rawLink = stringValue(body.link);
  const link = normalizeServiceUrl(rawLink);

  if (!title) return { error: "عنوان سرویس الزامی است." };
  if (!rawLink) return { error: "آدرس سرویس الزامی است." };
  if (!link) return { error: "آدرس سرویس معتبر نیست. دامنه یا IP را همراه با پورت وارد کنید." };
  if (title.length > 120 || link.length > 2000) return { error: "طول عنوان یا لینک بیشتر از حد مجاز است." };

  return {
    data: {
      title,
      name: stringValue(body.name) || null,
      description: stringValue(body.description),
      link,
      tone: stringValue(body.tone) || "violet",
      categoryId: stringValue(body.categoryId) || null,
      categoryTitle: stringValue(body.categoryTitle) || null,
    },
  };
}

export async function PATCH(request: Request, context: RouteContext<"/api/services/[id]">) {
  try {
    const { id } = await context.params;
    const existingService = await prisma.service.findUnique({ where: { id } });
    if (!existingService) return Response.json({ error: "سرویس پیدا نشد." }, { status: 404 });

    const body = await request.json() as ServicePayload;
    const result = validateUpdatePayload(body);
    if ("error" in result) return Response.json(result, { status: 400 });

    let categoryId = existingService.categoryId;
    if (result.data.categoryId) {
      const category = await prisma.category.findFirst({ where: { id: result.data.categoryId, companyId: existingService.companyId } });
      if (!category) return Response.json({ error: "دسته‌بندی انتخاب‌شده پیدا نشد." }, { status: 404 });
      categoryId = category.id;
    } else if (result.data.categoryTitle) {
      const category = await prisma.category.upsert({
        where: { companyId_title: { companyId: existingService.companyId, title: result.data.categoryTitle } },
        update: {},
        create: { title: result.data.categoryTitle, companyId: existingService.companyId },
      });
      categoryId = category.id;
    }

    const icon = await resolveFaviconUrl(result.data.link);
    const service = await prisma.service.update({
      where: { id },
      data: {
        title: result.data.title,
        name: result.data.name,
        description: result.data.description,
        link: result.data.link,
        logo: null,
        logoName: null,
        icon,
        tone: result.data.tone,
        categoryId,
      },
      include: { category: true },
    });

    return Response.json({ service });
  } catch (error) {
    console.error("PATCH /api/services/[id] failed", error);
    return Response.json({ error: "ویرایش سرویس با خطا مواجه شد." }, { status: 500 });
  }
}

export async function DELETE(_request: Request, context: RouteContext<"/api/services/[id]">) {
  try {
    const { id } = await context.params;
    const existingService = await prisma.service.findUnique({ where: { id }, select: { id: true, title: true } });
    if (!existingService) return Response.json({ error: "سرویس پیدا نشد." }, { status: 404 });

    await prisma.service.delete({ where: { id } });

    return Response.json({ success: true, deletedService: existingService });
  } catch (error) {
    console.error("DELETE /api/services/[id] failed", error);
    return Response.json({ error: "حذف سرویس با خطا مواجه شد." }, { status: 500 });
  }
}
