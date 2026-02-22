// ===============================
// POS SYSTEM - COMPLETE VERSION
// ===============================

// Variables
let cart = [];
let total = 0;
let profit = 0;

// ===============================
// LOAD PRODUCTS
// ===============================
async function loadProducts() {

const { data, error } = await supabase
.from("products")
.select("*");

if(error){
console.log(error);
return;
}

const container = document.getElementById("productsContainer");
container.innerHTML = "";

data.forEach(product => {

container.innerHTML += `
<div class="product-card">
<h4>${product.name}</h4>
<p>السعر: ${product.price}</p>
<p>المخزون: ${product.stock}</p>
<button onclick='addToCart(${JSON.stringify(product)})'>
إضافة
</button>
</div>
`;

});
}

// ===============================
// ADD TO CART
// ===============================
function addToCart(product){

if(product.stock <= 0){
alert("المنتج غير متوفر");
return;
}

cart.push(product);

total += Number(product.price);
profit += (Number(product.price) - Number(product.cost));

updateCart();
}

// ===============================
// UPDATE CART UI
// ===============================
function updateCart(){

const cartDiv = document.getElementById("cartItems");
cartDiv.innerHTML = "";

cart.forEach(item=>{
cartDiv.innerHTML += `
<div>
${item.name} - ${item.price}
</div>
`;
});

document.getElementById("totalAmount").innerText = total.toFixed(2);
}

// ===============================
// LOAD CUSTOMERS IN POS
// ===============================
async function loadCustomersPOS(){

const { data, error } = await supabase
.from("customers")
.select("*");

if(error) return;

const select = document.getElementById("customerSelect");
select.innerHTML = `<option value="">عميل نقدي</option>`;

data.forEach(c=>{
select.innerHTML += `
<option value="${c.id}">
${c.name} (${c.points} نقطة)
</option>
`;
});
}

// ===============================
// USE LOYALTY POINTS
// ===============================
async function usePoints(){

let customerId = document.getElementById("customerSelect").value;

if(!customerId){
alert("اختر عميل أولاً");
return;
}

const { data: customer, error } = await supabase
.from("customers")
.select("*")
.eq("id", customerId)
.single();

if(error) return;

if(customer.points <= 0){
alert("لا توجد نقاط");
return;
}

// الخصم = عدد النقاط
let discount = customer.points;

total -= discount;

if(total < 0) total = 0;

// تصفير النقاط
await supabase
.from("customers")
.update({ points: 0 })
.eq("id", customerId);

updateCart();
alert("تم استخدام النقاط");
}

// ===============================
// CHECKOUT
// ===============================
// ==========================
// CREATE ACCOUNTING ENTRY
// ==========================

// الحصول على الحسابات
const { data: cashAccount } = await supabase
.from("chart_of_accounts")
.select("id")
.eq("code","1000")
.single();

const { data: salesAccount } = await supabase
.from("chart_of_accounts")
.select("id")
.eq("code","4000")
.single();

const { data: cogsAccount } = await supabase
.from("chart_of_accounts")
.select("id")
.eq("code","5000")
.single();

const { data: inventoryAccount } = await supabase
.from("chart_of_accounts")
.select("id")
.eq("code","1300")
.single();

// إنشاء قيد
const { data: entry } = await supabase
.from("journal_entries")
.insert([{
description: "فاتورة بيع رقم " + sale.id
}])
.select()
.single();

// مدين: الصندوق
await supabase.from("journal_lines").insert([{
entry_id: entry.id,
account_id: cashAccount.id,
debit: total,
credit: 0
}]);

// دائن: المبيعات
await supabase.from("journal_lines").insert([{
entry_id: entry.id,
account_id: salesAccount.id,
debit: 0,
credit: total
}]);

// مدين: تكلفة البضاعة
await supabase.from("journal_lines").insert([{
entry_id: entry.id,
account_id: cogsAccount.id,
debit: profit,
credit: 0
}]);

// دائن: المخزون
await supabase.from("journal_lines").insert([{
entry_id: entry.id,
account_id: inventoryAccount.id,
debit: 0,
credit: profit
}]);

// إنشاء الفاتورة
const { data: sale, error } = await supabase
.from("sales")
.insert([{
total: total,
profit: profit,
payment_method: method,
customer_id: customerId || null
}])
.select()
.single();

if(error){
alert("خطأ في البيع");
return;
}

// إضافة عناصر الفاتورة
for (let item of cart) {

await supabase
.from("sale_items")
.insert([{
sale_id: sale.id,
product_id: item.id,
quantity: 1,
price: item.price
}]);

}

// إضافة نقاط
if(customerId){

let earnedPoints = Math.floor(total / 10); // 1 نقطة لكل 10 عملة

const { data: customer } = await supabase
.from("customers")
.select("points")
.eq("id", customerId)
.single();

await supabase
.from("customers")
.update({
points: customer.points + earnedPoints
})
.eq("id", customerId);
}

// إعادة التعيين
alert("تمت عملية البيع بنجاح");

cart = [];
total = 0;
profit = 0;

updateCart();
loadProducts();
loadCustomersPOS();
}
async function requestLocalPayment(){

if(cart.length === 0){
alert("السلة فارغة");
return;
}

let reference = prompt("أدخل رقم التحويل أو رقم العملية:");

if(!reference){
alert("يجب إدخال رقم العملية");
return;
}

const paymentData = {
sale_temp: {
cart: cart,
total: total,
profit: profit,
customer_id: document.getElementById("customerSelect").value || null
},
amount: total,
reference: reference,
status: "pending"
};

const { error } = await supabase
.from("payments")
.insert([paymentData]);

if(error){
alert("حدث خطأ");
}else{
alert("تم إرسال الطلب للإدارة للمراجعة");

cart=[];
total=0;
profit=0;
updateCart();
}
}