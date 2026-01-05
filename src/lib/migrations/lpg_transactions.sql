-- LPG Transactions Table for Profit Tracking
-- Run this in Supabase SQL Editor

-- Create the lpg_transactions table
CREATE TABLE IF NOT EXISTS lpg_transactions (
  id SERIAL PRIMARY KEY,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  product_name VARCHAR(255) NOT NULL,
  weight_kg DECIMAL(10,2) NOT NULL,
  buy_price_per_kg DECIMAL(10,2) NOT NULL,
  sell_price_per_kg DECIMAL(10,2) NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Note: Supabase doesn't support GENERATED ALWAYS AS for computed columns
-- We'll calculate total_buy, total_sell, and profit in the application layer

-- Create index for faster date-based queries
CREATE INDEX IF NOT EXISTS idx_lpg_transactions_date ON lpg_transactions(date);
CREATE INDEX IF NOT EXISTS idx_lpg_transactions_user_id ON lpg_transactions(user_id);

-- Enable Row Level Security
ALTER TABLE lpg_transactions ENABLE ROW LEVEL SECURITY;

-- RLS Policies
-- Allow users to see their own transactions
CREATE POLICY "Users can view own transactions" ON lpg_transactions
  FOR SELECT USING (auth.uid() = user_id);

-- Allow users to insert their own transactions
CREATE POLICY "Users can insert own transactions" ON lpg_transactions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Allow users to update their own transactions
CREATE POLICY "Users can update own transactions" ON lpg_transactions
  FOR UPDATE USING (auth.uid() = user_id);

-- Allow users to delete their own transactions
CREATE POLICY "Users can delete own transactions" ON lpg_transactions
  FOR DELETE USING (auth.uid() = user_id);

-- Admin policy: Allow admins to see all transactions
CREATE POLICY "Admins can view all transactions" ON lpg_transactions
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_roles.user_id = auth.uid()
      AND user_roles.role = 'admin'
    )
  );
