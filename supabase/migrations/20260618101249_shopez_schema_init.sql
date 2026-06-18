/*
# ShopEZ Schema Initialization

1. Overview
   ShopEZ is a stock trading simulation platform. This migration creates the full schema:
   - `profiles`: user profile data (name, role, avatar, wallet balance, active flag)
   - `stocks`: traded stocks market data (symbol, price, history, sector, etc.)
   - `portfolios`: per-user portfolio (holdings as JSONB, wallet balance, totals)
   - `transactions`: buy/sell trade orders (user, stock, quantity, price, status, type)

2. Tables
   - profiles(id uuid PK → auth.users, name, role, avatar_url, wallet_balance, is_active, created_at)
   - stocks(id uuid PK, symbol unique, company_name, current_price, previous_close, market_cap, sector, description, logo_url, daily_high, daily_low, volume, history JSONB, updated_at)
   - portfolios(id uuid PK, user_id → profiles, holdings JSONB, wallet_balance, total_investment, current_value, profit_loss, updated_at)
   - transactions(id uuid PK, user_id → profiles, stock_id → stocks, buy_or_sell, quantity, price, total_amount, status, created_at)

3. Security
   - RLS enabled on all tables.
   - Profiles: users read/update own profile; admins read all; service role bypasses.
   - Stocks: all authenticated can read; only admins can write.
   - Portfolios: users CRUD own portfolios; admins read all.
   - Transactions: users read/insert own; admins read all + update status.
*/

-- PROFILES TABLE
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name text NOT NULL,
  email text NOT NULL,
  role text NOT NULL DEFAULT 'user' CHECK (role IN ('user', 'admin')),
  avatar_url text,
  wallet_balance numeric(18,2) NOT NULL DEFAULT 100000.00,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "profiles_read_own_or_admin" ON profiles;
CREATE POLICY "profiles_read_own_or_admin"
ON profiles FOR SELECT TO authenticated
USING (auth.uid() = id OR EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'admin'));

DROP POLICY IF EXISTS "profiles_insert_own" ON profiles;
CREATE POLICY "profiles_insert_own"
ON profiles FOR INSERT TO authenticated
WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "profiles_update_own" ON profiles;
CREATE POLICY "profiles_update_own"
ON profiles FOR UPDATE TO authenticated
USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "profiles_admin_update" ON profiles;
CREATE POLICY "profiles_admin_update"
ON profiles FOR UPDATE TO authenticated
USING (EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'admin'))
WITH CHECK (EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'admin'));

DROP POLICY IF EXISTS "profiles_admin_delete" ON profiles;
CREATE POLICY "profiles_admin_delete"
ON profiles FOR DELETE TO authenticated
USING (EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'admin'));

-- STOCKS TABLE
CREATE TABLE IF NOT EXISTS stocks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  symbol text UNIQUE NOT NULL,
  company_name text NOT NULL,
  current_price numeric(18,2) NOT NULL,
  previous_close numeric(18,2) NOT NULL,
  market_cap numeric(24,2) NOT NULL DEFAULT 0,
  sector text NOT NULL,
  description text DEFAULT '',
  logo_url text DEFAULT '',
  daily_high numeric(18,2) NOT NULL DEFAULT 0,
  daily_low numeric(18,2) NOT NULL DEFAULT 0,
  volume bigint NOT NULL DEFAULT 0,
  history jsonb NOT NULL DEFAULT '[]'::jsonb,
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE stocks ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "stocks_read_all" ON stocks;
CREATE POLICY "stocks_read_all"
ON stocks FOR SELECT TO authenticated
USING (true);

DROP POLICY IF EXISTS "stocks_admin_insert" ON stocks;
CREATE POLICY "stocks_admin_insert"
ON stocks FOR INSERT TO authenticated
WITH CHECK (EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'admin'));

DROP POLICY IF EXISTS "stocks_admin_update" ON stocks;
CREATE POLICY "stocks_admin_update"
ON stocks FOR UPDATE TO authenticated
USING (EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'admin'))
WITH CHECK (EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'admin'));

DROP POLICY IF EXISTS "stocks_admin_delete" ON stocks;
CREATE POLICY "stocks_admin_delete"
ON stocks FOR DELETE TO authenticated
USING (EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'admin'));

-- PORTFOLIOS TABLE
CREATE TABLE IF NOT EXISTS portfolios (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  holdings jsonb NOT NULL DEFAULT '[]'::jsonb,
  wallet_balance numeric(18,2) NOT NULL DEFAULT 100000.00,
  total_investment numeric(18,2) NOT NULL DEFAULT 0,
  current_value numeric(18,2) NOT NULL DEFAULT 0,
  profit_loss numeric(18,2) NOT NULL DEFAULT 0,
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE portfolios ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "portfolios_read_own_or_admin" ON portfolios;
CREATE POLICY "portfolios_read_own_or_admin"
ON portfolios FOR SELECT TO authenticated
USING (user_id = auth.uid() OR EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'admin'));

DROP POLICY IF EXISTS "portfolios_insert_own" ON portfolios;
CREATE POLICY "portfolios_insert_own"
ON portfolios FOR INSERT TO authenticated
WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "portfolios_update_own" ON portfolios;
CREATE POLICY "portfolios_update_own"
ON portfolios FOR UPDATE TO authenticated
USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "portfolios_delete_own" ON portfolios;
CREATE POLICY "portfolios_delete_own"
ON portfolios FOR DELETE TO authenticated
USING (user_id = auth.uid());

-- TRANSACTIONS TABLE
CREATE TABLE IF NOT EXISTS transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  stock_id uuid NOT NULL REFERENCES stocks(id) ON DELETE CASCADE,
  stock_symbol text NOT NULL,
  buy_or_sell text NOT NULL CHECK (buy_or_sell IN ('buy', 'sell')),
  quantity integer NOT NULL CHECK (quantity > 0),
  price numeric(18,2) NOT NULL CHECK (price >= 0),
  total_amount numeric(18,2) NOT NULL CHECK (total_amount >= 0),
  status text NOT NULL DEFAULT 'completed' CHECK (status IN ('pending', 'completed', 'rejected')),
  created_at timestamptz DEFAULT now()
);

ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "transactions_read_own_or_admin" ON transactions;
CREATE POLICY "transactions_read_own_or_admin"
ON transactions FOR SELECT TO authenticated
USING (user_id = auth.uid() OR EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'admin'));

DROP POLICY IF EXISTS "transactions_insert_own" ON transactions;
CREATE POLICY "transactions_insert_own"
ON transactions FOR INSERT TO authenticated
WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "transactions_update_own" ON transactions;
CREATE POLICY "transactions_update_own"
ON transactions FOR UPDATE TO authenticated
USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "transactions_admin_update" ON transactions;
CREATE POLICY "transactions_admin_update"
ON transactions FOR UPDATE TO authenticated
USING (EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'admin'))
WITH CHECK (EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'admin'));

DROP POLICY IF EXISTS "transactions_admin_delete" ON transactions;
CREATE POLICY "transactions_admin_delete"
ON transactions FOR DELETE TO authenticated
USING (EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'admin'));

-- INDEXES for performance
CREATE INDEX IF NOT EXISTS idx_stocks_symbol ON stocks (symbol);
CREATE INDEX IF NOT EXISTS idx_stocks_sector ON stocks (sector);
CREATE INDEX IF NOT EXISTS idx_transactions_user ON transactions (user_id);
CREATE INDEX IF NOT EXISTS idx_transactions_stock ON transactions (stock_id);
CREATE INDEX IF NOT EXISTS idx_transactions_created ON transactions (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_portfolios_user ON portfolios (user_id);
