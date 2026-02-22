// =======================================
// PURCHASE APPROVAL MODULE
// =======================================

async function loadPendingPurchases() {

    const { data } = await supabase
        .from("purchases")
        .select("*, suppliers(name)")
        .eq("status", "pending")
        .order("created_at", { ascending: false });

    const container = document.getElementById("pendingList");
    container.innerHTML = "";

    data.forEach(p => {
        container.innerHTML += `
            <div style="border:1px solid #ccc; padding:10px; margin:10px;">
                <h4>فاتورة رقم: ${p.id}</h4>
                <p>المورد: ${p.suppliers.name}</p>
                <p>الإجمالي: ${p.total}</p>
                <button onclick="approvePurchase('${p.id}')">اعتماد</button>
                <button onclick="rejectPurchase('${p.id}')">رفض</button>
            </div>
        `;
    });
}

// =======================================
async function approvePurchase(purchaseId) {

    // جلب عناصر الفاتورة
    const { data: items } = await supabase
        .from("purchase_items")
        .select("*")
        .eq("purchase_id", purchaseId);

    const { data: purchase } = await supabase
        .from("purchases")
        .select("*")
        .eq("id", purchaseId)
        .single();

    // تحديث المخزون
    for (let item of items) {

        const { data: product } = await supabase
            .from("products")
            .select("*")
            .eq("id", item.product_id)
            .single();

        await supabase
            .from("products")
            .update({
                stock: product.stock + item.quantity,
                cost: item.cost
            })
            .eq("id", item.product_id);
    }

    // تحديث رصيد المورد
    const { data: supplier } = await supabase
        .from("suppliers")
        .select("*")
        .eq("id", purchase.supplier_id)
        .single();

    await supabase
        .from("suppliers")
        .update({
            balance: supplier.balance + purchase.total
        })
        .eq("id", purchase.supplier_id);

    // قيد محاسبي
    await createPurchaseEntry(purchaseId, purchase.total);

    // تحديث الحالة
    await supabase
        .from("purchases")
        .update({
            status: "approved",
            approved_at: new Date()
        })
        .eq("id", purchaseId);

    alert("تم اعتماد الفاتورة");

    loadPendingPurchases();
}

// =======================================
async function rejectPurchase(purchaseId) {

    await supabase
        .from("purchases")
        .update({ status: "rejected" })
        .eq("id", purchaseId);

    alert("تم رفض الفاتورة");

    loadPendingPurchases();
}

// =======================================
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

loadPendingPurchases();