import { prisma } from "@/lib/prisma";
import { resolveFaviconUrl } from "@/lib/favicon";

export const runtime = "nodejs";

type CompanyPayload = {
  name?: unknown;
  subtitle?: unknown;
  link?: unknown;
};

function stringValue(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

function validateCompanyPayload(body: CompanyPayload) {
  const name = stringValue(body.name);
  const subtitle = stringValue(body.subtitle);
  const link = stringValue(body.link);

  if (link.length > 2000) return { error: "لینک شرکت بیشتر از حد مجاز است." };
  if (link) {
    try {
      const parsedLink = new URL(link);
      if (parsedLink.protocol !== "http:" && parsedLink.protocol !== "https:") throw new Error("invalid protocol");
    } catch {
      return { error: "لینک شرکت معتبر نیست." };
    }
  }

  if (!name) return { error: "نام شرکت الزامی است." };
  if (name.length > 120 || subtitle.length > 180) return { error: "طول اطلاعات شرکت بیشتر از حد مجاز است." };

  return { data: { name, subtitle: subtitle || null, link: link || null } };
}

export async function PATCH(request: Request, context: RouteContext<"/api/companies/[id]">) {
  try {
    const { id } = await context.params;
    const existingCompany = await prisma.company.findUnique({ where: { id } });
    if (!existingCompany) return Response.json({ error: "شرکت پیدا نشد." }, { status: 404 });

    const body = await request.json() as CompanyPayload;
    const result = validateCompanyPayload(body);
    if ("error" in result) return Response.json(result, { status: 400 });

    const duplicateCompany = await prisma.company.findFirst({ where: { name: result.data.name, NOT: { id } }, select: { id: true } });
    if (duplicateCompany) return Response.json({ error: "شرکت دیگری با این نام وجود دارد." }, { status: 409 });

    const icon = result.data.link === existingCompany.link
      ? existingCompany.icon
      : result.data.link ? await resolveFaviconUrl(result.data.link) : null;
    const company = await prisma.company.update({ where: { id }, data: { ...result.data, icon }, select: { id: true, name: true, subtitle: true, link: true, icon: true } });
    return Response.json({ company });
  } catch (error) {
    console.error("PATCH /api/companies/[id] failed", error);
    return Response.json({ error: "ویرایش شرکت با خطا مواجه شد." }, { status: 500 });
  }
}

export async function DELETE(_request: Request, context: RouteContext<"/api/companies/[id]">) {
  try {
    const { id } = await context.params;
    const existingCompany = await prisma.company.findUnique({ where: { id }, select: { id: true } });
    if (!existingCompany) return Response.json({ error: "شرکت پیدا نشد." }, { status: 404 });

    await prisma.company.delete({ where: { id } });
    return Response.json({ success: true });
  } catch (error) {
    console.error("DELETE /api/companies/[id] failed", error);
    return Response.json({ error: "حذف شرکت با خطا مواجه شد." }, { status: 500 });
  }
}
