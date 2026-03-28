const API_BASE_URL = "http://localhost:8080/api";

async function apiRequest(endpoint, method = "GET", body = null) {
  try {
    const options = {
      method,
      headers: {
        "Content-Type": "application/json"
      }
    };

    if (body) {
      options.body = JSON.stringify(body);
    }

    const response = await fetch(`${API_BASE_URL}${endpoint}`, options);

    if (!response.ok) {
      throw new Error(`API Error: ${response.status}`);
    }

    const contentType = response.headers.get("content-type");

    if (contentType && contentType.includes("application/json")) {
      return await response.json();
    } else {
      return await response.text();
    }
  } catch (error) {
    console.error("Request failed:", error);
    return null;
  }
}

function getLoggedInUser() {
  const user = localStorage.getItem("user");
  return user ? JSON.parse(user) : null;
}

const sosButton = document.getElementById("sosButton");
const alarmBtn = document.getElementById("alarmBtn");
const locationBtn = document.getElementById("locationBtn");
const voiceBtn = document.getElementById("voiceBtn");
const contactsBtn = document.getElementById("contactsBtn");

async function sendSOS() {

  const loggedInUser = getLoggedInUser();

  if (!loggedInUser) {
    alert("Please login first.");
    window.location.href = "login.html";
    return;
  }

  if (!("geolocation" in navigator)) {
    alert("Geolocation not supported.");
    return;
  }

  navigator.geolocation.getCurrentPosition(async (position) => {

    const sosData = {
      latitude: position.coords.latitude,
      longitude: position.coords.longitude,
      imageUrl: null,
      user: {
        userId: loggedInUser.userId
      }
    };

    const result = await apiRequest("/sos/send", "POST", sosData);

    if (result) {
      alert("SOS alert sent successfully!");
    } else {
      alert("Failed to send SOS alert.");
    }

  }, () => {
    alert("Unable to fetch location.");
  });
}

sosButton.addEventListener("click", () => {
  window.location.href = "sos.html";
});

/* alarmBtn.addEventListener("click", () => {
  const audio = new Audio("alarm.mp3");
  audio.play().catch(err => console.log(err));
});  */

locationBtn.addEventListener("click", () => {

  if (!("geolocation" in navigator)) {
    alert("Geolocation not supported.");
    return;
  }

  navigator.geolocation.getCurrentPosition(
    (position) => {
      alert(
        `Latitude: ${position.coords.latitude}\nLongitude: ${position.coords.longitude}`
      );
    },
    () => {
      alert("Unable to fetch location.");
    }
  );

});

contactsBtn.addEventListener("click", () => {
  window.location.href = "contacts.html";
});

voiceBtn.addEventListener("click", startVoiceSOS);



/* ---------------- VOICE SOS ---------------- */

function startVoiceSOS() {

  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

  if (!SpeechRecognition) {
    alert("Voice recognition not supported in this browser.");
    return;
  }

  const recognition = new SpeechRecognition();

  recognition.continuous = true;
  recognition.lang = "en-US";

  recognition.start();

  recognition.onresult = function(event) {

    const transcript =
      event.results[event.results.length - 1][0].transcript.toLowerCase();

    console.log("Voice heard:", transcript);

    if (transcript.includes("help me") || transcript.includes("emergency")) {

      alert("Voice SOS activated!");

      sendSOS();

      recognition.stop();

    }

  };

}



/* ---------------- SHAKE SOS ---------------- */

let lastX = null;
let lastY = null;
let lastZ = null;
let shakeThreshold = 15;

window.addEventListener("devicemotion", function(event) {

  const acceleration = event.accelerationIncludingGravity;

  if (!acceleration) return;

  const x = acceleration.x;
  const y = acceleration.y;
  const z = acceleration.z;

  if (lastX !== null) {

    const deltaX = Math.abs(x - lastX);
    const deltaY = Math.abs(y - lastY);
    const deltaZ = Math.abs(z - lastZ);

    if (deltaX + deltaY + deltaZ > shakeThreshold) {

      console.log("Shake detected!");

      alert("Phone shake detected! Sending SOS.");

      sendSOS();

    }

  }

  lastX = x;
  lastY = y;
  lastZ = z;

});