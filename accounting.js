async function loadTrialBalance(){

const { data } = await supabase
.from("journal_lines")
.select("account_id, debit, credit, chart_of_accounts(name)");

let balances = {};

data.forEach(line=>{
let name = line.chart_of_accounts.name;

if(!balances[name]){
balances[name] = { debit:0, credit:0 };
}

balances[name].debit += Number(line.debit);
balances[name].credit += Number(line.credit);
});

let html = "<table border='1'><tr><th>الحساب</th><th>مدين</th><th>دائن</th></tr>";

for(let acc in balances){
html += `<tr>
<td>${acc}</td>
<td>${balances[acc].debit}</td>
<td>${balances[acc].credit}</td>
</tr>`;
}

html += "</table>";

document.getElementById("trialBalance").innerHTML = html;
}

loadTrialBalance();