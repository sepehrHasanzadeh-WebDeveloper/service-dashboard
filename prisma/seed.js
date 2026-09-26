/* eslint-disable @typescript-eslint/no-require-imports */
const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

const companies = [
  {
    name: "آهن آنلاین",
    subtitle: "تجارت، فروش و زنجیره‌ی تأمین",
    categories: [
      {
        title: "پایگاه‌های داده",
        services: [
          ["PostgreSQL", "دیتابیس تراکنشی اصلی", "https://postgresql.org", "Database", "blue"],
          ["Redis", "کش و صف پردازش", "https://redis.io", "Database", "rose"],
          ["MongoDB", "داده‌های سندمحور", "https://mongodb.com", "Database", "mint"],
        ],
      },
      {
        title: "DevOps و توسعه",
        services: [
          ["GitLab", "مخزن کد و CI/CD", "https://gitlab.com", "GitBranch", "orange"],
          ["Jenkins", "اتوماسیون استقرار", "https://jenkins.io", "Code2", "amber"],
          ["Container Registry", "مخزن ایمیج‌ها", "https://hub.docker.com", "Container", "cyan"],
          ["Argo CD", "استقرار پیوسته‌ی Kubernetes", "https://example.com/argo-cd", "GitBranch", "violet"],
          ["Helm", "مدیریت پکیج‌های Kubernetes", "https://example.com/helm", "Container", "blue"],
          ["Terraform Cloud", "مدیریت زیرساخت به‌صورت کد", "https://example.com/terraform-cloud", "Cloud", "cyan"],
          ["Ansible AWX", "اتوماسیون و مدیریت سرورها", "https://example.com/ansible-awx", "Server", "orange"],
          ["SonarQube", "تحلیل کیفیت کد و آسیب‌پذیری‌ها", "https://example.com/sonarqube", "ShieldCheck", "rose"],
          ["Nexus Repository", "مدیریت آرتیفکت‌ها و پکیج‌ها", "https://example.com/nexus", "Container", "amber"],
          ["Harbor Registry", "رجیستری امن ایمیج‌ها", "https://example.com/harbor", "Container", "blue"],
          ["Drone CI", "اجرای Pipelineهای CI", "https://example.com/drone-ci", "Activity", "mint"],
          ["CircleCI", "ساخت و تست خودکار پروژه‌ها", "https://example.com/circle-ci", "Code2", "cyan"],
          ["TeamCity", "مدیریت فرآیند Build", "https://example.com/teamcity", "Code2", "violet"],
          ["Rundeck", "اجرای عملیات استاندارد زیرساخت", "https://example.com/rundeck", "MonitorCog", "orange"],
          ["Atlantis", "بازبینی و اجرای Terraform", "https://example.com/atlantis", "GitBranch", "amber"],
          ["Renovate", "به‌روزرسانی خودکار وابستگی‌ها", "https://example.com/renovate", "Activity", "mint"],
          ["OpenTofu", "مدیریت متن‌باز زیرساخت", "https://example.com/opentofu", "Cloud", "blue"],
          ["Flux CD", "همگام‌سازی GitOps کلاستر", "https://example.com/flux-cd", "GitBranch", "cyan"],
          ["Tekton", "ساخت Pipelineهای Kubernetes", "https://example.com/tekton", "Container", "rose"],
          ["Backstage", "پرتال توسعه‌دهندگان سازمان", "https://example.com/backstage", "LayoutGrid", "violet"],
          ["Snyk", "اسکن امنیتی کد و پکیج‌ها", "https://example.com/snyk", "ShieldCheck", "orange"],
          ["Trivy", "اسکن امنیتی ایمیج و فایل‌سیستم", "https://example.com/trivy", "ShieldCheck", "amber"],
          ["Checkly", "پایش و تست Endpointها", "https://example.com/checkly", "Activity", "mint"],
        ],
      },
      {
        title: "زیرساخت و کلاود",
        services: [
          ["Proxmox", "مجازی‌سازی سرورها", "https://proxmox.com", "Server", "violet"],
          ["Kubernetes", "مدیریت کانتینرها", "https://kubernetes.io", "Container", "blue"],
          ["Cloud Storage", "فضای ذخیره‌سازی ابری", "https://aws.amazon.com/s3", "Cloud", "cyan"],
        ],
      },
      {
        title: "مانیتورینگ و لاگینگ",
        services: [
          ["Grafana", "داشبوردهای عملیاتی", "https://grafana.com", "BarChart3", "orange"],
          ["Prometheus", "متریک و پایش سرویس‌ها", "https://prometheus.io", "Activity", "rose"],
          ["Loki", "مرکز لاگ سرویس‌ها", "https://grafana.com/oss/loki", "MonitorCog", "violet"],
        ],
      },
      {
        title: "امنیت و دسترسی",
        services: [
          ["Vault", "مدیریت secrets", "https://developer.hashicorp.com/vault", "KeyRound", "amber"],
          ["Access Hub", "دسترسی یکپارچه تیم‌ها", "https://example.com/access-hub", "ShieldCheck", "mint"],
        ],
      },
    ],
  },
  {
    name: "گره",
    subtitle: "محصولات دیجیتال و خدمات سازمانی",
    categories: [
      {
        title: "پایگاه‌های داده",
        services: [
          ["PostgreSQL گره", "دیتابیس محصولات", "https://postgresql.org", "Database", "blue"],
          ["Redis Cluster", "کش مشترک تیم‌ها", "https://redis.io", "Database", "rose"],
        ],
      },
      {
        title: "توسعه و تحویل",
        services: [
          ["GitLab گره", "پروژه‌ها و پایپ‌لاین‌ها", "https://gitlab.com", "GitBranch", "orange"],
          ["Sentry", "ردیابی خطاهای محصول", "https://sentry.io", "Activity", "violet"],
        ],
      },
      {
        title: "محصول و تحلیل",
        services: [
          ["Product Analytics", "تحلیل رفتار کاربران", "https://example.com/product-analytics", "BarChart3", "mint"],
          ["Content Hub", "مدیریت محتوای محصولات", "https://example.com/content-hub", "BookOpen", "cyan"],
        ],
      },
      {
        title: "امنیت و ارتباطات",
        services: [
          ["Identity Center", "ورود و دسترسی کاربران", "https://example.com/identity-center", "ShieldCheck", "blue"],
          ["Team Chat", "ارتباطات داخلی تیم", "https://example.com/team-chat", "MessageSquare", "violet"],
        ],
      },
    ],
  },
];

async function seed() {
  for (const companyData of companies) {
    const company = await prisma.company.upsert({
      where: { name: companyData.name },
      update: { subtitle: companyData.subtitle },
      create: { name: companyData.name, subtitle: companyData.subtitle },
    });

    for (const categoryData of companyData.categories) {
      const category = await prisma.category.upsert({
        where: { companyId_title: { companyId: company.id, title: categoryData.title } },
        update: {},
        create: { companyId: company.id, title: categoryData.title },
      });

      let nextOrder = ((await prisma.service.aggregate({
        where: { companyId: company.id, categoryId: category.id },
        _max: { order: true },
      }))._max.order ?? -1) + 1;

      for (const [title, description, link, icon, tone] of categoryData.services) {
        const existingService = await prisma.service.findFirst({
          where: { companyId: company.id, categoryId: category.id, title },
        });

        const serviceData = { companyId: company.id, categoryId: category.id, title, description, link, icon, tone };
        if (existingService) await prisma.service.update({ where: { id: existingService.id }, data: serviceData });
        else await prisma.service.create({ data: { ...serviceData, order: nextOrder } });
        if (!existingService) nextOrder += 1;
      }
    }
  }
}

seed()
  .then(async () => {
    console.log("Seed completed: 2 companies and their services are ready.");
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error("Seed failed", error);
    await prisma.$disconnect();
    process.exit(1);
  });
