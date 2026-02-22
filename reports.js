async function loadDailyReport(){

let today = new Date().toISOString().split("T")[0];

const { data } = await supabase
.from("sales")
.select("*")
.gte("created_at", today);

let total = 0;
let profit = 0;

data.forEach(s=>{
total += Number(s.total);
profit += Number(s.profit);
});

document.getElementById("dailySales").innerText = total;
document.getElementById("dailyProfit").innerText = profit;
document.getElementById("invoiceCount").innerText = data.length;
}

async function loadChart(){

const { data } = await supabase
.from("sales")
.select("total, created_at")
.order("created_at");

let labels = [];
let totals = [];

data.forEach(s=>{
labels.push(new Date(s.created_at).toLocaleDateString());
totals.push(Number(s.total));
});

new Chart(document.getElementById("salesChart"), {
type: "line",
data: {
labels: labels,
datasets: [{
label: "المبيعات",
data: totals,
borderWidth: 2
}]
}
});
}

async function loadTopProducts(){

const { data } = await supabase
.from("sale_items")
.select("product_id, quantity")
.order("quantity", { ascending: false })
.limit(5);

let html = "";

data.forEach(p=>{
html += `<div>منتج ID: ${p.product_id} - الكمية: ${p.quantity}</div>`;
});

document.getElementById("topProducts").innerHTML = html;
}

loadDailyReport();
loadChart();
loadTopProducts();