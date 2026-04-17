"use client";

import { useRouter } from "next/navigation";
import { FormEvent, useCallback, useEffect, useMemo, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { translateDatabaseError } from "@/lib/messages";
import type { LedgerRecord, RecordForm, RecordType } from "@/types/record";

const commonCategories = ["餐饮", "交通", "购物", "工资", "住房", "娱乐", "医疗", "学习", "其他"];

const emptyForm: RecordForm = {
  type: "expense",
  category: "",
  amount: "",
  date: new Date().toISOString().slice(0, 10),
  note: ""
};

type DashboardClientProps = {
  userId: string;
  email: string;
};

export function DashboardClient({ userId, email }: DashboardClientProps) {
  const router = useRouter();
  const supabase = useMemo(() => createClient(), []);
  const [records, setRecords] = useState<LedgerRecord[]>([]);
  const [form, setForm] = useState<RecordForm>(emptyForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [filters, setFilters] = useState({
    startDate: "",
    endDate: "",
    type: "all",
    category: ""
  });

  const loadRecords = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("records")
      .select("*")
      .order("date", { ascending: false })
      .order("created_at", { ascending: false });

    if (error) {
      setMessage(translateDatabaseError(error.message));
    } else {
      setRecords((data ?? []) as LedgerRecord[]);
    }
    setLoading(false);
  }, [supabase]);

  useEffect(() => {
    void loadRecords();
  }, [loadRecords]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setMessage("");

    const amount = Number(form.amount);
    if (!Number.isFinite(amount) || amount <= 0) {
      setMessage("金额必须大于 0。");
      setSaving(false);
      return;
    }

    const payload = {
      user_id: userId,
      type: form.type,
      category: form.category.trim(),
      amount,
      date: form.date,
      note: form.note.trim() || null
    };

    const result = editingId
      ? await supabase.from("records").update(payload).eq("id", editingId)
      : await supabase.from("records").insert(payload);

    setSaving(false);
    if (result.error) {
      setMessage(translateDatabaseError(result.error.message));
      return;
    }

    setForm(emptyForm);
    setEditingId(null);
    await loadRecords();
  }

  async function handleDelete(id: string) {
    const confirmed = window.confirm("确定删除这条账单吗？");
    if (!confirmed) return;

    const { error } = await supabase.from("records").delete().eq("id", id);
    if (error) {
      setMessage(translateDatabaseError(error.message));
      return;
    }
    setRecords((current) => current.filter((record) => record.id !== id));
  }

  async function handleSignOut() {
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }

  function startEdit(record: LedgerRecord) {
    setEditingId(record.id);
    setForm({
      type: record.type,
      category: record.category,
      amount: String(record.amount),
      date: record.date,
      note: record.note ?? ""
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function cancelEdit() {
    setEditingId(null);
    setForm(emptyForm);
  }

  const categories = useMemo(
    () => Array.from(new Set(records.map((record) => record.category))).sort(),
    [records]
  );

  const filteredRecords = useMemo(() => {
    return records.filter((record) => {
      if (filters.startDate && record.date < filters.startDate) return false;
      if (filters.endDate && record.date > filters.endDate) return false;
      if (filters.type !== "all" && record.type !== filters.type) return false;
      if (filters.category && record.category !== filters.category) return false;
      return true;
    });
  }, [records, filters]);

  const stats = useMemo(() => {
    return filteredRecords.reduce(
      (total, record) => {
        if (record.type === "income") total.income += Number(record.amount);
        if (record.type === "expense") total.expense += Number(record.amount);
        total.balance = total.income - total.expense;
        return total;
      },
      { income: 0, expense: 0, balance: 0 }
    );
  }, [filteredRecords]);

  return (
    <main className="min-h-screen bg-slate-50">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-6xl flex-col gap-4 px-4 py-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-semibold text-brand-700">CloudLedger</p>
            <h1 className="text-2xl font-bold text-slate-950">我的记账本</h1>
            <p className="mt-1 text-sm text-slate-500">{email}</p>
          </div>
          <button
            className="h-10 rounded-md border border-slate-300 bg-white px-4 text-sm font-semibold text-slate-800 transition hover:bg-slate-100"
            onClick={handleSignOut}
            type="button"
          >
            退出登录
          </button>
        </div>
      </header>

      <div className="mx-auto grid max-w-6xl gap-6 px-4 py-6 lg:grid-cols-[360px_1fr]">
        <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="text-lg font-bold text-slate-950">{editingId ? "编辑账单" : "新增账单"}</h2>
          <form className="mt-5 space-y-4" onSubmit={handleSubmit}>
            <label className="block">
              <span className="text-sm font-medium text-slate-700">类型</span>
              <select
                className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 outline-none focus:border-brand-700 focus:ring-2 focus:ring-brand-100"
                value={form.type}
                onChange={(event) => setForm({ ...form, type: event.target.value as RecordType })}
              >
                <option value="expense">支出</option>
                <option value="income">收入</option>
              </select>
            </label>
            <label className="block">
              <span className="text-sm font-medium text-slate-700">分类</span>
              <input
                className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 outline-none focus:border-brand-700 focus:ring-2 focus:ring-brand-100"
                value={form.category}
                onChange={(event) => setForm({ ...form, category: event.target.value })}
                list="category-presets"
                placeholder="餐饮、交通、工资..."
                required
              />
              <datalist id="category-presets">
                {commonCategories.map((category) => (
                  <option key={category} value={category} />
                ))}
              </datalist>
            </label>
            <label className="block">
              <span className="text-sm font-medium text-slate-700">金额</span>
              <input
                className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 outline-none focus:border-brand-700 focus:ring-2 focus:ring-brand-100"
                type="number"
                min="0.01"
                step="0.01"
                value={form.amount}
                onChange={(event) => setForm({ ...form, amount: event.target.value })}
                required
              />
            </label>
            <label className="block">
              <span className="text-sm font-medium text-slate-700">日期</span>
              <input
                className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 outline-none focus:border-brand-700 focus:ring-2 focus:ring-brand-100"
                type="date"
                value={form.date}
                onChange={(event) => setForm({ ...form, date: event.target.value })}
                required
              />
            </label>
            <label className="block">
              <span className="text-sm font-medium text-slate-700">备注</span>
              <textarea
                className="mt-1 min-h-24 w-full rounded-md border border-slate-300 px-3 py-2 outline-none focus:border-brand-700 focus:ring-2 focus:ring-brand-100"
                value={form.note}
                onChange={(event) => setForm({ ...form, note: event.target.value })}
              />
            </label>
            {message ? <p className="text-sm text-red-600">{message}</p> : null}
            <div className="flex gap-3">
              <button
                className="h-11 flex-1 rounded-md bg-brand-700 text-sm font-semibold text-white transition hover:bg-brand-900 disabled:cursor-not-allowed disabled:opacity-60"
                disabled={saving}
                type="submit"
              >
                {saving ? "保存中..." : editingId ? "保存修改" : "新增账单"}
              </button>
              {editingId ? (
                <button
                  className="h-11 rounded-md border border-slate-300 px-4 text-sm font-semibold text-slate-800 transition hover:bg-slate-100"
                  onClick={cancelEdit}
                  type="button"
                >
                  取消
                </button>
              ) : null}
            </div>
          </form>
        </section>

        <section className="space-y-6">
          <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="text-lg font-bold text-slate-950">筛选</h2>
            <div className="mt-4 grid gap-4 md:grid-cols-4">
              <FilterInput label="开始日期" type="date" value={filters.startDate} onChange={(value) => setFilters({ ...filters, startDate: value })} />
              <FilterInput label="结束日期" type="date" value={filters.endDate} onChange={(value) => setFilters({ ...filters, endDate: value })} />
              <label className="block">
                <span className="text-sm font-medium text-slate-700">类型</span>
                <select
                  className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 outline-none focus:border-brand-700 focus:ring-2 focus:ring-brand-100"
                  value={filters.type}
                  onChange={(event) => setFilters({ ...filters, type: event.target.value })}
                >
                  <option value="all">全部</option>
                  <option value="expense">支出</option>
                  <option value="income">收入</option>
                </select>
              </label>
              <label className="block">
                <span className="text-sm font-medium text-slate-700">分类</span>
                <select
                  className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 outline-none focus:border-brand-700 focus:ring-2 focus:ring-brand-100"
                  value={filters.category}
                  onChange={(event) => setFilters({ ...filters, category: event.target.value })}
                >
                  <option value="">全部分类</option>
                  {categories.map((category) => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>
              </label>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            <StatCard label="总收入" value={stats.income} tone="income" />
            <StatCard label="总支出" value={stats.expense} tone="expense" />
            <StatCard label="当前结余" value={stats.balance} tone="balance" />
          </div>

          <div className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
            <div className="border-b border-slate-200 p-5">
              <h2 className="text-lg font-bold text-slate-950">账单列表</h2>
              <p className="mt-1 text-sm text-slate-500">共 {filteredRecords.length} 条记录</p>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-200 text-sm">
                <thead className="bg-slate-100 text-left text-slate-600">
                  <tr>
                    <th className="px-4 py-3 font-semibold">日期</th>
                    <th className="px-4 py-3 font-semibold">类型</th>
                    <th className="px-4 py-3 font-semibold">分类</th>
                    <th className="px-4 py-3 text-right font-semibold">金额</th>
                    <th className="px-4 py-3 font-semibold">备注</th>
                    <th className="px-4 py-3 text-right font-semibold">操作</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {loading ? (
                    <tr><td className="px-4 py-8 text-center text-slate-500" colSpan={6}>加载中...</td></tr>
                  ) : filteredRecords.length === 0 ? (
                    <tr><td className="px-4 py-8 text-center text-slate-500" colSpan={6}>暂无账单</td></tr>
                  ) : (
                    filteredRecords.map((record) => (
                      <tr key={record.id} className="bg-white">
                        <td className="whitespace-nowrap px-4 py-3">{record.date}</td>
                        <td className="whitespace-nowrap px-4 py-3">{record.type === "income" ? "收入" : "支出"}</td>
                        <td className="whitespace-nowrap px-4 py-3">{record.category}</td>
                        <td className={`whitespace-nowrap px-4 py-3 text-right font-semibold ${record.type === "income" ? "text-emerald-700" : "text-rose-700"}`}>
                          {formatMoney(record.amount)}
                        </td>
                        <td className="max-w-52 px-4 py-3 text-slate-600">{record.note || "-"}</td>
                        <td className="whitespace-nowrap px-4 py-3 text-right">
                          <button className="mr-3 font-semibold text-brand-700 hover:text-brand-900" onClick={() => startEdit(record)} type="button">编辑</button>
                          <button className="font-semibold text-red-600 hover:text-red-800" onClick={() => handleDelete(record.id)} type="button">删除</button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}

function FilterInput({
  label,
  type,
  value,
  onChange
}: {
  label: string;
  type: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <label className="block">
      <span className="text-sm font-medium text-slate-700">{label}</span>
      <input
        className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 outline-none focus:border-brand-700 focus:ring-2 focus:ring-brand-100"
        type={type}
        value={value}
        onChange={(event) => onChange(event.target.value)}
      />
    </label>
  );
}

function StatCard({
  label,
  value,
  tone
}: {
  label: string;
  value: number;
  tone: "income" | "expense" | "balance";
}) {
  const color = {
    income: "text-emerald-700",
    expense: "text-rose-700",
    balance: "text-slate-950"
  }[tone];

  return (
    <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
      <p className="text-sm font-medium text-slate-500">{label}</p>
      <p className={`mt-2 text-2xl font-bold ${color}`}>{formatMoney(value)}</p>
    </div>
  );
}

function formatMoney(value: number) {
  return new Intl.NumberFormat("zh-CN", {
    style: "currency",
    currency: "CNY"
  }).format(value);
}
