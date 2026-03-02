// ═══════════════════════════════════════════════════════════
// P'TRADERS — Hotmart Webhook Handler
// Supabase Edge Function
//
// Deploy with: supabase functions deploy hotmart-webhook
// Set secret:  supabase secrets set HOTMART_HOTTOK=your_hottok_here
// Set secret:  supabase secrets set SUPABASE_SERVICE_ROLE_KEY=your_key
//
// Hotmart Webhook URL: https://taxokgvwudsjkqgxxntx.supabase.co/functions/v1/hotmart-webhook
// ═══════════════════════════════════════════════════════════

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const HOTMART_HOTTOK = Deno.env.get("HOTMART_HOTTOK") || "";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, X-Hotmart-Hottok",
};

serve(async (req: Request) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  try {
    // 1. Verify Hotmart hottok (webhook authentication)
    const hottok = req.headers.get("x-hotmart-hottok");
    if (HOTMART_HOTTOK && hottok !== HOTMART_HOTTOK) {
      console.error("Invalid hottok received");
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // 2. Parse webhook payload
    const body = await req.json();
    const event = body.event;

    console.log(`Hotmart webhook event: ${event}`);

    // 3. Initialize Supabase client with service role (bypasses RLS)
    const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);

    // 4. Handle events
    switch (event) {
      case "PURCHASE_COMPLETE":
      case "PURCHASE_APPROVED": {
        const buyerEmail = body.data?.buyer?.email?.toLowerCase();
        const buyerName = body.data?.buyer?.name || "";
        const transaction = body.data?.purchase?.transaction || "";
        const product = body.data?.product?.name || "";

        if (!buyerEmail) {
          return new Response(JSON.stringify({ error: "No buyer email" }), {
            status: 400,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }

        // Check if this transaction already has a code
        const { data: existing } = await supabase
          .from("course_access")
          .select("access_code")
          .eq("hotmart_transaction", transaction)
          .single();

        if (existing) {
          console.log(`Transaction ${transaction} already has code: ${existing.access_code}`);
          return new Response(
            JSON.stringify({ success: true, code: existing.access_code }),
            {
              status: 200,
              headers: { ...corsHeaders, "Content-Type": "application/json" },
            }
          );
        }

        // Generate unique code using database function
        const { data: codeResult } = await supabase.rpc("generate_course_code");
        const accessCode = codeResult as string;

        // Insert new access record
        const { error: insertError } = await supabase
          .from("course_access")
          .insert({
            email: buyerEmail,
            access_code: accessCode,
            buyer_name: buyerName,
            hotmart_transaction: transaction,
            hotmart_product: product,
            active: true,
            notes: `Auto-generated via Hotmart webhook — ${event}`,
          });

        if (insertError) {
          console.error("Insert error:", insertError);
          return new Response(
            JSON.stringify({ error: "Failed to create access" }),
            {
              status: 500,
              headers: { ...corsHeaders, "Content-Type": "application/json" },
            }
          );
        }

        console.log(`Access code ${accessCode} created for ${buyerEmail} (tx: ${transaction})`);

        return new Response(
          JSON.stringify({ success: true, code: accessCode }),
          {
            status: 200,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }

      case "PURCHASE_REFUNDED":
      case "PURCHASE_CANCELED":
      case "PURCHASE_CHARGEBACK": {
        const transaction = body.data?.purchase?.transaction || "";
        const buyerEmail = body.data?.buyer?.email?.toLowerCase();

        if (transaction) {
          const { error: revokeError } = await supabase
            .from("course_access")
            .update({ active: false, revoked_at: new Date().toISOString() })
            .eq("hotmart_transaction", transaction);

          if (revokeError) {
            console.error("Revoke error:", revokeError);
          } else {
            console.log(`Access revoked for transaction: ${transaction}`);
          }
        } else if (buyerEmail) {
          // Fallback: revoke by email
          const { error: revokeError } = await supabase
            .from("course_access")
            .update({ active: false, revoked_at: new Date().toISOString() })
            .eq("email", buyerEmail)
            .neq("access_code", "XK7-PT26-9F3M"); // Don't revoke legacy code

          if (revokeError) {
            console.error("Revoke error:", revokeError);
          } else {
            console.log(`Access revoked for email: ${buyerEmail}`);
          }
        }

        return new Response(JSON.stringify({ success: true }), {
          status: 200,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      default:
        console.log(`Unhandled event: ${event}`);
        return new Response(JSON.stringify({ success: true, ignored: true }), {
          status: 200,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
    }
  } catch (err) {
    console.error("Webhook error:", err);
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
