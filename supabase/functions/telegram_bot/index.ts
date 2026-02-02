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

async function createSession(
  supabase: any,
  user_id: string,
  telegram_id: number,
  state: string = "idle"
): Promise<boolean> {
  try {
    const { error } = await supabase
      .from("user_sessions")
      .upsert(
        {
          user_id,
          telegram_id,
          session_state: state,
          last_activity: new Date().toISOString(),
        },
        { onConflict: "telegram_id" }
      );

    if (error) {
      console.error("Session error:", error);
      return false;
    }

    return true;
  } catch (error) {
    console.error("Error creating session:", error);
    return false;
  }
}

async function getSession(
  supabase: any,
  telegram_id: number
): Promise<any | null> {
  try {
    const { data, error } = await supabase
      .from("user_sessions")
      .select("*")
      .eq("telegram_id", telegram_id)
      .maybeSingle();

    if (error) {
      console.error("Get session error:", error);
      return null;
    }

    return data;
  } catch (error) {
    console.error("Error getting session:", error);
    return null;
  }
}

async function registerUser(
  supabase: any,
  telegram_id: number,
  username: string
): Promise<{ id: string } | null> {
  try {
    const userData = {
      username: username || `user_${telegram_id}`,
      password_hash: `pass_${Math.random().toString(36).substring(2, 15)}`,
      is_admin: false,
    };

    const { data, error } = await supabase
      .from("users")
      .insert([userData])
      .select("id");

    if (error) {
      console.error("Registration error:", error);
      return null;
    }

    if (!data || data.length === 0) {
      return null;
    }

    return data[0];
  } catch (error) {
    console.error("Error registering user:", error);
    return null;
  }
}

async function authenticateUser(
  supabase: any,
  username: string,
  password: string
): Promise<{ id: string; username: string } | null> {
  try {
    const { data, error } = await supabase
      .from("users")
      .select("id, username, password_hash")
      .eq("username", username)
      .maybeSingle();

    if (error || !data) {
      console.error("Auth error:", error);
      return null;
    }

    if (data.password_hash === password) {
      return { id: data.id, username: data.username };
    }

    return null;
  } catch (error) {
    console.error("Error authenticating:", error);
    return null;
  }
}

async function updatePassword(
  supabase: any,
  user_id: string,
  new_password: string
): Promise<boolean> {
  try {
    const { error } = await supabase
      .from("users")
      .update({ password_hash: new_password })
      .eq("id", user_id);

    if (error) {
      console.error("Password update error:", error);
      return false;
    }

    return true;
  } catch (error) {
    console.error("Error updating password:", error);
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
        const session = await getSession(supabase, message.from.id);

        if (session && session.user_id) {
          const { data: user } = await supabase
            .from("users")
            .select("username")
            .eq("id", session.user_id)
            .maybeSingle();

          const menu = `Salom ${first_name}!
Foydalanuvchi nomi: <b>${user?.username}</b>

<b>Menyular:</b>
/login - Login qilish
/password - Parolni o'zgartirish
/profile - Profilni ko'rish`;

          await sendTelegramMessage(chat_id, menu, TELEGRAM_TOKEN);
        } else {
          await createSession(supabase, null, message.from.id, "awaiting_registration");

          await sendTelegramMessage(
            chat_id,
            `Salom ${first_name}! Birinchi bo'lib ro'yxatdan o'tishingiz kerak.\n\nFoydalanuvchi nomini kiriting:`,
            TELEGRAM_TOKEN
          );
        }
      } else if (text === "/login") {
        const session = await getSession(supabase, message.from.id);

        if (session?.session_state === "awaiting_login_username") {
          await sendTelegramMessage(
            chat_id,
            `Parolni kiriting:`,
            TELEGRAM_TOKEN
          );
        } else {
          await createSession(supabase, session?.user_id, message.from.id, "awaiting_login_username");

          await sendTelegramMessage(
            chat_id,
            `Foydalanuvchi nomini kiriting:`,
            TELEGRAM_TOKEN
          );
        }
      } else if (text === "/password") {
        const session = await getSession(supabase, message.from.id);

        if (!session?.user_id) {
          await sendTelegramMessage(
            chat_id,
            `Avval /login orqali kirish kerak.`,
            TELEGRAM_TOKEN
          );
        } else {
          await createSession(supabase, session.user_id, message.from.id, "awaiting_old_password");

          await sendTelegramMessage(
            chat_id,
            `Eski parolni kiriting:`,
            TELEGRAM_TOKEN
          );
        }
      } else if (text === "/profile") {
        const session = await getSession(supabase, message.from.id);

        if (session?.user_id) {
          const { data: user } = await supabase
            .from("users")
            .select("username, created_at")
            .eq("id", session.user_id)
            .maybeSingle();

          if (user) {
            await sendTelegramMessage(
              chat_id,
              `<b>Profil Ma'lumotlari</b>\n\nFoydalanuvchi nomi: <b>${user.username}</b>\nQo'shilgan sana: ${new Date(user.created_at).toLocaleDateString('uz-UZ')}`,
              TELEGRAM_TOKEN
            );
          }
        } else {
          await sendTelegramMessage(
            chat_id,
            `Avval /login orqali kirish kerak.`,
            TELEGRAM_TOKEN
          );
        }
      } else {
        const session = await getSession(supabase, message.from.id);

        if (!session) {
          await createSession(supabase, null, message.from.id, "awaiting_registration");
          await sendTelegramMessage(
            chat_id,
            `Foydalanuvchi nomini kiriting:`,
            TELEGRAM_TOKEN
          );
        } else if (session.session_state === "awaiting_registration") {
          const registered = await registerUser(supabase, message.from.id, text);

          if (registered) {
            await createSession(supabase, registered.id, message.from.id, "idle");

            const { data: user } = await supabase
              .from("users")
              .select("password_hash")
              .eq("id", registered.id)
              .maybeSingle();

            await sendTelegramMessage(
              chat_id,
              `Salom ${first_name}! Ro'yxatdan muvaffaqiyatli o'tdingiz!\n\nFoydalanuvchi nomi: <b>${text}</b>\nParol: <b>${user?.password_hash}</b>\n\n/login - Login qilish\n/password - Parolni o'zgartirish`,
              TELEGRAM_TOKEN
            );
          } else {
            await sendTelegramMessage(
              chat_id,
              `Kechirasiz, xatolik yuz berdi. Boshqa foydalanuvchi nomi kiriting:`,
              TELEGRAM_TOKEN
            );
          }
        } else if (session.session_state === "awaiting_login_username") {
          await createSession(supabase, session.user_id, message.from.id, "awaiting_login_password");

          const userData = { username: text };
          await sendTelegramMessage(
            chat_id,
            `Parolni kiriting:`,
            TELEGRAM_TOKEN
          );
        } else if (session.session_state === "awaiting_login_password") {
          const auth = await authenticateUser(supabase, session.awaiting_username || text, text);

          if (auth) {
            await createSession(supabase, auth.id, message.from.id, "idle");

            await sendTelegramMessage(
              chat_id,
              `Salom! Muvaffaqiyatli kirdingiz.\n\n/login - Login qilish\n/password - Parolni o'zgartirish\n/profile - Profil`,
              TELEGRAM_TOKEN
            );
          } else {
            await sendTelegramMessage(
              chat_id,
              `Foydalanuvchi nomi yoki parol noto'g'ri. Qayta urinib ko'ring: /login`,
              TELEGRAM_TOKEN
            );

            await createSession(supabase, session.user_id, message.from.id, "idle");
          }
        } else if (session.session_state === "awaiting_old_password") {
          const { data: user } = await supabase
            .from("users")
            .select("password_hash")
            .eq("id", session.user_id)
            .maybeSingle();

          if (user?.password_hash === text) {
            await createSession(supabase, session.user_id, message.from.id, "awaiting_new_password");

            await sendTelegramMessage(
              chat_id,
              `Yangi parolni kiriting:`,
              TELEGRAM_TOKEN
            );
          } else {
            await sendTelegramMessage(
              chat_id,
              `Parol noto'g'ri. Qayta urinib ko'ring: /password`,
              TELEGRAM_TOKEN
            );

            await createSession(supabase, session.user_id, message.from.id, "idle");
          }
        } else if (session.session_state === "awaiting_new_password") {
          const updated = await updatePassword(supabase, session.user_id, text);

          if (updated) {
            await createSession(supabase, session.user_id, message.from.id, "idle");

            await sendTelegramMessage(
              chat_id,
              `Parol muvaffaqiyatli o'zgartirildi! Yangi parol: <b>${text}</b>`,
              TELEGRAM_TOKEN
            );
          } else {
            await sendTelegramMessage(
              chat_id,
              `Xatolik yuz berdi. Qayta urinib ko'ring: /password`,
              TELEGRAM_TOKEN
            );
          }
        } else {
          await sendTelegramMessage(
            chat_id,
            `Qabul qilaman!\n\n/login - Login qilish\n/password - Parolni o'zgartirish\n/profile - Profil`,
            TELEGRAM_TOKEN
          );
        }
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
