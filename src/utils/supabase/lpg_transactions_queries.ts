import { SupabaseClient } from '@supabase/supabase-js';
import type { Database, LpgTransaction } from '@/lib/database.types';

type TypedSupabaseClient = SupabaseClient<Database>;

export { type LpgTransaction };

// Extended type with calculated fields
export interface LpgTransactionWithCalculations extends LpgTransaction {
  total_buy: number;
  total_sell: number;
  profit: number;
}

// Helper to add calculations
function addCalculations(transaction: LpgTransaction): LpgTransactionWithCalculations {
  const total_buy = transaction.weight_kg * transaction.buy_price_per_kg;
  const total_sell = transaction.weight_kg * transaction.sell_price_per_kg;
  const profit = total_sell - total_buy;
  return { ...transaction, total_buy, total_sell, profit };
}

// Get all transactions with optional date filters
export async function getLpgTransactions(
  supabase: TypedSupabaseClient,
  dateFrom?: string,
  dateTo?: string
): Promise<LpgTransactionWithCalculations[]> {
  let query = supabase
    .from('lpg_transactions')
    .select('*')
    .order('date', { ascending: false });

  if (dateFrom) {
    query = query.gte('date', dateFrom);
  }
  if (dateTo) {
    query = query.lte('date', dateTo);
  }

  const { data, error } = await query;

  if (error) {
    console.error('Error fetching LPG transactions:', error);
    return [];
  }

  return (data ?? []).map(addCalculations);
}

// Get transactions for a specific date
export async function getTransactionsByDate(
  supabase: TypedSupabaseClient,
  date: string
): Promise<LpgTransactionWithCalculations[]> {
  const { data, error } = await supabase
    .from('lpg_transactions')
    .select('*')
    .eq('date', date)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching transactions by date:', error);
    return [];
  }

  return (data ?? []).map(addCalculations);
}

// Add a new transaction
export async function addLpgTransaction(
  supabase: TypedSupabaseClient,
  transaction: {
    date: string;
    product_name: string;
    weight_kg: number;
    buy_price_per_kg: number;
    sell_price_per_kg: number;
  }
): Promise<LpgTransactionWithCalculations | null> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    console.error('User not authenticated');
    return null;
  }

  const { data, error } = await supabase
    .from('lpg_transactions')
    .insert({ ...transaction, user_id: user.id })
    .select()
    .single();

  if (error) {
    console.error('Error adding LPG transaction:', error);
    return null;
  }

  return addCalculations(data);
}

// Update a transaction
export async function updateLpgTransaction(
  supabase: TypedSupabaseClient,
  id: number,
  updates: {
    date?: string;
    product_name?: string;
    weight_kg?: number;
    buy_price_per_kg?: number;
    sell_price_per_kg?: number;
  }
): Promise<LpgTransactionWithCalculations | null> {
  const { data, error } = await supabase
    .from('lpg_transactions')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error('Error updating LPG transaction:', error);
    return null;
  }

  return addCalculations(data);
}

// Delete a transaction
export async function deleteLpgTransaction(
  supabase: TypedSupabaseClient,
  id: number
): Promise<boolean> {
  const { error } = await supabase
    .from('lpg_transactions')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Error deleting LPG transaction:', error);
    return false;
  }

  return true;
}

// Get daily profit summary
export interface DailyProfitSummary {
  date: string;
  totalKg: number;
  totalBuy: number;
  totalSell: number;
  totalProfit: number;
  transactionCount: number;
}

export async function getDailyProfitSummary(
  supabase: TypedSupabaseClient,
  date: string
): Promise<DailyProfitSummary> {
  const transactions = await getTransactionsByDate(supabase, date);

  const summary: DailyProfitSummary = {
    date,
    totalKg: 0,
    totalBuy: 0,
    totalSell: 0,
    totalProfit: 0,
    transactionCount: transactions.length,
  };

  for (const t of transactions) {
    summary.totalKg += t.weight_kg;
    summary.totalBuy += t.total_buy;
    summary.totalSell += t.total_sell;
    summary.totalProfit += t.profit;
  }

  return summary;
}

// Get monthly profit summary
export interface MonthlyProfitSummary {
  month: string;
  totalKg: number;
  totalBuy: number;
  totalSell: number;
  totalProfit: number;
  transactionCount: number;
}

export async function getMonthlyProfitSummary(
  supabase: TypedSupabaseClient,
  year: number,
  month: number
): Promise<MonthlyProfitSummary> {
  const startDate = `${year}-${String(month).padStart(2, '0')}-01`;
  const endDate = new Date(year, month, 0).toISOString().split('T')[0]; // Last day of month

  const transactions = await getLpgTransactions(supabase, startDate, endDate);

  const summary: MonthlyProfitSummary = {
    month: `${year}-${String(month).padStart(2, '0')}`,
    totalKg: 0,
    totalBuy: 0,
    totalSell: 0,
    totalProfit: 0,
    transactionCount: transactions.length,
  };

  for (const t of transactions) {
    summary.totalKg += t.weight_kg;
    summary.totalBuy += t.total_buy;
    summary.totalSell += t.total_sell;
    summary.totalProfit += t.profit;
  }

  return summary;
}
