require('dotenv').config();
const TelegramBot = require('node-telegram-bot-api');
const axios = require('axios');

const token = process.env.TELEGRAM_TOKEN;
const smsApiKey = process.env.SMS_API_KEY;
const adminId = process.env.ADMIN_ID;

if (!token || !smsApiKey || !adminId) {
  console.error("خطأ: تأكد من ضبط جميع الإعدادات في ملف الـ .env بشكل صحيح.");
  process.exit(1);
}

const bot = new TelegramBot(token, { polling: true });

console.log("سيرفر بوت SMS السودان يعمل الآن بنجاح ومربوط بموقع الأرقام...");

// عند إرسال أمر /start
bot.onText(/\/start/, async (msg) => {
  const chatId = msg.chat.id;
  const isOptionAdmin = chatId.toString() === adminId;

  if (isOptionAdmin) {
    const welcomeAdminMsg = 
      "مرحباً بك يا صابر في لوحة تحكم الأدمن الخاصة ببوت SMS السودان! 🇸🇩\n\n" +
      "الـ API الخاص بموقع الأرقام متصل وجاهز للعمل.\n\n" +
      "إليك الأوامر المتاحة لك كأدمن:\n" +
      "📊 /balance - لفحص رصيدك الحالي في موقع الأرقام.\n" +
      "📱 /services - لعرض الخدمات والأرقام المتوفرة.";
    
    bot.sendMessage(chatId, welcomeAdminMsg);
  } else {
    bot.sendMessage(chatId, "مرحباً بك في بوت SMS السودان المفتوح! 🇸🇩\nهذا البوت مخصص لتفعيل الحسابات واستقبال الأرقام.");
  }
});

// أمر فحص الرصيد من موقع الأرقام (خاص بالأدمن صابر)
bot.onText(/\/balance/, async (msg) => {
  const chatId = msg.chat.id;

  if (chatId.toString() !== adminId) {
    return bot.sendMessage(chatId, "عذراً، هذا الأمر مخصص لإدارة البوت فقط.");
  }

  bot.sendMessage(chatId, "⏳ جاري فحص رصيدك في موقع الأرقام...");

  try {
    // جلب الرصيد من موقع الأرقام (تأكد من تعديل رابط الـ API حسب توثيق الموقع الذي تستخدمه)
    // كمثال عام هنا نستخدم طلب GET الشائع لمواقع تزويد الأرقام (مثل sms-activate أو 5sim إلخ)
    const response = await axios.get(`https://api.sms-activate.org/steward.php?api_key=${smsApiKey}&action=getBalance`);
    
    // فحص النتيجة القادمة من السيرفر
    if (response.data) {
      bot.sendMessage(chatId, `💰 رصيدك الحالي في الموقع هو: ${response.data}`);
    } else {
      bot.sendMessage(chatId, "❌ فشل في قراءة الرصيد، يرجى التحقق من استجابة السيرفر.");
    }
  } catch (error) {
    console.error(error);
    bot.sendMessage(chatId, "❌ حدث خطأ أثناء الاتصال بموقع الأرقام. تأكد من صلاحية الـ API Key أو رابط السيرفر.");
  }
});

// أمر عرض الخدمات
bot.onText(/\/services/, (msg) => {
  const chatId = msg.chat.id;
  bot.sendMessage(chatId, "🛠️ قائمة الخدمات والأرقام المتوفرة سيتم ربطها وسحبها تلقائياً من موقع الأرقام في التحديث القادم.");
});

