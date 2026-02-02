import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2.57.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

interface TelegramMessage {
  update_id: number;
  message: {
    message_id: number;
    from: {
      id: number;
      is_bot: boolean;
      first_name: string;
      username: string;
      language_code: string;
    };
    chat: {
      id: number;
      first_name: string;
      username: string;
      type: string;
    };
    date: number;
    text: string;
  };
}

async function sendTelegramMessage(chat_id: number, text: string, token: string) {
  const url = `https://api.telegram.org/bot${token}/sendMessage`;
  await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      chat_id,
      text,
      parse_mode: "HTML",
    }),
  });
}

async function registerUser(
  supabase: any,
  telegram_id: number,
  username: string,
  first_name: string
): Promise<boolean> {
  try {
    const userData = {
      username: username || `user_${telegram_id}`,
      password_hash: `telegram_${telegram_id}`,
      is_admin: false,
    };

    const { data, error } = await supabase
      .from("users")
      .insert([userData])
      .select();

    if (error) {
      console.error("Registration error:", error);
      return false;
    }

    return !!data && data.length > 0;
  } catch (error) {
    console.error("Error registering user:", error);
    return false;
  }
}

async function checkUserExists(
  supabase: any,
  username: string
): Promise<boolean> {
  try {
    const { data, error } = await supabase
      .from("users")
      .select("id")
      .eq("username", username)
      .maybeSingle();

    if (error) {
      console.error("Check user error:", error);
      return false;
    }

    return !!data;
  } catch (error) {
    console.error("Error checking user:", error);
    return false;
  }
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const TELEGRAM_TOKEN = Deno.env.get("TELEGRAM_BOT_TOKEN");
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (!TELEGRAM_TOKEN || !SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
      return new Response(
        JSON.stringify({
          error: "Missing environment variables",
        }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    if (req.method === "POST") {
      const body: TelegramMessage = await req.json();

      if (!body.message || !body.message.text) {
        return new Response(
          JSON.stringify({ ok: true }),
          {
            status: 200,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }

      const message = body.message;
      const chat_id = message.chat.id;
      const text = message.text.trim();
      const username = message.from.username || `user_${message.from.id}`;
      const first_name = message.from.first_name;

      if (text === "/start") {
        const exists = await checkUserExists(supabase, username);

        if (exists) {
          await sendTelegramMessage(
            chat_id,
            `Salom ${first_name}! Siz allaqachon ro'yxatdan o'tkansiz. Platforma: <a href="https://example.com">Test Platformasi</a>`,
            TELEGRAM_TOKEN
          );
        } else {
          const registered = await registerUser(
            supabase,
            message.from.id,
            username,
            first_name
          );

          if (registered) {
            await sendTelegramMessage(
              chat_id,
              `Salom ${first_name}! Siz ro'yxatdan muvaffaqiyatli o'tdingiz!\n\nFoydalanuvchi nomi: ${username}\nParol: telegram_${message.from.id}\n\nPlatformaga kiring: <a href="https://example.com">Test Platformasi</a>`,
              TELEGRAM_TOKEN
            );
          } else {
            await sendTelegramMessage(
              chat_id,
              `Kechirasiz, ro'yxatdan o'tishda xatolik yuz berdi. Iltimos keyinroq urinib ko'ring.`,
              TELEGRAM_TOKEN
            );
          }
        }
      } else {
        await sendTelegramMessage(
          chat_id,
          `Qabul qilaman! Ro'yxatdan o'tish uchun /start komandasini kirgizing.`,
          TELEGRAM_TOKEN
        );
      }

      return new Response(
        JSON.stringify({ ok: true }),
        {
          status: 200,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    return new Response(
      JSON.stringify({ error: "Method not allowed" }),
      {
        status: 405,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Webhook error:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
