import { prisma } from "@/lib/prisma";
import { resolveFaviconUrl } from "@/lib/favicon";
import { DEFAULT_SERVICE_CATEGORIES, ensureDefaultServiceCategories } from "@/lib/service-categories";

export const runtime = "nodejs";

export async function GET() {
  try {
    const existingCompanies = await prisma.company.findMany({ select: { id: true } });
    await Promise.all(existingCompanies.map((company) => ensureDefaultServiceCategories(company.id)));

    const companies = await prisma.company.findMany({
      orderBy: { createdAt: "asc" },
      include: {
        categories: {
          orderBy: [{ order: "asc" }, { createdAt: "asc" }],
          include: { services: { orderBy: [{ order: "asc" }, { createdAt: "asc" }] } },
        },
      },
    });

    return Response.json({ companies }, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    console.error("GET /api/companies failed", error);
    return Response.json({ error: "دریافت اطلاعات شرکت‌ها با خطا مواجه شد." }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json() as { name?: unknown; subtitle?: unknown; link?: unknown };
    const name = typeof body.name === "string" ? body.name.trim() : "";
    const subtitle = typeof body.subtitle === "string" ? body.subtitle.trim() : "";
    const link = typeof body.link === "string" ? body.link.trim() : "";

    if (!name) {
      return Response.json({ error: "نام شرکت الزامی است." }, { status: 400 });
    }

    if (name.length > 120 || subtitle.length > 180) {
      return Response.json({ error: "طول اطلاعات شرکت بیشتر از حد مجاز است." }, { status: 400 });
    }

    if (name.length > 120 || subtitle.length > 180 || link.length > 2000) {
      return Response.json({ error: "اطلاعات شرکت بیشتر از حد مجاز است." }, { status: 400 });
    }

    if (link) {
      try {
        const parsedLink = new URL(link);
        if (parsedLink.protocol !== "http:" && parsedLink.protocol !== "https:") throw new Error("invalid protocol");
      } catch {
        return Response.json({ error: "لینک شرکت معتبر نیست." }, { status: 400 });
      }
    }

    const icon = link ? await resolveFaviconUrl(link) : null;

    const company = await prisma.company.create({
      data: {
        name,
        subtitle: subtitle || null,
        link: link || null,
        icon,
        categories: { create: DEFAULT_SERVICE_CATEGORIES.map((title, order) => ({ title, order })) },
      },
      include: { categories: { include: { services: true } } },
    });

    return Response.json({ company }, { status: 201 });
  } catch (error: unknown) {
    if (error instanceof Error && error.message.includes("Unique constraint")) {
      return Response.json({ error: "این شرکت قبلاً ثبت شده است." }, { status: 409 });
    }

    console.error("POST /api/companies failed", error);
    return Response.json({ error: "ثبت شرکت با خطا مواجه شد." }, { status: 500 });
  }
}
