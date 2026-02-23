// ======================
// تسجيل الدخول
// ======================
async function login() {

  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;

  if (!email || !password) {
    alert("يرجى إدخال البريد وكلمة المرور");
    return;
  }

  const { data, error } =
    await window.supabaseClient.auth.signInWithPassword({
      email: email,
      password: password
    });

  if (error) {
    alert(error.message);
    return;
  }

  checkUserRole();
}


// ======================
// التحقق من الدور
// ======================
async function checkUserRole() {

  const { data: { user }, error } =
    await window.supabaseClient.auth.getUser();

  if (error || !user) {
    alert("فشل في جلب المستخدم");
    return;
  }

  const { data: profile, error: profileError } =
    await window.supabaseClient
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

  if (profileError || !profile) {
    alert("لا يوجد دور للمستخدم");
    return;
  }

  localStorage.setItem("role", profile.role);

  if (profile.role === "cashier") {
    window.location.href = "pos.html";
  }

  if (profile.role === "manager" || profile.role === "admin") {
    window.location.href = "dashboard.html";
  }

  if (profile.role === "storekeeper") {
    window.location.href = "inventory.html";
  }
}


// ======================
// تسجيل الخروج
// ======================
async function logout() {
  await window.supabaseClient.auth.signOut();
  localStorage.clear();
  window.location.href = "index.html";
}


// ======================
// حماية الصفحات
// ======================
function protectPage(allowedRoles) {

  const role = localStorage.getItem("role");

  if (!allowedRoles.includes(role)) {
    alert("غير مصرح بالدخول");
    window.location.href = "dashboard.html";
  }
}
