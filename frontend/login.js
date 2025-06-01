// login.js

document.getElementById("loginForm").addEventListener("submit", async (e) => {
  e.preventDefault();

  const usn = document.getElementById("usn").value;
  const password = document.getElementById("password").value;
  const message = document.getElementById("message");

  try {
    const res = await fetch("http://localhost:5000/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ usn, password }),
    });

    const data = await res.json();

    if (res.ok) {
      // Save USN locally
      localStorage.setItem("usn", usn);
      localStorage.setItem("name", data.name);
      window.location.href = "dashboard.html"; // Or redirect to course page
    } else {
      message.textContent = data.message || "Login failed";
    }
  } catch (err) {
    console.error("Login error:", err);
    message.textContent = "Server error";
  }
});
