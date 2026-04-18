# CloudLedger

线上地址：https://cloud-ledger-wine.vercel.app

手机使用：用手机浏览器打开线上地址后，可以通过浏览器菜单添加到主屏幕；电脑使用时可以直接加入浏览器收藏夹。

CloudLedger 是一个公网版个人在线记账本 MVP，使用 Next.js App Router、TypeScript、Tailwind CSS、Supabase Auth/Postgres/RLS 和 Vercel。

## 目录结构

```text
CloudLedger/
├─ .env.local.example
├─ .gitignore
├─ README.md
├─ middleware.ts
├─ next-env.d.ts
├─ next.config.mjs
├─ package.json
├─ postcss.config.mjs
├─ tailwind.config.ts
├─ tsconfig.json
├─ supabase/
│  └─ schema.sql
└─ src/
   ├─ app/
   │  ├─ dashboard/
   │  │  ├─ dashboard-client.tsx
   │  │  └─ page.tsx
   │  ├─ login/
   │  │  └─ page.tsx
   │  ├─ signup/
   │  │  └─ page.tsx
   │  ├─ globals.css
   │  ├─ layout.tsx
   │  └─ page.tsx
   ├─ lib/
   │  └─ supabase/
   │     ├─ client.ts
   │     ├─ middleware.ts
   │     └─ server.ts
   └─ types/
      └─ record.ts
```

## 功能

- 用户注册、登录、退出
- 受保护的 `/dashboard`
- 账单新增、编辑、删除、列表展示
- 按开始日期、结束日期、类型、分类筛选
- 统计总收入、总支出、当前结余
- 导出当前账号的全部账单为 CSV 文件
- 手机和电脑响应式布局
- Supabase RLS 隔离用户数据

## 本地运行

1. 安装 Node.js 20 LTS 或更新版本。
2. 安装依赖：

```bash
npm install
```

3. 复制环境变量文件：

```bash
cp .env.local.example .env.local
```

4. 填写 `.env.local`：

```bash
NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
```

5. 启动开发服务器：

```bash
npm run dev
```

6. 浏览器访问 `http://localhost:3000`。

## Supabase 配置

1. 在 Supabase 创建新项目。
2. 进入 `Project Settings -> API`，复制 Project URL 和 anon public key 到 `.env.local`。
3. 进入 `SQL Editor`，执行 `supabase/schema.sql` 中的完整 SQL。
4. 进入 `Authentication -> Providers`，确认 Email provider 已启用。
5. MVP 阶段为了注册后立即可登录，可以在 `Authentication -> Sign In / Providers -> Email` 关闭 Confirm email；如果开启邮箱确认，用户需要先点击确认邮件。
6. 进入 `Authentication -> URL Configuration`，本地开发时可加入 `http://localhost:3000`，部署后加入 Vercel 域名。

## Vercel 部署

1. 将项目推送到 GitHub、GitLab 或 Bitbucket。
2. 在 Vercel 导入该仓库，Framework Preset 选择 Next.js。
3. 在 Vercel 项目 `Settings -> Environment Variables` 添加：

```bash
NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
```

4. 部署后，将 Vercel 生成的公网域名加入 Supabase `Authentication -> URL Configuration` 的 Site URL 和 Redirect URLs。
5. 重新部署或刷新应用，即可通过公网访问。

## Cloudflare Workers 部署

如果 `vercel.app` 在某些手机网络上打不开，可以把同一个项目部署到 Cloudflare Workers，使用 Cloudflare 免费域名。

1. 安装依赖后执行构建：

```bash
npm run build:cloudflare
```

2. 登录 Cloudflare：

```bash
npx wrangler login
```

3. 部署：

```bash
npm run deploy:cloudflare
```

4. 部署成功后，Cloudflare 会给出类似下面的地址：

```text
https://cloudledger.your-subdomain.workers.dev
```

5. 将这个新地址加入 Supabase `Authentication -> URL Configuration`：

```text
Site URL:
https://cloudledger.your-subdomain.workers.dev

Redirect URLs:
https://cloudledger.your-subdomain.workers.dev/**
```

## Supabase SQL

SQL 文件位于 `supabase/schema.sql`，包含：

- `records` 建表 SQL
- RLS 启用 SQL
- select/insert/update/delete policy SQL
- 常用索引

## 页面

- `/`：首页
- `/login`：登录页
- `/signup`：注册页
- `/dashboard`：主记账页，未登录自动跳转到 `/login`
