let data = JSON.parse(localStorage.getItem("productionData")) || [];

const machineModels = {
  "Thermo Machine-1": ["Model X", "Model Y", "Model Z"],
  "Thermo Machine-2": ["Model A", "Model B"],
  "Thermo Machine-3": ["Model 1", "Model 2", "Model 3", "Model 4"]
};

// Populate Machine dropdown
const machineSelect = document.getElementById("machine");
for(const machine in machineModels){
  const option = document.createElement("option");
  option.value = machine;
  option.text = machine;
  machineSelect.appendChild(option);
}

// Populate Monthly Report Model dropdown
const reportModelSelect = document.getElementById("reportModel");
Object.values(machineModels).flat().forEach(model => {
  const opt = document.createElement("option");
  opt.value = model;
  opt.text = model;
  reportModelSelect.appendChild(opt);
});

function populateModels() {
  const machine = document.getElementById("machine").value;
  const modelSelect = document.getElementById("model");
  modelSelect.innerHTML = `<option value="">Select Model</option>`;
  if(machineModels[machine]){
    machineModels[machine].forEach(model=>{
      const opt = document.createElement("option");
      opt.value = model;
      opt.text = model;
      modelSelect.appendChild(opt);
    });
  }
  document.getElementById("production").value = 0;
  document.getElementById("wastage").value = 0;
  updateGood();
}

function updateCounts() { updateGood(); }
function updateGood(){
  const prod = parseInt(document.getElementById("production").value) || 0;
  const waste = parseInt(document.getElementById("wastage").value) || 0;
  document.getElementById("goodCount").innerText = Math.max(prod - waste, 0);
}

function calcDuration(start, end){
  if(!start || !end) return "";
  const [sh, sm] = start.split(":").map(Number);
  const [eh, em] = end.split(":").map(Number);
  let diffMin = (eh*60 + em) - (sh*60 + sm);
  if(diffMin < 0) diffMin += 24*60;
  return diffMin;
}
function updateDuration(){
  const start = document.getElementById("startTime").value;
  const end = document.getElementById("endTime").value;
  const duration = calcDuration(start, end);
  document.getElementById("durationDisplay").innerText = duration ? `Duration: ${duration} min` : "";
}

function addEntry(){
  const date = document.getElementById("date").value;
  const machine = document.getElementById("machine").value;
  const model = document.getElementById("model").value;
  const operator = document.getElementById("operator").value.trim();
  const production = parseInt(document.getElementById("production").value) || 0;
  const wastage = parseInt(document.getElementById("wastage").value) || 0;
  const good = Math.max(production - wastage,0);
  const problem = document.getElementById("problem").value.trim();
  const startTime = document.getElementById("startTime").value;
  const endTime = document.getElementById("endTime").value;
  const duration = calcDuration(startTime, endTime);
  if(!date || !machine || !model) return alert("Please enter date, machine and model!");
  data.push({ date, machine, model, operator, production, wastage, good, problem, duration });
  localStorage.setItem("productionData", JSON.stringify(data));
  renderTable();
  generateFullReport();
}

function renderTable(){
  const tbody = document.getElementById("tableBody");
  tbody.innerHTML = "";
  data.forEach(d => {
    tbody.innerHTML += `
      <tr class="${d.problem?'bg-red-50':''}">
        <td class="p-2 border">${d.date}</td>
        <td class="p-2 border">${d.machine}</td>
        <td class="p-2 border">${d.model}</td>
        <td class="p-2 border">${d.operator}</td>
        <td class="p-2 border bg-blue-50">${d.production}</td>
        <td class="p-2 border bg-red-50">${d.wastage}</td>
        <td class="p-2 border bg-green-50">${d.good}</td>
        <td class="p-2 border text-red-600">${d.problem || "-"}</td>
        <td class="p-2 border text-blue-600">${d.duration || "-"}</td>
      </tr>`;
  });
}

function resetAll() {
  if(confirm("Are you sure you want to reset all entries? This cannot be undone.")) {
    data = [];
    localStorage.removeItem("productionData");
    renderTable();
    generateFullReport();
    alert("All entries have been reset.");
  }
}

// Generate monthly report with optional model & day filter
function generateMonthlyReport(){
  const monthInput = document.getElementById("reportMonth").value;
  const modelFilter = document.getElementById("reportModel").value;
  const daysInput = document.getElementById("reportDays").value;
  const selectedDays = daysInput ? daysInput.split(",").map(d => d.trim()) : [];

  if(!monthInput) return alert("Please select a month.");

  const reportData = {};
  data.forEach(entry => {
    if(entry.date.startsWith(monthInput)){
      const day = entry.date.split("-")[2];
      if(modelFilter && entry.model !== modelFilter) return;
      if(selectedDays.length && !selectedDays.includes(day)) return;
      const key = `${entry.machine}||${entry.model}`;
      if(!reportData[key]) reportData[key] = {machine: entry.machine, model: entry.model, production:0, wastage:0, good:0};
      reportData[key].production += entry.production;
      reportData[key].wastage += entry.wastage;
      reportData[key].good += entry.good;
    }
  });

  const tbody = document.getElementById("monthlyReportBody");
  tbody.innerHTML = "";
  Object.values(reportData).forEach(d => {
    tbody.innerHTML += `
      <tr>
        <td class="p-2 border">${d.machine}</td>
        <td class="p-2 border">${d.model}</td>
        <td class="p-2 border bg-blue-50">${d.production}</td>
        <td class="p-2 border bg-red-50">${d.wastage}</td>
        <td class="p-2 border bg-green-50">${d.good}</td>
      </tr>`;
  });
  if(Object.keys(reportData).length === 0){
    tbody.innerHTML = `<tr><td class="p-2 border text-center" colspan="5">No data for selected month/model/days</td></tr>`;
  }
}

function generateFullReport() {
  const reportData = {};
  data.forEach(entry => {
    const key = `${entry.machine}||${entry.model}`;
    if(!reportData[key]) reportData[key] = {machine: entry.machine, model: entry.model, production:0, wastage:0, good:0};
    reportData[key].production += entry.production;
    reportData[key].wastage += entry.wastage;
    reportData[key].good += entry.good;
  });
  const tbody = document.getElementById("fullReportBody");
  tbody.innerHTML = "";
  Object.values(reportData).forEach(d => {
    tbody.innerHTML += `
      <tr>
        <td class="p-2 border">${d.machine}</td>
        <td class="p-2 border">${d.model}</td>
        <td class="p-2 border bg-blue-50">${d.production}</td>
        <td class="p-2 border bg-red-50">${d.wastage}</td>
        <td class="p-2 border bg-green-50">${d.good}</td>
      </tr>`;
  });
  if(Object.keys(reportData).length === 0){
    tbody.innerHTML = `<tr><td class="p-2 border text-center" colspan="5">No data available</td></tr>`;
  }
}

function resetMonthlyReport() {
  // Clear the table body
  const tbody = document.getElementById("monthlyReportBody");
  tbody.innerHTML = `<tr><td class="p-2 border text-center" colspan="5">Monthly report cleared</td></tr>`;
  if(confirm("Are you sure you want to reset all entries? This cannot be undone.")) {
    data = [];
    localStorage.removeItem("productionData");
    renderTable();
    generateFullReport();
    alert("All entries have been reset.");
  }
  // Reset month, model, and days inputs
  document.getElementById("reportMonth").value = "";
  document.getElementById("reportModel").value = "";
  document.getElementById("reportDays").value = "";
}

renderTable();
generateFullReport();