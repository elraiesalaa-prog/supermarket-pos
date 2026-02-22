async function addProduct() {

const product = {
name: document.getElementById("name").value,
barcode: document.getElementById("barcode").value,
cost_price: Number(document.getElementById("cost_price").value),
price: Number(document.getElementById("price").value),
stock: Number(document.getElementById("stock").value),
min_stock: Number(document.getElementById("min_stock").value)
};

const { error } = await supabase.from("products").insert([product]);

if (error) {
alert("خطأ في الإضافة");
} else {
alert("تمت الإضافة");
loadProducts();
}
}

async function loadProducts() {

const { data } = await supabase.from("products").select("*");

const tbody = document.querySelector("#productsTable tbody");
tbody.innerHTML = "";

data.forEach(product => {

const lowStock = product.stock <= product.min_stock
? "⚠ منخفض"
: "جيد";

const row = `
<tr>
<td>${product.name}</td>
<td>${product.price}</td>
<td>${product.stock}</td>
<td>${lowStock}</td>
<td><button onclick="deleteProduct('${product.id}')">حذف</button></td>
</tr>
`;

tbody.innerHTML += row;
});
}

async function deleteProduct(id) {
await supabase.from("products").delete().eq("id", id);
loadProducts();
}

loadProducts();