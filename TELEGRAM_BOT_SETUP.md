# Telegram Bot Setup

Telegram botni Test Platformasi bilan integratsiya qilish uchun quyidagi qadamlarni bajaring:

## 1. Telegram Bot Yaratish

1. Telegram-da @BotFather botni qidiring
2. `/newbot` komandasini kirgizing
3. Bot uchun nom va username tanlang
4. Javobda siz olasiz: **Bot Token** (masalan: `123456789:ABCdefGHIjklmnoPQRstuvWXYZ`)

## 2. Environment Variables Qo'shish

Supabase dashboard-ga o'ting va `TELEGRAM_BOT_TOKEN` environment variable-sini qo'shing:

```
TELEGRAM_BOT_TOKEN=8030200264:AAEssUt280EmkoYrTTUV-SWfLYBjBxbDF7Q
```

## 3. Webhook URL Sozlash

Bot uchun webhook URL-ni qo'yish uchun quyidagi cURL komandasini bajaring (TOKEN o'rniga haqiqiy token qo'ying):

```bash
curl -X POST https://api.telegram.org/8030200264:AAEssUt280EmkoYrTTUV-SWfLYBjBxbDF7Q/setWebhook \
  -H "Content-Type: application/json" \
  -d '{"url":"https://YOUR-PROJECT.supabase.co/functions/v1/telegram_bot"}'
```

Yoki Telegram-da @BotFather bilan:

1. @BotFather bilan suhbat ochib, `/mybots` komandasini kirgizing
2. Sizning botni tanlang
3. `API Token` qo'yilgan webhook URL-ni sozlang
4. Webhook URL: `https://YOUR-PROJECT.supabase.co/functions/v1/telegram_bot`

## 4. Tekshirish

Telegram-da bot-ni qidiring va `/start` komandasini kirgizing. Bot sizni ro'yxatdan o'tkazadi va foydalanuvchi nomi/parol bilan javob beradi.

## Ishlash Jarayoni

1. Foydalanuvchi Telegram-da `/start` komandasini kirgizadi
2. Bot bazasida tekshiradi - foydalanuvchi mavjudmi?
3. Agar yo'q bo'lsa, yangi foydalanuvchi yaratadi:
   - **Username**: Telegram username yoki `user_<telegram_id>`
   - **Password**: `telegram_<telegram_id>`
4. Bot foydalanuvchiga login ma'lumotlarini yuboradi

## Bot Komandalari

- `/start` - Ro'yxatdan o'tish yoki mavjud hisob bilan tanishtirish
- Boshqa matnlar - Bot bu savolni bildiradi

## Xavfsizlik

- Paroller Telegram orqali yuboriladi, shuning uchun foydalanuvchilar ularni keyinroq o'zgartirishlari mumkin
- Har bir Telegram ID bitta bazada-user hisobiga mos keladi
- Service role key ishlatiladi, bu bazaga to'liq kirish beradi
