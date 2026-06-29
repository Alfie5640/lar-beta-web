const params = new URLSearchParams(window.location.search);
const token = params.get("token");
const email = params.get("email");

if (!token || !email) {
    document.getElementById("message").textContent = "Invalid reset link.";
    document.getElementById("resetForm").style.display = "none";
}

document.getElementById("resetForm").addEventListener("submit", async (e) => {
    e.preventDefault();

    const password = document.getElementById("password").value;
    const password_confirmation = document.getElementById("passwordConfirm").value;
    const messageDiv = document.getElementById("message");

    if (password !== password_confirmation) {
        messageDiv.textContent = "Passwords do not match.";
        messageDiv.style.color = "red";
        return;
    }

    try {
        const response = await fetch("/api/reset-password", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ token, email, password, password_confirmation })
        });

        const data = await response.json();
        messageDiv.textContent = data.message;
        messageDiv.style.color = data.success ? "green" : "red";

        if (data.success) {
            setTimeout(() => {
                window.location.href = "/pages/login.html";
            }, 2000);
        }

    } catch (err) {
        console.error("Error:", err);
        messageDiv.textContent = "Error contacting server.";
        messageDiv.style.color = "red";
    }
});