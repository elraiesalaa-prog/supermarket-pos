async function login() {

const { data, error } = await supabase.auth.signInWithPassword({
email: document.getElementById("email").value,
password: document.getElementById("password").value
});

if (error) {
alert("خطأ في تسجيل الدخول");
return;
}

checkUserRole();
}

async function checkUserRole(){

const { data: { user } } = await supabase.auth.getUser();

const { data: profile } = await supabase
.from("profiles")
.select("role")
.eq("id", user.id)
.single();

if(!profile){
alert("لا يوجد دور للمستخدم");
return;
}

localStorage.setItem("role", profile.role);

if(profile.role === "cashier"){
location = "pos.html";
}

if(profile.role === "manager" || profile.role === "admin"){
location = "dashboard.html";
}

if(profile.role === "storekeeper"){
location = "inventory.html";
}
}

async function logout(){
await supabase.auth.signOut();
localStorage.clear();
location = "index.html";
}

function protectPage(allowedRoles){

const role = localStorage.getItem("role");

if(!allowedRoles.includes(role)){
alert("غير مصرح بالدخول");
location = "dashboard.html";
}
}