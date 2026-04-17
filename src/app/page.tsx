import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export default async function HomePage() {
  const supabase = createClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (user) {
    redirect("/dashboard");
  }

  return (
    <main className="min-h-screen bg-slate-50">
      <section className="mx-auto flex min-h-screen w-full max-w-5xl flex-col justify-center px-5 py-12">
        <div className="max-w-2xl">
          <p className="mb-4 text-sm font-semibold uppercase tracking-wide text-brand-700">
            CloudLedger
          </p>
          <h1 className="text-4xl font-bold leading-tight text-slate-950 sm:text-6xl">
            公网可访问的个人记账本
          </h1>
          <p className="mt-6 text-lg leading-8 text-slate-600">
            在电脑或手机上登录后，安全管理自己的收入和支出记录。账单数据由 Supabase Auth 和 RLS 隔离保护。
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link
              href="/signup"
              className="inline-flex h-11 items-center justify-center rounded-md bg-brand-700 px-5 text-sm font-semibold text-white shadow-sm transition hover:bg-brand-900"
            >
              创建账号
            </Link>
            <Link
              href="/login"
              className="inline-flex h-11 items-center justify-center rounded-md border border-slate-300 bg-white px-5 text-sm font-semibold text-slate-900 shadow-sm transition hover:bg-slate-100"
            >
              登录
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
