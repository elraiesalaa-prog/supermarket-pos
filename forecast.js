async function calculateForecast(){

const { data: products } = await supabase
.from("products")
.select("*");

for(let product of products){

// نحسب عدد المبيعات آخر 30 يوم
let lastMonth = new Date();
lastMonth.setDate(lastMonth.getDate() - 30);

const { data: sales } = await supabase
.from("sale_items")
.select("quantity, sales(created_at)")
.eq("product_id", product.id)
.gte("sales.created_at", lastMonth.toISOString());

let totalSold = 0;

sales.forEach(s=>{
totalSold += Number(s.quantity);
});

let avgDaily = totalSold / 30;
let daysLeft = avgDaily > 0 ? (product.stock / avgDaily) : 999;
let suggested = avgDaily > 0 ? Math.ceil(avgDaily * 7 - product.stock) : 0;

await supabase
.from("products")
.update({
avg_daily_sales: avgDaily,
days_left: daysLeft,
suggested_reorder: suggested > 0 ? suggested : 0
})
.eq("id", product.id);
}

loadCriticalStock();
}

async function loadCriticalStock(){

const { data } = await supabase
.from("products")
.select("*")
.lte("days_left", 5)
.order("days_left", { ascending: true });

let html = "";

data.forEach(p=>{
html += `
<div style="background:#fff3cd;padding:10px;margin:5px;border-radius:5px;">
<strong>${p.name}</strong><br>
المخزون: ${p.stock}<br>
الأيام المتبقية: ${p.days_left.toFixed(1)}<br>
اقترح طلب: ${p.suggested_reorder}
</div>
`;
});

document.getElementById("criticalStock").innerHTML = html;
}