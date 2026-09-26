import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

export async function PATCH(request: Request, context: RouteContext<"/api/services/[id]/favorite">) {
  try {
    const { id } = await context.params;
    const body = await request.json() as { isFavorite?: unknown };

    if (typeof body.isFavorite !== "boolean") {
      return Response.json({ error: "وضعیت علاقه‌مندی معتبر نیست." }, { status: 400 });
    }

    const service = await prisma.service.update({
      where: { id },
      data: { isFavorite: body.isFavorite },
      include: { category: true },
    });

    return Response.json({ service });
  } catch (error) {
    console.error("PATCH /api/services/[id]/favorite failed", error);
    return Response.json({ error: "ذخیره وضعیت علاقه‌مندی با خطا مواجه شد." }, { status: 500 });
  }
}
