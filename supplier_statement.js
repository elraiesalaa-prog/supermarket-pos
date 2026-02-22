async function loadStatement() {

    const supplierId = document.getElementById("supplierSelect").value;

    const { data: purchases } = await supabase
        .from("purchases")
        .select("*")
        .eq("supplier_id", supplierId);

    const { data: payments } = await supabase
        .from("supplier_payments")
        .select("*")
        .eq("supplier_id", supplierId);

    const container = document.getElementById("statement");
    container.innerHTML = "";

    purchases.forEach(p => {
        container.innerHTML += `
            <div>فاتورة شراء: ${p.total}</div>
        `;
    });

    payments.forEach(pay => {
        container.innerHTML += `
            <div>سداد: ${pay.amount}</div>
        `;
    });
}