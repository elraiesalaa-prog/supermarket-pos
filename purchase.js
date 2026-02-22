// ============================================
// PURCHASE MODULE (WITH APPROVAL SYSTEM)
// ============================================

let purchaseItems = [];
let total = 0;

// ============================================
// LOAD SUPPLIERS & PRODUCTS
// ============================================
async function loadData() {

    const { data: suppliers } = await supabase
        .from("suppliers")
        .select("*")
        .order("name");

    const { data: products } = await supabase
        .from("products")
        .select("*")
        .order("name");

    const supplierSelect = document.getElementById("supplierSelect");
    const productSelect = document.getElementById("productSelect");

    supplierSelect.innerHTML = "";
    productSelect.innerHTML = "";

    suppliers.forEach(s => {
        supplierSelect.innerHTML += `
            <option value="${s.id}">
                ${s.name} (رصيد: ${s.balance || 0})
            </option>
        `;
    });

    products.forEach(p => {
        productSelect.innerHTML += `
            <option value="${p.id}">
                ${p.name} (مخزون حالي: ${p.stock})
            </option>
        `;
    });
}

// ============================================
// ADD ITEM TO LIST
// ============================================
function addItem() {

    const productId = document.getElementById("productSelect").value;
    const quantity = Number(document.getElementById("quantity").value);
    const cost = Number(document.getElementById("cost").value);

    if (!productId || quantity <= 0 || cost <= 0) {
        alert("الرجاء إدخال بيانات صحيحة");
        return;
    }

    purchaseItems.push({
        product_id: productId,
        quantity: quantity,
        cost: cost
    });

    total += quantity * cost;

    renderItems();
}

// ============================================
// RENDER ITEMS
// ============================================
function renderItems() {

    const container = document.getElementById("items");
    container.innerHTML = "";

    purchaseItems.forEach((item, index) => {
        container.innerHTML += `
            <div style="padding:5px;border-bottom:1px solid #ccc;">
                صنف: ${item.product_id}
                | كمية: ${item.quantity}
                | تكلفة: ${item.cost}
            </div>
        `;
    });

    document.getElementById("total").innerText = total.toFixed(2);
}

// ============================================
// SAVE PURCHASE (NO STOCK UPDATE HERE)
// ============================================
async function savePurchase() {

    if (purchaseItems.length === 0) {
        alert("لا توجد أصناف في الفاتورة");
        return;
    }

    const supplierId = document.getElementById("supplierSelect").value;

    try {

        // 1️⃣ إنشاء فاتورة بحالة pending
        const { data: purchase, error } = await supabase
            .from("purchases")
            .insert([{
                supplier_id: supplierId,
                total: total,
                paid: 0,
                status: "pending"
            }])
            .select()
            .single();

        if (error) throw error;

        // 2️⃣ إدخال العناصر فقط (بدون تحديث مخزون)
        for (let item of purchaseItems) {

            const { error: itemError } = await supabase
                .from("purchase_items")
                .insert([{
                    purchase_id: purchase.id,
                    product_id: item.product_id,
                    quantity: item.quantity,
                    cost: item.cost
                }]);

            if (itemError) throw itemError;
        }

        alert("تم إرسال الفاتورة للموافقة ✔");

        // إعادة التهيئة
        purchaseItems = [];
        total = 0;
        renderItems();

    } catch (err) {
        console.error(err);
        alert("حدث خطأ أثناء الحفظ");
    }
}

// ============================================
loadData();