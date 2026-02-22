let notificationCount = 0;

async function loadPayments(){

const { data } = await supabase
.from("payments")
.select("*")
.eq("status","pending");

renderPayments(data);
}

function renderPayments(data){

let container = document.getElementById("paymentsList");
container.innerHTML = "";

data.forEach(p=>{

container.innerHTML += `
<div style="border:1px solid #ccc;padding:10px;margin:10px;">
المبلغ: ${p.amount}<br>
رقم العملية: ${p.reference}<br>
<button onclick="approvePayment('${p.id}')">تأكيد</button>
<button onclick="rejectPayment('${p.id}')">رفض</button>
</div>
`;

});
}

// ============================
// REALTIME LISTENER
// ============================

supabase
.channel('payments-channel')
.on(
'postgres_changes',
{
event: 'INSERT',
schema: 'public',
table: 'payments'
},
(payload) => {

if(payload.new.status === "pending"){

notificationCount++;

document.getElementById("notificationCount").innerText = notificationCount;

// تشغيل صوت
document.getElementById("alertSound").play();

// تحميل جديد
loadPayments();

alert("طلب دفع جديد 🚨");
}

}
)
.subscribe();

// ============================

async function approvePayment(id){

const { data: payment } = await supabase
.from("payments")
.select("*")
.eq("id", id)
.single();

let sale = payment.sale_temp;

const { data: newSale } = await supabase
.from("sales")
.insert([{
total: sale.total,
profit: sale.profit,
payment_method: "local_transfer",
customer_id: sale.customer_id
}])
.select()
.single();

for(let item of sale.cart){

await supabase
.from("products")
.update({ stock: item.stock - 1 })
.eq("id", item.id);

await supabase
.from("sale_items")
.insert([{
sale_id: newSale.id,
product_id: item.id,
quantity: 1,
price: item.price
}]);
}

await supabase
.from("payments")
.update({ status: "approved" })
.eq("id", id);

alert("تم اعتماد الدفع");
loadPayments();
}

async function rejectPayment(id){

await supabase
.from("payments")
.update({ status: "rejected" })
.eq("id", id);

alert("تم الرفض");
loadPayments();
}

loadPayments();