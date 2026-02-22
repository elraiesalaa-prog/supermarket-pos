async function addSupplier(){

const supplier = {
name: document.getElementById("s_name").value,
phone: document.getElementById("s_phone").value
};

await supabase.from("suppliers").insert([supplier]);

alert("تمت الإضافة");
loadSuppliers();
}

async function loadSuppliers(){

const { data } = await supabase.from("suppliers").select("*");

let html="";

data.forEach(s=>{
html+=`
<div>
${s.name} - ${s.phone} - الرصيد: ${s.balance}
</div>
`;
});

document.getElementById("suppliersList").innerHTML=html;
}

loadSuppliers();