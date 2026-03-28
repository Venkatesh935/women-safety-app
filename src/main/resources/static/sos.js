const API_BASE_URL = "http://localhost:8080/api";

const video = document.getElementById("video");
const canvas = document.getElementById("canvas");
const captureBtn = document.getElementById("captureBtn");
const locationBtn = document.getElementById("getLocation");
const locationText = document.getElementById("locationText");
const sosBtn = document.getElementById("sendSOS");
const statusText = document.getElementById("status");

let capturedImage = null;
let latitude = null;
let longitude = null;
let sosInProgress = false;

function getLoggedInUser() {
    const user = localStorage.getItem("user");
    return user ? JSON.parse(user) : null;
}

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
        }
        return await response.text();
    } catch (error) {
        console.error("Request failed:", error);
        return null;
    }
}

async function startCamera() {
    try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        video.srcObject = stream;

        await new Promise((resolve) => {
            video.onloadedmetadata = () => {
                video.play().catch(() => {});
                resolve();
            };
        });
    } catch (err) {
        console.log("Camera error:", err);
        alert("Unable to access camera");
    }
}

function wait(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function capturePhotoAutomatically() {
    if (!video.videoWidth || !video.videoHeight) {
        await wait(800);
    }

    return new Promise((resolve, reject) => {
        try {
            const context = canvas.getContext("2d");

            if (!video.videoWidth || !video.videoHeight) {
                reject("Camera not ready");
                return;
            }

            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;

            context.drawImage(video, 0, 0);
            capturedImage = canvas.toDataURL("image/png");
            resolve(capturedImage);
        } catch (error) {
            reject(error);
        }
    });
}

function getCurrentLocation() {
    return new Promise((resolve, reject) => {
        if (!navigator.geolocation) {
            reject("Geolocation not supported");
            return;
        }

        navigator.geolocation.getCurrentPosition(
            (position) => {
                latitude = position.coords.latitude;
                longitude = position.coords.longitude;
                locationText.innerText = `Latitude: ${latitude}, Longitude: ${longitude}`;
                resolve({ latitude, longitude });
            },
            (error) => {
                reject(error);
            },
            {
                enableHighAccuracy: true,
                timeout: 10000,
                maximumAge: 0
            }
        );
    });
}

/* function playAlarm() {
    const audio = new Audio("sound-alert.mp3");
    audio.play().catch(err => console.log("Audio play blocked:", err));
}  */

function setSosButtonState(disabled, text = "SEND SOS ALERT") {
    sosBtn.disabled = disabled;
    sosBtn.innerText = text;
    sosBtn.style.opacity = disabled ? "0.7" : "1";
    sosBtn.style.cursor = disabled ? "not-allowed" : "pointer";
}

// Manual capture button
captureBtn.addEventListener("click", async () => {
    try {
        statusText.innerText = "Capturing photo...";
        await capturePhotoAutomatically();
        statusText.innerText = "Photo captured successfully";
        alert("Photo captured successfully");
    } catch (error) {
        console.log(error);
        statusText.innerText = "Photo capture failed";
        alert("Photo capture failed");
    }
});

// Manual location button
locationBtn.addEventListener("click", async () => {
    try {
        statusText.innerText = "Fetching location...";
        await getCurrentLocation();
        statusText.innerText = "Location fetched successfully";
    } catch (error) {
        console.log("Location error:", error);
        statusText.innerText = "Unable to fetch location";
        alert("Unable to fetch location");
    }
});

// One-click SOS
sosBtn.addEventListener("click", async () => {
    if (sosInProgress) {
        return;
    }

    const loggedInUser = getLoggedInUser();

    if (!loggedInUser) {
        alert("Please login first.");
        window.location.href = "login.html";
        return;
    }

    sosInProgress = true;
    setSosButtonState(true, "SENDING...");

    try {
        statusText.innerText = "Starting SOS process...";

        statusText.innerText = "Capturing photo...";
        await capturePhotoAutomatically();

        statusText.innerText = "Fetching location...";
        await getCurrentLocation();

        const sosData = {
            latitude: latitude,
            longitude: longitude,
            imageUrl: capturedImage,
            user: {
                userId: loggedInUser.userId
            }
        };

        statusText.innerText = "Sending emergency alert...";

        const result = await apiRequest("/sos/send", "POST", sosData);

        if (result) {
            statusText.innerText = "SOS Alert Sent Successfully";
            //playAlarm();
            alert("SOS alert sent successfully");
        } else {
            statusText.innerText = "Failed to send SOS alert";
            alert("Failed to send SOS alert");
        }

    } catch (error) {
        console.error("SOS process failed:", error);
        statusText.innerText = "SOS process failed";
        alert("Could not complete SOS action");
    } finally {
        setTimeout(() => {
            sosInProgress = false;
            setSosButtonState(false, "SEND SOS ALERT");
        }, 15000);
    }
});

startCamera();