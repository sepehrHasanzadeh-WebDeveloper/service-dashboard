<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

## قوانین معماری پروژه

- پروژه از این به بعد به‌صورت کامپوننت‌محور توسعه داده می‌شود.
- هر بخش باید بر اساس نام و مسئولیت خودش در کامپوننت مستقل قرار بگیرد.
- هر کامپوننت باید داخل فولدری با نام خودش قرار داشته باشد.
- فایل TSX و استایل همان کامپوننت باید کنار هم در همان فولدر قرار بگیرند.
- برای استایل کامپوننت‌ها از CSS Module با نام‌گذاری `*.module.css` استفاده می‌کنیم.
