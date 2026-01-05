import { SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '@/lib/database.types';

type TypedSupabaseClient = SupabaseClient<Database>;

export async function getUserRole(
  supabase: TypedSupabaseClient,
  userId: string
): Promise<string | null> {
  const { data, error } = await supabase
    .from('user_roles')
    .select('role')
    .eq('user_id', userId)
    .single();

  if (error) {
    console.error('Error fetching user role:', error);
    return null;
  }

  return data?.role || null;
}
