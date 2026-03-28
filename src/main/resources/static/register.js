const registerForm = document.getElementById("registerForm");
const fullNameInput = document.getElementById("fullName");
const emailInput = document.getElementById("email");
const phoneInput = document.getElementById("phone");
const passwordInput = document.getElementById("password");
const registerMessage = document.getElementById("registerMessage");

const API = "http://localhost:8080/api/register";

registerForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  const user = {
    name: fullNameInput.value.trim(),
    email: emailInput.value.trim(),
    phone: phoneInput.value.trim(),
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

    const result = await response.json();

    if (result.status === "success") {
      alert(result.message);
      window.location.href = "login.html";
    } else {
      registerMessage.textContent = result.message;
      registerMessage.className = "form-message error";
      alert(result.message);
    }

  } catch (error) {
    console.error("Register error:", error);
    alert("Registration failed");
  }
});