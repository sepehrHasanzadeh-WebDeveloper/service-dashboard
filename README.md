# داشبورد مدیریت سرویس‌ها

یک داشبورد داخلی برای مدیریت شرکت‌ها، دسته‌بندی‌ها و سرویس‌های هر شرکت. این پروژه با Next.js، React، Prisma و SQLite ساخته شده و احراز هویت داخلی با نشست امضاشده‌ی هفت‌ساعته دارد.

## پیش‌نیازها

- Node.js نسخه‌ی ۲۰ یا بالاتر
- Corepack فعال و pnpm نسخه‌ی `12.6.0`
- برای اجرای کانتینری: Docker و Docker Compose

مدیر بسته‌ی پروژه فقط `pnpm` است. فایل `pnpm-lock.yaml` باید همراه سورس در مخزن نگه‌داری شود.

## اجرای محلی

در PowerShell:

```powershell
corepack enable
corepack install --global pnpm@12.6.0
pnpm install
Copy-Item .env.example .env
pnpm exec prisma migrate deploy
pnpm dev
```

سپس داشبورد را در [http://localhost:3000](http://localhost:3000) باز کنید.

برای ورود، مقدارهای `DASHBOARD_USERNAME` و `DASHBOARD_PASSWORD` را در فایل `.env` تنظیم کنید. فایل `.env` محرمانه است و نباید commit شود.

## اجرای production بدون Docker

```powershell
pnpm install --frozen-lockfile
pnpm exec prisma migrate deploy
pnpm build
pnpm start
```

پورت پیش‌فرض production برابر `3000` است.

## اجرای Docker

Dockerfile از pnpm نسخه‌ی `12.6.0` با Corepack استفاده می‌کند و نصب وابستگی‌ها را با lockfile قفل‌شده انجام می‌دهد.

ابتدا فایل تنظیمات محیطی را بسازید:

```powershell
Copy-Item .env.example .env
```

سپس تصویر را بسازید و سرویس را اجرا کنید:

```powershell
docker compose up -d --build
```

دستورهای کاربردی:

```powershell
docker compose ps
docker compose logs -f dashboard
docker compose restart dashboard
docker compose down
```

برنامه در [http://localhost:3000](http://localhost:3000) در دسترس است. دیتابیس SQLite داخل volume با نام `dashboard_data` نگه‌داری می‌شود؛ بنابراین با `docker compose down` حذف نمی‌شود. برای حذف volume و اطلاعات دیتابیس باید صراحتاً از `docker compose down -v` استفاده کنید.

## متغیرهای محیطی

| متغیر | توضیح |
| --- | --- |
| `DASHBOARD_USERNAME` | نام کاربری ورود به داشبورد |
| `DASHBOARD_PASSWORD` | رمز عبور ورود به داشبورد |
| `AUTH_SECRET` | کلید طولانی و تصادفی برای امضای نشست‌ها |
| `DATABASE_URL` | آدرس دیتابیس Prisma؛ در Compose روی `file:/app/data/dev.db` تنظیم می‌شود |

نشست ورود پس از ۷ ساعت منقضی می‌شود. برای محیط واقعی، رمز عبور و `AUTH_SECRET` را از مقادیر نمونه تغییر دهید.

## اسکریپت‌ها و بررسی کیفیت

```powershell
pnpm dev                    # اجرای محیط توسعه
pnpm build                  # ساخت production
pnpm start                  # اجرای نسخه‌ی production
pnpm lint                   # بررسی ESLint
pnpm exec tsc --noEmit      # بررسی TypeScript
pnpm exec prisma generate   # تولید Prisma Client
pnpm exec prisma migrate deploy
pnpm db:seed                # اجرای seed در صورت نیاز
```

قبل از push این بررسی‌ها را اجرا کنید:

```powershell
pnpm install --frozen-lockfile
pnpm lint
pnpm exec tsc --noEmit
pnpm build
docker compose build
```

## ساختار پروژه

```text
src/
├─ app/                 # routeها، صفحه‌ها و APIهای Next.js
├─ components/          # کامپوننت‌های مستقل با CSS Module کنار خودشان
├─ context/             # state سراسری داشبورد
└─ lib/                 # منطق احراز هویت و ابزارهای مشترک
prisma/                 # schema، migration و seed دیتابیس
Dockerfile              # ساخت image production با pnpm
docker-compose.yml      # اجرای production همراه volume دیتابیس
```

## آماده‌سازی برای push

- `package-lock.json` و سایر فایل‌های lock مربوط به مدیران بسته‌ی دیگر در پروژه وجود ندارند.
- `pnpm-lock.yaml` و `pnpm-workspace.yaml` باید commit شوند.
- `.env`، دیتابیس محلی، `node_modules`، `.next` و خروجی build در `.gitignore` قرار دارند.
- قبل از انتشار، مقدارهای واقعی و محرمانه را فقط در محیط deployment تنظیم کنید و در مخزن قرار ندهید.
