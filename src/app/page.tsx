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
            Personal ledger for the public web
          </h1>
          <p className="mt-6 text-lg leading-8 text-slate-600">
            Sign in from desktop or mobile, then manage only your own income and expense records with Supabase Auth and RLS.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link
              href="/signup"
              className="inline-flex h-11 items-center justify-center rounded-md bg-brand-700 px-5 text-sm font-semibold text-white shadow-sm transition hover:bg-brand-900"
            >
              Create account
            </Link>
            <Link
              href="/login"
              className="inline-flex h-11 items-center justify-center rounded-md border border-slate-300 bg-white px-5 text-sm font-semibold text-slate-900 shadow-sm transition hover:bg-slate-100"
            >
              Sign in
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
