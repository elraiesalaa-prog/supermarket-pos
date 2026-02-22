async function addCustomer(){

const customer = {
name: document.getElementById("c_name").value,
phone: document.getElementById("c_phone").value
};

const { error } = await supabase.from("customers").insert([customer]);

if(error){
alert("خطأ");
}else{
alert("تمت الإضافة");
loadCustomers();
}
}

async function loadCustomers(){

const { data } = await supabase.from("customers").select("*");

const table = document.getElementById("customersTable");
table.innerHTML="";

data.forEach(c=>{
table.innerHTML += `
<tr>
<td>${c.name}</td>
<td>${c.phone}</td>
<td>${c.points}</td>
</tr>
`;
});
}

loadCustomers();