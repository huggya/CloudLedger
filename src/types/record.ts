export type RecordType = "income" | "expense";

export type LedgerRecord = {
  id: string;
  user_id: string;
  type: RecordType;
  category: string;
  amount: number;
  date: string;
  note: string | null;
  created_at: string;
};

export type RecordForm = {
  type: RecordType;
  category: string;
  amount: string;
  date: string;
  note: string;
};

export type MonthlyBudget = {
  id: string;
  user_id: string;
  month: string;
  budget: number;
  created_at: string;
  updated_at: string;
};
