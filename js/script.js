let chart;
let currentUserEmail = localStorage.getItem("ecoCurrentUser");

// Redirect if not logged in
if (!currentUserEmail) {
  window.location.href = "login.html";
}

function getAllUsers() {
  return JSON.parse(localStorage.getItem("ecoUsers")) || [];
}

function saveAllUsers(users) {
  localStorage.setItem("ecoUsers", JSON.stringify(users));
}

function getCurrentUser() {
  return getAllUsers().find(user => user.email === currentUserEmail);
}

function updateCurrentUser(updatedUser) {
  const users = getAllUsers().map(user =>
    user.email === currentUserEmail ? updatedUser : user
  );
  saveAllUsers(users);
}

function displayUserStats() {
  const user = getCurrentUser();
  document.getElementById("greeting").textContent = `Welcome, ${user.name}!`;
  document.getElementById("weeklyGoal").textContent = user.weeklyGoal + " L";

  const today = new Date().toLocaleDateString();
  const todayUsage = user.usage
    .filter(entry => entry.date === today)
    .reduce((sum, entry) => sum + entry.litres, 0);

  document.getElementById("dailyUsage").textContent = todayUsage;
}

function logWater() {
  const input = parseInt(document.getElementById("waterInput").value);
  if (isNaN(input) || input <= 0) return alert("Enter valid litres.");
  const user = getCurrentUser();
  const today = new Date().toLocaleDateString();
  user.usage.push({ date: today, litres: input });
  updateCurrentUser(user);
  displayUserStats();
  drawChart();
  generateSmartTips();
}

function updateGoal() {
  const input = parseInt(document.getElementById("newGoalInput").value);
  if (isNaN(input) || input <= 0) return alert("Enter valid weekly goal.");
  const user = getCurrentUser();
  user.weeklyGoal = input;
  updateCurrentUser(user);
  displayUserStats();
  updateProgressBar();
  generateSmartTips();
}

function drawChart() {
  const ctx = document.getElementById("usageChart").getContext("2d");
  const user = getCurrentUser();
  const grouped = {};

  user.usage.forEach(entry => {
    if (!grouped[entry.date]) grouped[entry.date] = 0;
    grouped[entry.date] += entry.litres;
  });

  const labels = Object.keys(grouped);
  const data = Object.values(grouped);

  if (chart) chart.destroy();

  chart = new Chart(ctx, {
    type: "bar",
    data: {
      labels: labels,
      datasets: [{
        label: "Daily Water Usage (L)",
        data: data,
        backgroundColor: "#68d391",
        borderColor: "#2f855a",
        borderWidth: 1
      }]
    },
    options: {
  
      scales: {
        y: { beginAtZero: true }
      }
    }
  });

  updateProgressBar();
  updateLogTable();
}

function updateProgressBar() {
  const user = getCurrentUser();
  const thisWeek = new Date();
  thisWeek.setDate(thisWeek.getDate() - 6);

  const totalUsed = user.usage
    .filter(entry => new Date(entry.date) >= thisWeek)
    .reduce((sum, entry) => sum + entry.litres, 0);

  const goal = user.weeklyGoal;
  const percent = Math.min((totalUsed / goal) * 100, 100);

  document.getElementById("progressBar").style.width = percent + "%";
  document.getElementById("progressPercent").textContent = percent.toFixed(1) + "%";
}

function updateLogTable() {
  const user = getCurrentUser();
  const tbody = document.getElementById("logTableBody");
  tbody.innerHTML = "";

  user.usage.forEach((entry, index) => {
    const tr = document.createElement("tr");

    const dateTd = document.createElement("td");
    dateTd.textContent = entry.date;

    const litresTd = document.createElement("td");
    litresTd.innerHTML = `<input type="number" value="${entry.litres}" onchange="editUsage(${index}, this.value)" />`;

    const deleteTd = document.createElement("td");
    deleteTd.innerHTML = `<button onclick="deleteUsage(${index})">🗑️</button>`;

    tr.appendChild(dateTd);
    tr.appendChild(litresTd);
    tr.appendChild(deleteTd);
    tbody.appendChild(tr);
  });
}

function editUsage(index, newValue) {
  const user = getCurrentUser();
  const litres = parseInt(newValue);
  if (isNaN(litres) || litres <= 0) return alert("Invalid litres.");
  user.usage[index].litres = litres;
  updateCurrentUser(user);
  displayUserStats();
  drawChart();
  generateSmartTips();
}

function deleteUsage(index) {
  const user = getCurrentUser();
  if (!confirm("Delete this log?")) return;
  user.usage.splice(index, 1);
  updateCurrentUser(user);
  displayUserStats();
  drawChart();
  generateSmartTips();
}

function exportCSV() {
  const user = getCurrentUser();
  let csv = "Date,Litres\n";

  user.usage.forEach(entry => {
    csv += `${entry.date},${entry.litres}\n`;
  });

  const blob = new Blob([csv], { type: "text/csv" });
  const url = URL.createObjectURL(blob);

  const a = document.createElement("a");
  a.href = url;
  a.download = `EcoWater-Stats-${user.name}.csv`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
}

function generateSmartTips() {
  const user = getCurrentUser();
  const tipsList = document.getElementById("tipsList");
  if (!tipsList) return;

  tipsList.innerHTML = "";
  const weeklyUsage = user.usage
    .filter(entry => {
      const d = new Date(entry.date);
      const pastWeek = new Date();
      pastWeek.setDate(pastWeek.getDate() - 6);
      return d >= pastWeek;
    })
    .reduce((sum, entry) => sum + entry.litres, 0);

  const tips = [];

  if (weeklyUsage > user.weeklyGoal) {
    tips.push("You're over your weekly goal 💦. Try shorter showers or turn off the tap while brushing.");
  } else if (weeklyUsage < user.weeklyGoal * 0.5) {
    tips.push("Great job! You're using less than half your goal. Keep it up 💚.");
  }

  const today = new Date().toLocaleDateString();
  const todayUsage = user.usage
    .filter(entry => entry.date === today)
    .reduce((sum, entry) => sum + entry.litres, 0);

  if (todayUsage > 50) {
    tips.push("Today's usage is high. Consider skipping car washes or reusing grey water 🚗.");
  }

  if (user.usage.length === 0) {
    tips.push("Start logging daily water use to get personalized advice.");
  }

  tips.forEach(tip => {
    const li = document.createElement("li");
    li.textContent = tip;
    tipsList.appendChild(li);
  });
}

function toggleDarkMode() {
  document.body.classList.toggle("dark-mode");
  localStorage.setItem("darkMode", document.body.classList.contains("dark-mode"));
}

function logout() {
  localStorage.removeItem("ecoCurrentUser");
  window.location.href = "login.html";
}

window.addEventListener("DOMContentLoaded", () => {
    const splash = document.getElementById("splash-screen");
    const mainContent = document.getElementById("main-content");

    if (splash) {
        setTimeout(() => {
            splash.style.display = "none";       
            mainContent.classList.remove("content-hidden");
        }, 2000); // Match CSS animation duration (1s delay + 1s fade)
    } 
    
    else {
        mainContent.classList.remove("content-hidden");
    }

    if (localStorage.getItem("darkMode") === "true") {
        document.body.classList.add("dark-mode");
    }

    displayUserStats();
    drawChart();
    generateSmartTips();
});
let deferredPrompt;
const installBtn = document.getElementById("installBtn");

window.addEventListener("beforeinstallprompt", e => {
  e.preventDefault();
  deferredPrompt = e;
  installBtn.style.display = "block";

  installBtn.addEventListener("click", () => {
    installBtn.style.display = "none";
    deferredPrompt.prompt();
    deferredPrompt.userChoice.then(choice => {
      if (choice.outcome === "accepted") {
        console.log("User installed the app");
      }
      deferredPrompt = null;
    });
  });
});
