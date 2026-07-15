"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useEffect, useState } from "react";
import { translateAuthError } from "@/lib/messages";
import { createClient } from "@/lib/supabase/client";

export default function ResetPasswordPage() {
  const router = useRouter();
  const supabase = createClient();
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let active = true;

    async function prepareRecoverySession() {
      const {
        data: { session }
      } = await supabase.auth.getSession();

      if (session) {
        if (active) {
          setReady(true);
        }
        return;
      }

      const code = new URLSearchParams(window.location.search).get("code");

      if (!code) {
        if (active) {
          setMessage("重置链接无效或已过期，请重新发送重置邮件。");
        }
        return;
      }

      const { error } = await supabase.auth.exchangeCodeForSession(code);

      if (!active) {
        return;
      }

      if (error) {
        setMessage(translateAuthError(error.message));
        return;
      }

      setReady(true);
    }

    prepareRecoverySession();

    return () => {
      active = false;
    };
  }, [supabase]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setMessage("");

    const { error } = await supabase.auth
      .updateUser({ password })
      .catch((error: Error) => ({ error }));
    setLoading(false);

    if (error) {
      setMessage(translateAuthError(error.message));
      return;
    }

    setMessage("密码已更新，正在跳转到登录页。");
    setTimeout(() => router.push("/login"), 800);
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 px-4 py-10">
      <div className="w-full max-w-md rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
        <h1 className="text-2xl font-bold text-slate-950">设置新密码</h1>
        <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
          <label className="block">
            <span className="text-sm font-medium text-slate-700">新密码</span>
            <input
              className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 outline-none focus:border-brand-700 focus:ring-2 focus:ring-brand-100"
              type="password"
              minLength={6}
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              required
            />
          </label>
          {message ? <p className="text-sm text-slate-600">{message}</p> : null}
          <button
            className="h-11 w-full rounded-md bg-brand-700 text-sm font-semibold text-white transition hover:bg-brand-900 disabled:cursor-not-allowed disabled:opacity-60"
            disabled={loading || !ready}
            type="submit"
          >
            {loading ? "保存中..." : ready ? "保存新密码" : "等待重置链接验证"}
          </button>
        </form>
        <p className="mt-5 text-sm text-slate-600">
          需要重新发送邮件？{" "}
          <Link className="font-semibold text-brand-700 hover:text-brand-900" href="/forgot-password">
            重置密码
          </Link>
        </p>
        <p className="mt-3 text-sm text-slate-600">
          已经改好？{" "}
          <Link className="font-semibold text-brand-700 hover:text-brand-900" href="/login">
            去登录
          </Link>
        </p>
      </div>
    </main>
  );
}
