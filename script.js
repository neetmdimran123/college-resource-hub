let isAdmin = false;
let selectedPath = [];
let data = JSON.parse(localStorage.getItem("collegeData")) || {};

function saveData(){
  localStorage.setItem("collegeData", JSON.stringify(data));
}

function openStudent(){
  isAdmin = false;
  startApp();
}

function openAdminLogin(){
  document.getElementById("rolePage").classList.add("hidden");
  document.getElementById("adminLogin").classList.remove("hidden");
}

function checkAdmin(){
  let pass = document.getElementById("adminPass").value;
  if(pass === "1234"){
    isAdmin = true;
    startApp();
  }else{
    alert("Wrong Password");
  }
}

function startApp(){
  document.getElementById("rolePage").classList.add("hidden");
  document.getElementById("adminLogin").classList.add("hidden");
  document.getElementById("mainPage").classList.remove("hidden");
  document.getElementById("addBtn").classList.toggle("hidden", !isAdmin);
  showDepartments();
}

function goBack(){
  if(selectedPath.length > 0){
    selectedPath.pop();
    navigateBack();
  }else{
    location.reload();
  }
}

function navigateBack(){
  if(selectedPath.length === 0) showDepartments();
  else if(selectedPath.length === 1) showYears();
  else if(selectedPath.length === 2) showSemesters();
  else if(selectedPath.length === 3) showOptions();
  else showItems();
}

function showDepartments(){
  document.getElementById("pageTitle").innerText = "Departments";
  selectedPath = [];
  let depts = ["CSE","IT","ECE","Civil","AIDS"];
  let html = "";
  depts.forEach(d=>{
    html += `<div class='card' onclick="selectItem('${d}')">${d}</div>`;
  });
  document.getElementById("content").innerHTML = html;
}

function selectItem(name){
  selectedPath.push(name);

  if(selectedPath.length === 1) showYears();
  else if(selectedPath.length === 2) showSemesters();
  else if(selectedPath.length === 3) showOptions();
  else showItems();
}

function showYears(){
  document.getElementById("pageTitle").innerText = "Year";
  let html = "";
  for(let i=1;i<=4;i++){
    html += `<div class='card' onclick="selectItem('Year ${i}')">Year ${i}</div>`;
  }
  document.getElementById("content").innerHTML = html;
}

function showSemesters(){
  document.getElementById("pageTitle").innerText = "Semester";
  let year = selectedPath[1];
  let html = "";

  if(year === "Year 1") html += semesterCard(1) + semesterCard(2);
  if(year === "Year 2") html += semesterCard(3) + semesterCard(4);
  if(year === "Year 3") html += semesterCard(5) + semesterCard(6);
  if(year === "Year 4") html += semesterCard(7) + semesterCard(8);

  document.getElementById("content").innerHTML = html;
}

function semesterCard(num){
  return `<div class='card' onclick="selectItem('Sem ${num}')">Semester ${num}</div>`;
}

function showOptions(){
  document.getElementById("pageTitle").innerText = "Resources";
  let options = ["Notes","Assignment","Placement","Events"];
  let html = "";
  options.forEach(o=>{
    html += `<div class='card' onclick="selectItem('${o}')">${o}</div>`;
  });
  document.getElementById("content").innerHTML = html;
}

function showItems(){
  document.getElementById("pageTitle").innerText = selectedPath[selectedPath.length-1];

  let key = selectedPath.join("-");
  let items = data[key] || [];
  let content = "";

  items.forEach((item,i)=>{
    content += "<div class='card'>";

    if(item.type === "Notes"){
      content += `<b>Subject:</b> ${item.subject}<br>
                  <b>Unit:</b> ${item.unit}<br>
                  <a href="${item.link}" target="_blank">Download</a>`;
    }

    else if(item.type === "Assignment"){
      content += `<b>Subject:</b> ${item.subject}<br>
                  <b>Topic:</b> ${item.topic}<br>`;

      let today = new Date();
      today.setHours(0,0,0,0);
      let deadline = new Date(item.date);
      deadline.setHours(0,0,0,0);

      let diff = Math.ceil((deadline - today)/(1000*60*60*24));

      if(diff > 0)
        content += `<div class="green">🟢 Remaining ${diff} Days</div>`;
      else if(diff === 0)
        content += `<div class="yellow">🟡 Today is Last Date</div>`;
      else
        content += `<div class="red">🔴 Late</div>`;

      if(item.link)
        content += `<a href="${item.link}" target="_blank">Download</a>`;
    }

    else if(item.type === "Placement"){
      content += `<b>${item.name}</b><br>
                  <a href="${item.link}" target="_blank">Download</a>`;
    }

    else if(item.type === "Events"){
      content += `<b>${item.headline}</b><br>
                  <b>Date:</b> ${item.date}<br>
                  <a href="${item.link}" target="_blank">Download</a>`;
    }

    if(isAdmin){
      content += `<br><button onclick="deleteItem(${i})">Delete</button>`;
    }

    content += "</div>";
  });

  document.getElementById("content").innerHTML = content;
}

let currentType = "";

function addItem(){
  currentType = selectedPath[selectedPath.length-1];

  document.getElementById("popupForm").style.display = "flex";
  document.getElementById("formTitle").innerText = "Add " + currentType;

  document.getElementById("subjectInput").value = "";
  document.getElementById("unitInput").value = "";
  document.getElementById("dateInput").value = "";
  document.getElementById("linkInput").value = "";

  document.getElementById("dateInput").classList.add("hidden");

  if(currentType === "Assignment" || currentType === "Events"){
    document.getElementById("dateInput").classList.remove("hidden");
  }
}

function closeForm(){
document.getElementById("popupForm").style.display = "flex";
}

function submitForm(){

  let key = selectedPath.join("-");
  if(!data[key]) data[key] = [];

  let subject = document.getElementById("subjectInput").value;
  let unit = document.getElementById("unitInput").value;
  let date = document.getElementById("dateInput").value;
  let link = document.getElementById("linkInput").value;

  if(currentType === "Notes"){
    data[key].push({type:"Notes", subject, unit, link});
  }
  else if(currentType === "Assignment"){
    data[key].push({type:"Assignment", subject, topic: unit, date, link});
  }
  else if(currentType === "Placement"){
    data[key].push({type:"Placement", name: subject, link});
  }
  else if(currentType === "Events"){
    data[key].push({type:"Events", headline: subject, date, link});
  }

  saveData();
  closeForm();
  document.getElementById("popupForm").style.display = "none";
  showItems();
}

function deleteItem(i){
  let key = selectedPath.join("-");
  data[key].splice(i,1);
  saveData();
  showItems();
}