import { SupabaseClient } from '@supabase/supabase-js';
import type { Database, LpgSale, LpgSaleItem, LpgItem } from '@/lib/database.types';
import { updateLpgItem } from './lpg_queries'; // To update stock

type TypedSupabaseClient = SupabaseClient<Database>;

export { type LpgSale, type LpgSaleItem };

// Get all sales for the current user (admin only)
export async function getLpgSales(
  supabase: TypedSupabaseClient
): Promise<LpgSale[]> {
  const { data, error } = await supabase
    .from('lpg_sales')
    .select('*')
    .order('sale_date', { ascending: false });

  if (error) {
    console.error('Error fetching LPG sales:', error);
    return [];
  }
  return data ?? [];
}

// Get sale items for a specific sale (admin only)
export async function getLpgSaleItems(
  supabase: TypedSupabaseClient,
  saleId: number
): Promise<LpgSaleItem[]> {
  const { data, error } = await supabase
    .from('lpg_sale_items')
    .select('*')
    .eq('sale_id', saleId);

  if (error) {
    console.error(`Error fetching sale items for sale ${saleId}:`, error);
    return [];
  }
  return data ?? [];
}

interface CartItem {
    item_id: number;
    quantity: number;
    price_at_sale: number;
    current_stock: number; // For validation
}

interface CreateSaleData {
    customer_id: string | null;
    notes?: string;
    cartItems: CartItem[];
}

// Create a new sale, update stock, and create sale items
export async function createLpgSale(
  supabase: TypedSupabaseClient,
  saleData: CreateSaleData
): Promise<LpgSale | null> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    console.error('User not authenticated');
    return null;
  }

  const { customer_id, notes, cartItems } = saleData;

  // Calculate total amount from cart items
  const total_amount = cartItems.reduce((sum, item) => sum + (item.quantity * item.price_at_sale), 0);

  // 1. Create the sale record
  const { data: newSale, error: saleError } = await supabase
    .from('lpg_sales')
    .insert({
      customer_id,
      notes,
      total_amount,
      user_id: user.id,
    })
    .select()
    .single();

  if (saleError) {
    console.error('Error creating LPG sale:', saleError);
    return null;
  }

  if (!newSale) {
      console.error('Failed to create new sale, but no error reported.');
      return null;
  }

  // 2. Create sale items and update product stock
  for (const cartItem of cartItems) {
    const { item_id, quantity, price_at_sale, current_stock } = cartItem;

    if (quantity > current_stock) {
        // This should ideally be caught by UI validation
        console.error(`Insufficient stock for item_id ${item_id}. Wanted ${quantity}, available ${current_stock}.`);
        // Rollback sale? For now, we'll let it proceed with error, but a transaction management is better.
        // For a real app, you'd want to use database transactions here.
        return null;
    }

    // Create lpg_sale_item record
    const { error: saleItemError } = await supabase
      .from('lpg_sale_items')
      .insert({
        sale_id: newSale.id,
        item_id,
        quantity,
        price_at_sale,
      });

    if (saleItemError) {
      console.error('Error creating LPG sale item:', saleItemError);
      // Attempt to rollback the main sale if this fails
      await supabase.from('lpg_sales').delete().eq('id', newSale.id);
      return null;
    }

    // Decrement stock in lpg_items
    const updatedItem = await updateLpgItem(supabase, item_id, { stock: current_stock - quantity });
    if (!updatedItem) {
        console.error(`Error updating stock for item ${item_id}`);
        // This is where a proper transaction would shine.
        // For now, assume a partial failure.
    }
  }

  return newSale;
}

// Delete a sale and its associated sale items (RLS will cascade delete lpg_sale_items)

export async function deleteLpgSale(

  supabase: TypedSupabaseClient,

  saleId: number

): Promise<boolean> {

    // Before deleting the sale, we need to revert stock.

    // This is complex and usually requires a database function or careful client-side logic

    // For simplicity now, just delete. Stock correction would be a manual process or

    // part of a more advanced "return" or "cancel" feature.

  const { error } = await supabase.from('lpg_sales').delete().eq('id', saleId);

  if (error) {

    console.error('Error deleting LPG sale:', error);

  }

  return !error;

}



export async function getTodaySalesTotal(

  supabase: TypedSupabaseClient

): Promise<number> {

  const today = new Date();

  today.setHours(0, 0, 0, 0); // Start of today

  const tomorrow = new Date(today);

  tomorrow.setDate(today.getDate() + 1); // Start of tomorrow



  const { data, error } = await supabase

    .from('lpg_sales')

    .select('total_amount')

    .gte('sale_date', today.toISOString())

    .lt('sale_date', tomorrow.toISOString());



  if (error) {

    console.error('Error fetching today\'s sales total:', error);

    return 0;

  }

  return data.reduce((sum, sale) => sum + parseFloat(sale.total_amount as any), 0);

}



export async function getMonthlySalesTotal(

  supabase: TypedSupabaseClient

): Promise<number> {

  const today = new Date();

  const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);

  const startOfNextMonth = new Date(today.getFullYear(), today.getMonth() + 1, 1);



  const { data, error } = await supabase

    .from('lpg_sales')

    .select('total_amount')

    .gte('sale_date', startOfMonth.toISOString())

    .lt('sale_date', startOfNextMonth.toISOString());



  if (error) {

    console.error('Error fetching monthly sales total:', error);

    return 0;

  }

  return data.reduce((sum, sale) => sum + parseFloat(sale.total_amount as any), 0);

}



export async function getRecentLpgSales(

  supabase: TypedSupabaseClient,

  limit: number = 5

): Promise<LpgSale[]> {

  const { data, error } = await supabase

    .from('lpg_sales')

    .select('*')

    .order('sale_date', { ascending: false })

    .limit(limit);



  if (error) {

    console.error('Error fetching recent LPG sales:', error);

    return [];

  }

  return data ?? [];

}