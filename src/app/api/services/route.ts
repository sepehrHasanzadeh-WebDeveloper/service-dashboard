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

function validateServicePayload(body: ServicePayload) {
  const title = stringValue(body.title);
  const rawLink = stringValue(body.link);
  const link = normalizeServiceUrl(rawLink);
  const companyId = stringValue(body.companyId);
  const categoryId = stringValue(body.categoryId);
  const categoryTitle = stringValue(body.categoryTitle);

  if (!title) return { error: "عنوان سرویس الزامی است." };
  if (!rawLink) return { error: "آدرس سرویس الزامی است." };
  if (!link) return { error: "آدرس سرویس معتبر نیست. دامنه یا IP را همراه با پورت وارد کنید." };
  if (!companyId) return { error: "شرکت سرویس مشخص نشده است." };
  if (!categoryId && !categoryTitle) return { error: "دسته‌بندی سرویس الزامی است." };
  if (title.length > 120 || link.length > 2000) return { error: "طول عنوان یا لینک بیشتر از حد مجاز است." };

  return {
    data: {
      title,
      name: stringValue(body.name) || null,
      description: stringValue(body.description),
      link,
      tone: stringValue(body.tone) || "violet",
      companyId,
      categoryId: categoryId || null,
      categoryTitle: categoryTitle || null,
    },
  };
}

export async function POST(request: Request) {
  try {
    const body = await request.json() as ServicePayload;
    const result = validateServicePayload(body);
    if ("error" in result) return Response.json(result, { status: 400 });

    const company = await prisma.company.findUnique({ where: { id: result.data.companyId } });
    if (!company) return Response.json({ error: "شرکت انتخاب‌شده پیدا نشد." }, { status: 404 });

    let categoryId = result.data.categoryId;
    if (categoryId) {
      const category = await prisma.category.findFirst({ where: { id: categoryId, companyId: result.data.companyId } });
      if (!category) return Response.json({ error: "دسته‌بندی انتخاب‌شده پیدا نشد." }, { status: 404 });
    } else {
      const category = await prisma.category.upsert({
        where: { companyId_title: { companyId: result.data.companyId, title: result.data.categoryTitle as string } },
        update: {},
        create: { title: result.data.categoryTitle as string, companyId: result.data.companyId },
      });
      categoryId = category.id;
    }

    const icon = await resolveFaviconUrl(result.data.link);
    const serviceData = {
      title: result.data.title,
      name: result.data.name,
      description: result.data.description,
      link: result.data.link,
      logo: null,
      logoName: null,
      icon,
      tone: result.data.tone,
      companyId: result.data.companyId,
    };
    const lastService = await prisma.service.aggregate({
      where: { companyId: result.data.companyId, categoryId: categoryId as string },
      _max: { order: true },
    });
    const service = await prisma.service.create({
      data: { ...serviceData, categoryId: categoryId as string, order: (lastService._max.order ?? -1) + 1 },
      include: { category: true },
    });

    return Response.json({ service }, { status: 201 });
  } catch (error) {
    console.error("POST /api/services failed", error);
    return Response.json({ error: "افزودن سرویس با خطا مواجه شد." }, { status: 500 });
  }
}
