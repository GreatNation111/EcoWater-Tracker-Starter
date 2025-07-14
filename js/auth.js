// Save user to localStorage
function saveUser(user) {
  const users = JSON.parse(localStorage.getItem("ecoUsers")) || [];
  users.push(user);
  localStorage.setItem("ecoUsers", JSON.stringify(users));
}

// Find user by email
function getUserByEmail(email) {
  const users = JSON.parse(localStorage.getItem("ecoUsers")) || [];
  return users.find(user => user.email === email);
}

// Sign Up logic
if (document.getElementById("signupForm")) {
  document.getElementById("signupForm").addEventListener("submit", function (e) {
    e.preventDefault();
    const name = document.getElementById("signupName").value.trim();
    const email = document.getElementById("signupEmail").value.trim();
    const password = document.getElementById("signupPassword").value;

    if (getUserByEmail(email)) {
      document.getElementById("signupMessage").innerText = "User already exists.";
      return;
    }

    saveUser({ name, email, password, usage: [], weeklyGoal: 100 });
    localStorage.setItem("ecoCurrentUser", email);
    window.location.href = "index.html";
  });
}

// Login logic
if (document.getElementById("loginForm")) {
  document.getElementById("loginForm").addEventListener("submit", function (e) {
    e.preventDefault();
    const email = document.getElementById("loginEmail").value.trim();
    const password = document.getElementById("loginPassword").value;

    const user = getUserByEmail(email);
    if (!user || user.password !== password) {
      document.getElementById("loginMessage").innerText = "Invalid credentials.";
      return;
    }

    localStorage.setItem("ecoCurrentUser", email);
    window.location.href = "index.html";
  });
}
function togglePassword(id, icon) {
  const field = document.getElementById(id);
  if (field.type === "password") {
    field.type = "text";
    icon.textContent = "🙈";
  } else {
    field.type = "password";
    icon.textContent = "👁️";
  }
}
