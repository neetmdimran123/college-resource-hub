let app = document.getElementById("app");
let title = document.getElementById("title");
let backBtn = document.getElementById("backBtn");
let adminBtn = document.getElementById("adminBtn");
let themeToggle = document.getElementById("themeToggle");

themeToggle.onclick = function(){
    document.body.classList.toggle("dark");
};

let historyStack = [];
let isAdmin = false;

let db;
try {
    db = JSON.parse(localStorage.getItem("collegeDB")) || {};
} catch {
    db = {};
}

function saveDB(){
    localStorage.setItem("collegeDB", JSON.stringify(db));
}

function clearFab(){
    let oldFab = document.querySelector(".fab");
    if(oldFab) oldFab.remove();
}

backBtn.onclick = function(){
    clearFab();
    if(historyStack.length > 0){
        let prev = historyStack.pop();
        prev();
    }
};

adminBtn.onclick = function(){
    let pass = prompt("Enter Admin Password");
    if(pass === "1234"){
        isAdmin = true;
        adminBtn.classList.add("admin-active");
        alert("Admin Mode ON");
    } else {
        isAdmin = false;
        adminBtn.classList.remove("admin-active");
        alert("Student Mode");
    }
};

function getKey(dep,year,sem){
    return dep + "_" + year + "_" + sem;
}

/* ---------------- DEPARTMENTS ---------------- */

function showDepartments(){
    clearFab();
    title.innerText = "Departments";
    app.innerHTML = "";
    historyStack = [];

    let departments = ["CSE","IT","AIDS","CIVIL","ECE"];

    departments.forEach(dep=>{
        let div = document.createElement("div");
        div.className="card";
        div.innerText = dep;
        div.onclick = function(){
            historyStack.push(showDepartments);
            showYears(dep);
        };
        app.appendChild(div);
    });
}

/* ---------------- YEARS ---------------- */

function showYears(dep){
    clearFab();
    title.innerText = dep + " - Year";
    app.innerHTML = "";

    let years = ["1st Year","2nd Year","3rd Year","4th Year"];

    years.forEach((year,index)=>{
        let div = document.createElement("div");
        div.className="card";
        div.innerText = year;
        div.onclick = function(){
            historyStack.push(()=>showYears(dep));
            showSemesters(dep,index+1);
        };
        app.appendChild(div);
    });
}

/* ---------------- SEMESTERS ---------------- */

function showSemesters(dep,year){
    clearFab();
    title.innerText = "Semester";
    app.innerHTML = "";

    let semMap = {
        1:["Sem 1","Sem 2"],
        2:["Sem 3","Sem 4"],
        3:["Sem 5","Sem 6"],
        4:["Sem 7","Sem 8"]
    };

    semMap[year].forEach(sem=>{
        let div = document.createElement("div");
        div.className="card";
        div.innerText = sem;
        div.onclick = function(){
            historyStack.push(()=>showSemesters(dep,year));
            showSections(dep,year,sem);
        };
        app.appendChild(div);
    });
}

/* ---------------- SECTIONS ---------------- */

function showSections(dep,year,sem){
    clearFab();
    title.innerText = sem;
    app.innerHTML = "";

    let sections = ["Notes","Assignments","Events","Placement"];

    sections.forEach(sec=>{
        let div = document.createElement("div");
        div.className="card";
        div.innerText = sec;
        div.onclick = function(){
            historyStack.push(()=>showSections(dep,year,sem));
            if(sec === "Notes") showNotes(dep,year,sem);
            if(sec === "Assignments") showAssignments(dep,year,sem);
            if(sec === "Events") showEvents(dep,year,sem);
            if(sec === "Placement") showPlacement(dep,year,sem);
        };
        app.appendChild(div);
    });
}

/* ---------------- NOTES ---------------- */

function showNotes(dep,year,sem){
    clearFab();
    title.innerText = sem + " - Notes";
    app.innerHTML = "";

    let key = getKey(dep,year,sem);

    if(!db[key]) db[key] = {notes:{}, assignments:{}};
    if(!db[key].notes) db[key].notes = {};

    Object.keys(db[key].notes).forEach(subject=>{
        let div = document.createElement("div");
        div.className="card";
        div.innerText = subject;
        app.appendChild(div);
    });

    if(isAdmin){
        let addBtn = document.createElement("button");
        addBtn.className="fab";
        addBtn.innerText="+";
        addBtn.onclick=function(){
            let name = prompt("Enter Subject Name");
            if(name){
                db[key].notes[name] = [];
                saveDB();
                showNotes(dep,year,sem);
            }
        };
        document.body.appendChild(addBtn);
    }
}

/* ---------------- ASSIGNMENTS ---------------- */

function showAssignments(dep,year,sem){
    clearFab();
    title.innerText = sem + " - Assignments";
    app.innerHTML = "";

    let key = getKey(dep,year,sem);

    if(!db[key]) db[key] = {notes:{}, assignments:{}};
    if(!db[key].assignments) db[key].assignments = {};

    Object.keys(db[key].assignments).forEach(subject=>{
        let div = document.createElement("div");
        div.className="card";
        div.innerText = subject;
        div.onclick = function(){
            historyStack.push(()=>showAssignments(dep,year,sem));
            showAssignmentTopics(dep,year,sem,subject);
        };
        app.appendChild(div);
    });

    if(isAdmin){
        let addBtn = document.createElement("button");
        addBtn.className="fab";
        addBtn.innerText="+";
        addBtn.onclick=function(){
            let name = prompt("Enter Subject Name");
            if(name){
                db[key].assignments[name] = [];
                saveDB();
                showAssignments(dep,year,sem);
            }
        };
        document.body.appendChild(addBtn);
    }
}

function showAssignmentTopics(dep,year,sem,subject){
    clearFab();
    title.innerText = subject;
    app.innerHTML = "";

    let key = getKey(dep,year,sem);
    let list = db[key].assignments[subject] || [];

    list.forEach((item,index)=>{

        let today = new Date();
        today.setHours(0,0,0,0);

        let due = new Date(item.date);
        due.setHours(0,0,0,0);

        let diff = Math.floor((due - today)/(1000*60*60*24));

        let statusText = "";
        let color = "";

        if(diff > 0){
            statusText = diff + " days remaining";
            color = "green";
        }
        else if(diff === 0){
            statusText = "Due Today";
            color = "orange";
        }
        else{
            statusText = Math.abs(diff) + " days late";
            color = "red";
        }

        let div = document.createElement("div");
        div.className="card";

        div.innerHTML = `
            <div style="display:flex;justify-content:space-between;align-items:center;">
                <div style="display:flex;align-items:center;">
                    <span style="width:12px;height:12px;border-radius:50%;background:${color};margin-right:10px;"></span>
                    <div>
                        <div style="font-weight:bold;">${item.topic}</div>
                        <div style="color:black;font-weight:bold;">Due: ${item.date}</div>
                        <div style="color:${color};font-weight:bold;">${statusText}</div>
                    </div>
                </div>
                ${isAdmin ? `<button onclick="deleteAssignment('${dep}','${year}','${sem}','${subject}',${index})"
                style="background:red;color:white;border:none;padding:5px 8px;border-radius:6px;">X</button>` : ""}
            </div>
        `;

        app.appendChild(div);
    });

    if(isAdmin){
        let formDiv = document.createElement("div");
        formDiv.className="card";

        formDiv.innerHTML = `
            <textarea id="topicInput" placeholder="Enter Assignment Topic"
            style="width:100%;padding:8px;margin-bottom:8px;"></textarea>

            <input type="date" id="dateInput"
            style="width:100%;padding:8px;margin-bottom:8px;">

            <button id="saveAssignment"
            style="width:100%;padding:10px;background:#1e3a8a;color:white;border:none;border-radius:8px;">
            Save Assignment
            </button>
        `;

        app.appendChild(formDiv);

        document.getElementById("saveAssignment").onclick=function(){
            let topic = document.getElementById("topicInput").value;
            let date = document.getElementById("dateInput").value;

            if(topic && date){
                db[key].assignments[subject].push({topic,date});
                saveDB();
                showAssignmentTopics(dep,year,sem,subject);
            } else {
                alert("Fill both topic and date");
            }
        };
    }
}

function deleteAssignment(dep,year,sem,subject,index){
    let key = getKey(dep,year,sem);
    db[key].assignments[subject].splice(index,1);
    saveDB();
    showAssignmentTopics(dep,year,sem,subject);
}
/* ---------------- SIMPLE EVENTS ---------------- */

function showEvents(dep,year,sem){
    clearFab();
    title.innerText = sem + " - Events";
    app.innerHTML = "";

    let key = getKey(dep,year,sem);

    if(!db[key]) db[key] = {notes:{}, assignments:{}, events:[]};
    if(!db[key].events) db[key].events = [];

    db[key].events.forEach((event,index)=>{

        let div = document.createElement("div");
        div.className="card";

        div.innerHTML = `
            <div style="display:flex;justify-content:space-between;align-items:center;">
                <div>
                    <div style="font-weight:bold;">${event.title}</div>
                    <div style="color:black;font-weight:bold;">Date: ${event.date}</div>
                    <div>
                        <a href="${event.link}" target="_blank"
                        style="color:#1e3a8a;font-weight:bold;">
                        Download Pamphlet
                        </a>
                    </div>
                </div>
                ${isAdmin ? `<button onclick="deleteEvent('${dep}','${year}','${sem}',${index})"
                style="background:red;color:white;border:none;padding:5px 8px;border-radius:6px;">X</button>` : ""}
            </div>
        `;

        app.appendChild(div);
    });

    if(isAdmin){
        let formDiv = document.createElement("div");
        formDiv.className="card";

        formDiv.innerHTML = `
            <input type="text" id="eventTitle" placeholder="Event Headline"
            style="width:100%;padding:8px;margin-bottom:8px;">

            <input type="date" id="eventDate"
            style="width:100%;padding:8px;margin-bottom:8px;">

            <input type="text" id="eventLink" placeholder="Pamphlet Download Link"
            style="width:100%;padding:8px;margin-bottom:8px;">

            <button id="saveEvent"
            style="width:100%;padding:10px;background:#1e3a8a;color:white;border:none;border-radius:8px;">
            Save Event
            </button>
        `;

        app.appendChild(formDiv);

        document.getElementById("saveEvent").onclick=function(){
            let titleVal = document.getElementById("eventTitle").value;
            let dateVal = document.getElementById("eventDate").value;
            let linkVal = document.getElementById("eventLink").value;

            if(titleVal && dateVal && linkVal){
                db[key].events.push({
                    title: titleVal,
                    date: dateVal,
                    link: linkVal
                });
                saveDB();
                showEvents(dep,year,sem);
            } else {
                alert("Fill all fields");
            }
        };
    }
}

function deleteEvent(dep,year,sem,index){
    let key = getKey(dep,year,sem);
    db[key].events.splice(index,1);
    saveDB();
    showEvents(dep,year,sem);
}
    /* ---------------- PLACEMENT ---------------- */

function showPlacement(dep,year,sem){
    clearFab();
    title.innerText = sem + " - Placement";
    app.innerHTML = "";

    let key = getKey(dep,year,sem);

    if(!db[key]) db[key] = {notes:{}, assignments:{}, events:[], placement:[]};
    if(!db[key].placement) db[key].placement = [];

    db[key].placement.forEach((item,index)=>{

        let div = document.createElement("div");
        div.className="card";

        div.innerHTML = `
            <div style="display:flex;justify-content:space-between;align-items:center;">
                <div>
                    <div style="font-weight:bold;">${item.company}</div>
                    <div style="color:black;font-weight:bold;">Interview Date: ${item.date}</div>
                    <div>
                        <a href="${item.link}" target="_blank"
                        style="color:#1e3a8a;font-weight:bold;">
                        Download Material
                        </a>
                    </div>
                </div>
                ${isAdmin ? `<button onclick="deletePlacement('${dep}','${year}','${sem}',${index})"
                style="background:red;color:white;border:none;padding:5px 8px;border-radius:6px;">X</button>` : ""}
            </div>
        `;

        app.appendChild(div);
    });

    if(isAdmin){
        let formDiv = document.createElement("div");
        formDiv.className="card";

        formDiv.innerHTML = `
            <input type="text" id="companyName" placeholder="Company Name"
            style="width:100%;padding:8px;margin-bottom:8px;">

            <input type="date" id="interviewDate"
            style="width:100%;padding:8px;margin-bottom:8px;">

            <input type="text" id="materialLink" placeholder="Material Download Link"
            style="width:100%;padding:8px;margin-bottom:8px;">

            <button id="savePlacement"
            style="width:100%;padding:10px;background:#1e3a8a;color:white;border:none;border-radius:8px;">
            Save Placement
            </button>
        `;

        app.appendChild(formDiv);

        document.getElementById("savePlacement").onclick=function(){
            let companyVal = document.getElementById("companyName").value;
            let dateVal = document.getElementById("interviewDate").value;
            let linkVal = document.getElementById("materialLink").value;

            if(companyVal && dateVal && linkVal){
                db[key].placement.push({
                    company: companyVal,
                    date: dateVal,
                    link: linkVal
                });
                saveDB();
                showPlacement(dep,year,sem);
            } else {
                alert("Fill all fields");
            }
        };
    }
}

function deletePlacement(dep,year,sem,index){
    let key = getKey(dep,year,sem);
    db[key].placement.splice(index,1);
    saveDB();
    showPlacement(dep,year,sem);
}

showDepartments();
