const API_BASE_URL = "http://localhost:8080/api/contacts";

const contactForm = document.getElementById("contactForm");
const contactName = document.getElementById("contactName");
const relationship = document.getElementById("relationship");
const phoneNumber = document.getElementById("phoneNumber");
const contactMessage = document.getElementById("contactMessage");
const contactsList = document.getElementById("contactsList");

function isValidPhone(phone) {
  return /^\+[1-9]\d{7,14}$/.test(phone);
}

function getLoggedInUser() {
  const user = localStorage.getItem("user");
  return user ? JSON.parse(user) : null;
}

async function loadContacts() {
  const loggedInUser = getLoggedInUser();

  if (!loggedInUser) {
    alert("Please login first.");
    window.location.href = "login.html";
    return;
  }

  try {
    const response = await fetch(`${API_BASE_URL}/user/${loggedInUser.userId}`);
    const contacts = await response.json();
    renderContacts(contacts);
  } catch (error) {
    console.error("Failed to load contacts:", error);
  }
}

function renderContacts(contacts) {
  contactsList.innerHTML = "";

  if (contacts.length === 0) {
    contactsList.innerHTML = `<div class="empty-state">No emergency contacts added yet.</div>`;
    return;
  }

  contacts.forEach((contact) => {
    const initials = contact.name
      .split(" ")
      .map(word => word[0])
      .join("")
      .slice(0, 2)
      .toUpperCase();

    const contactItem = document.createElement("div");
    contactItem.className = "contact-item";

    contactItem.innerHTML = `
      <div class="contact-left">
        <div class="contact-avatar">${initials}</div>
        <div class="contact-info">
          <h4>${contact.name}</h4>
          <p>${contact.relationship}</p>
          <p>${contact.phone}</p>
        </div>
      </div>
      <button class="delete-btn" onclick="deleteContact(${contact.contactId})">Delete</button>
    `;

    contactsList.appendChild(contactItem);
  });
}

async function deleteContact(id) {
  try {
    await fetch(`${API_BASE_URL}/${id}`, {
      method: "DELETE"
    });
    loadContacts();
  } catch (error) {
    console.error("Delete failed:", error);
  }
}

contactForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  const loggedInUser = getLoggedInUser();

  if (!loggedInUser) {
    alert("Please login first.");
    window.location.href = "login.html";
    return;
  }

  const nameValue = contactName.value.trim();
  const relationshipValue = relationship.value.trim();
  const phoneValue = phoneNumber.value.trim();

  contactMessage.textContent = "";
  contactMessage.className = "form-message";

  if (!nameValue || !relationshipValue || !phoneValue) {
    contactMessage.textContent = "Please fill all fields.";
    contactMessage.classList.add("error");
    return;
  }

  if (!isValidPhone(phoneValue)) {
    contactMessage.textContent = "Enter phone in international format like +919876543210";
    contactMessage.classList.add("error");
    return;
  }

  const newContact = {
    name: nameValue,
    relationship: relationshipValue,
    phone: phoneValue,
    user: {
      userId: loggedInUser.userId
    }
  };

  try {
    const response = await fetch(API_BASE_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(newContact)
    });

    if (!response.ok) {
      throw new Error("Failed to save contact");
    }

    contactMessage.textContent = "Contact saved successfully.";
    contactMessage.classList.add("success");

    contactForm.reset();
    loadContacts();

  } catch (error) {
    console.error(error);
    contactMessage.textContent = "Failed to save contact.";
    contactMessage.classList.add("error");
  }
});

loadContacts();