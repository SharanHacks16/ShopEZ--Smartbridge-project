import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const results: string[] = [];

    // Check if users already exist
    const { data: existingProfiles } = await supabaseAdmin
      .from("profiles")
      .select("email")
      .in("email", ["admin@shopez.com", "user@shopez.com"]);

    const existingEmails = existingProfiles?.map((p: { email: string }) => p.email) ?? [];

    // Create admin user
    if (!existingEmails.includes("admin@shopez.com")) {
      const { data: adminData, error: adminErr } = await supabaseAdmin.auth.admin.createUser({
        email: "admin@shopez.com",
        password: "Admin@123",
        email_confirm: true,
      });

      if (!adminErr && adminData.user) {
        await supabaseAdmin.from("profiles").upsert({
          id: adminData.user.id,
          name: "Admin User",
          email: "admin@shopez.com",
          role: "admin",
          wallet_balance: 100000,
          is_active: true,
        });
        await supabaseAdmin.from("portfolios").upsert({
          user_id: adminData.user.id,
          holdings: [],
          wallet_balance: 100000,
          total_investment: 0,
          current_value: 0,
          profit_loss: 0,
        });
        results.push("admin created");
      } else if (adminErr) {
        results.push(`admin error: ${adminErr.message}`);
      }
    } else {
      results.push("admin already exists");
    }

    // Create demo user
    if (!existingEmails.includes("user@shopez.com")) {
      const { data: userData, error: userErr } = await supabaseAdmin.auth.admin.createUser({
        email: "user@shopez.com",
        password: "User@123",
        email_confirm: true,
      });

      if (!userErr && userData.user) {
        await supabaseAdmin.from("profiles").upsert({
          id: userData.user.id,
          name: "Demo Trader",
          email: "user@shopez.com",
          role: "user",
          wallet_balance: 85000,
          is_active: true,
        });

        // Get stocks for demo holdings
        const { data: stocks } = await supabaseAdmin
          .from("stocks")
          .select("id, symbol, company_name, current_price")
          .limit(5);

        const holdings = [];
        const txns = [];

        if (stocks && stocks.length > 0) {
          for (const stock of stocks.slice(0, 3)) {
            const qty = Math.floor(Math.random() * 15) + 5;
            const avgPrice = parseFloat((stock.current_price * (0.92 + Math.random() * 0.10)).toFixed(2));
            holdings.push({
              stock_id: stock.id,
              symbol: stock.symbol,
              company_name: stock.company_name,
              quantity: qty,
              avg_price: avgPrice,
            });
            txns.push({
              user_id: userData.user.id,
              stock_id: stock.id,
              stock_symbol: stock.symbol,
              buy_or_sell: "buy",
              quantity: qty,
              price: avgPrice,
              total_amount: parseFloat((avgPrice * qty).toFixed(2)),
              status: "completed",
            });
          }
        }

        const invested = holdings.reduce((s: number, h: { avg_price: number; quantity: number }) => s + h.avg_price * h.quantity, 0);

        await supabaseAdmin.from("portfolios").upsert({
          user_id: userData.user.id,
          holdings,
          wallet_balance: 85000,
          total_investment: parseFloat(invested.toFixed(2)),
          current_value: parseFloat(invested.toFixed(2)),
          profit_loss: 0,
        });

        if (txns.length > 0) {
          await supabaseAdmin.from("transactions").insert(txns);
        }

        results.push("demo user created with portfolio");
      } else if (userErr) {
        results.push(`user error: ${userErr.message}`);
      }
    } else {
      results.push("demo user already exists");
    }

    return new Response(
      JSON.stringify({ success: true, results }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    return new Response(
      JSON.stringify({ error: (err as Error).message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
