"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { translateAuthError } from "@/lib/messages";
import { createClient } from "@/lib/supabase/client";

export default function ForgotPasswordPage() {
  const supabase = createClient();
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setMessage("");

    const { error } = await supabase.auth
      .resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`
      })
      .catch((error: Error) => ({ error }));
    setLoading(false);

    if (error) {
      setMessage(translateAuthError(error.message));
      return;
    }

    setMessage("如果这个邮箱已注册，我们已经发送了密码重置邮件。请打开邮箱里的链接继续。");
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 px-4 py-10">
      <div className="w-full max-w-md rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
        <h1 className="text-2xl font-bold text-slate-950">重置密码</h1>
        <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
          <label className="block">
            <span className="text-sm font-medium text-slate-700">邮箱</span>
            <input
              className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 outline-none focus:border-brand-700 focus:ring-2 focus:ring-brand-100"
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
            />
          </label>
          {message ? <p className="text-sm text-slate-600">{message}</p> : null}
          <button
            className="h-11 w-full rounded-md bg-brand-700 text-sm font-semibold text-white transition hover:bg-brand-900 disabled:cursor-not-allowed disabled:opacity-60"
            disabled={loading}
            type="submit"
          >
            {loading ? "发送中..." : "发送重置邮件"}
          </button>
        </form>
        <p className="mt-5 text-sm text-slate-600">
          想起来了？{" "}
          <Link className="font-semibold text-brand-700 hover:text-brand-900" href="/login">
            去登录
          </Link>
        </p>
      </div>
    </main>
  );
}
