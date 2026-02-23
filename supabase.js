// تأكد أن المكتبة تم تحميلها
if (!window.supabase) {
  console.error("Supabase library failed to load");
}

// بيانات مشروعك
const supabaseUrl = "https://vmxbedovoahuggfpcmyk.supabase.co";
const supabaseKey = "sb_publishable_y-bZryAIeagBLR0Kg0mw2Q_YwpmadhU";

// إنشاء العميل
window.supabaseClient = window.supabase.createClient(
  supabaseUrl,
  supabaseKey
);

console.log("Supabase Client Ready:", window.supabaseClient);
