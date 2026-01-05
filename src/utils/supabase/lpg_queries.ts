
import { SupabaseClient } from '@supabase/supabase-js';
import type { Database, LpgItem } from '@/lib/database.types';
import { getUserRole } from './queries';

type TypedSupabaseClient = SupabaseClient<Database>;

export type LpgItemWithUser = LpgItem;

export async function getLpgItems(
  supabase: TypedSupabaseClient
): Promise<LpgItemWithUser[]> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];

  const role = await getUserRole(supabase, user.id);

  // For admins, we don't apply a user_id filter.
  // The RLS policy we created allows admins to SELECT all rows.
  // For non-admins, RLS automatically filters to their own rows.
  const query = supabase
    .from('lpg_items')
    .select('*')
    .order('created_at', { ascending: false });

  const { data, error } = await query;

  if (error) {
    console.error('Error fetching LPG items:', error);
    return [];
  }
  return (data as LpgItemWithUser[]) ?? [];
}

export async function addLpgItem(
  supabase: TypedSupabaseClient,
  item: Omit<LpgItem, 'id' | 'created_at' | 'user_id'>
): Promise<LpgItemWithUser | null> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
        console.error('User not authenticated');
        return null;
    }

  const { data, error } = await supabase
    .from('lpg_items')
    .insert({ ...item, user_id: user.id, stock: item.stock || 0 })
    .select('*')
    .single();

  if (error) {
    console.error('Error adding LPG item:', error);
    return null;
  }
  return data as LpgItemWithUser;
}

export async function deleteLpgItem(
  supabase: TypedSupabaseClient,
  id: number
): Promise<boolean> {
  const { error } = await supabase.from('lpg_items').delete().eq('id', id);
  if (error) {
    console.error('Error deleting LPG item:', error);
  }
  return !error;
}

export async function updateLpgItem(
  supabase: TypedSupabaseClient,
  id: number,
  updates: Partial<Omit<LpgItem, 'id' | 'created_at' | 'user_id'>>
): Promise<LpgItemWithUser | null> {
  const { data, error } = await supabase
    .from('lpg_items')
    .update(updates)
    .eq('id', id)
    .select('*')
    .single();

  if (error) {
    console.error('Error updating LPG item:', error);
    return null;
  }
  return data as LpgItemWithUser;
}

export async function getTotalLpgItems(
  supabase: TypedSupabaseClient
): Promise<number> {
  const { count, error } = await supabase
    .from('lpg_items')
    .select('id', { count: 'exact', head: true });

  if (error) {
    console.error('Error fetching total LPG items:', error);
    return 0;
  }
  return count ?? 0;
}
