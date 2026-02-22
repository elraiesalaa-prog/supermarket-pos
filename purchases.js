// ============================================
// PURCHASE MODULE - ERP VERSION
// ============================================

let purchaseItems = [];
let total = 0;

// ============================================
// LOAD DATA
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
                ${p.name} (مخزون: ${p.stock})
            </option>
        `;
    });
}

// ============================================
// ADD ITEM
// ============================================
function addItem() {

    const productId = document.getElementById("productSelect").value;
    const quantity = Number(document.getElementById("quantity").value);
    const cost = Number(document.getElementById("cost").value);

    if (!productId || quantity <= 0 || cost <= 0) {
        alert("أدخل بيانات صحيحة");
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

    purchaseItems.forEach(item => {
        container.innerHTML += `
            <div>
                صنف: ${item.product_id}
                | كمية: ${item.quantity}
                | تكلفة: ${item.cost}
            </div>
        `;
    });

    document.getElementById("total").innerText = total.toFixed(2);
}

// ============================================
// SAVE PURCHASE
// ============================================
async function savePurchase() {

    if (purchaseItems.length === 0) {
        alert("لا توجد أصناف");
        return;
    }

    const supplierId = document.getElementById("supplierSelect").value;

    // إنشاء فاتورة شراء
    const { data: purchase } = await supabase
        .from("purchases")
        .insert([{
            supplier_id: supplierId,
            total: total,
            paid: 0,
            status: "unpaid"
        }])
        .select()
        .single();

    // إدخال العناصر + تحديث المخزون
    for (let item of purchaseItems) {

        await supabase.from("purchase_items").insert([{
            purchase_id: purchase.id,
            product_id: item.product_id,
            quantity: item.quantity,
            cost: item.cost
        }]);

        const { data: product } = await supabase
            .from("products")
            .select("*")
            .eq("id", item.product_id)
            .single();

        await supabase
            .from("products")
            .update({
                stock: Number(product.stock) + item.quantity,
                cost: item.cost
            })
            .eq("id", item.product_id);
    }

    // تحديث رصيد المورد
    await supabase
        .from("suppliers")
        .update({
            balance: supabase.rpc("increment_value") // سيتم استبدالها في SQL
        });

    // قيد محاسبي
    await createPurchaseEntry(purchase.id, total);

    alert("تم حفظ الفاتورة بنجاح");

    purchaseItems = [];
    total = 0;
    renderItems();
}

// ============================================
// ACCOUNTING ENTRY
// ============================================
async function createPurchaseEntry(purchaseId, totalAmount) {

    const { data: inventory } = await supabase
        .from("chart_of_accounts")
        .select("id")
        .eq("code", "1300")
        .single();

    const { data: suppliersAcc } = await supabase
        .from("chart_of_accounts")
        .select("id")
        .eq("code", "2100")
        .single();

    const { data: entry } = await supabase
        .from("journal_entries")
        .insert([{
            description: "فاتورة شراء رقم " + purchaseId
        }])
        .select()
        .single();

    await supabase.from("journal_lines").insert([
        {
            entry_id: entry.id,
            account_id: inventory.id,
            debit: totalAmount,
            credit: 0
        },
        {
            entry_id: entry.id,
            account_id: suppliersAcc.id,
            debit: 0,
            credit: totalAmount
        }
    ]);
}

loadData();