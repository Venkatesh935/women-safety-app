const loginForm = document.getElementById("loginForm");
const emailInput = document.getElementById("email");
const passwordInput = document.getElementById("password");
const togglePassword = document.getElementById("togglePassword");
const formMessage = document.getElementById("formMessage");

const API = "http://localhost:8080/api/auth/login";

togglePassword.addEventListener("click", () => {
  const type = passwordInput.type === "password" ? "text" : "password";
  passwordInput.type = type;
});

loginForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  const user = {
    email: emailInput.value.trim(),
    password: passwordInput.value.trim()
  };

  try {
    const response = await fetch(API, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(user)
    });

    if (!response.ok) {
      throw new Error("Invalid credentials");
    }

    const data = await response.json();

    // store user in local storage
    localStorage.setItem("user", JSON.stringify(data));

   // alert("Login successful!");

    window.location.href = "dashboard.html";

  } catch (error) {
    console.error("Login error:", error);
    formMessage.textContent = "Invalid email or password";
    formMessage.className = "form-message error";
    alert("Invalid Login");
  }
});