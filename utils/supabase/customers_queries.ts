
import { SupabaseClient } from '@supabase/supabase-js';
import type { Database, Customer } from '@/lib/database.types';

type TypedSupabaseClient = SupabaseClient<Database>;

export { type Customer };

export async function getCustomers(
  supabase: TypedSupabaseClient
): Promise<Customer[]> {
  const { data, error } = await supabase
    .from('customers')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching customers:', error);
    return [];
  }
  return data ?? [];
}

export async function addCustomer(
  supabase: TypedSupabaseClient,
  customer: Omit<Customer, 'id' | 'created_at' | 'user_id'>
): Promise<Customer | null> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    console.error('User not authenticated');
    return null;
  }

  const { data, error } = await supabase
    .from('customers')
    .insert({ ...customer, user_id: user.id })
    .select()
    .single();

  if (error) {
    console.error('Error adding customer:', error);
    return null;
  }
  return data;
}

export async function deleteCustomer(
  supabase: TypedSupabaseClient,
  id: string
): Promise<boolean> {
  const { error } = await supabase.from('customers').delete().eq('id', id);
  if (error) {
    console.error('Error deleting customer:', error);
  }
  return !error;
}

export async function getTotalCustomers(
  supabase: TypedSupabaseClient
): Promise<number> {
  const { count, error } = await supabase
    .from('customers')
    .select('id', { count: 'exact', head: true });

  if (error) {
    console.error('Error fetching total customers:', error);
    return 0;
  }
  return count ?? 0;
}
