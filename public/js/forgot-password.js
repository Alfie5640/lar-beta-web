document.getElementById("forgotForm").addEventListener("submit", async (e) => {
    e.preventDefault();

    const email = document.getElementById("email").value;
    const messageDiv = document.getElementById("message");

    try {
        const response = await fetch("/api/forgot-password", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email })
        });

        const data = await response.json();
        messageDiv.textContent = data.message;
        messageDiv.style.color = data.success ? "green" : "red";

        if (data.success) {
            document.getElementById("forgotForm").reset();
        }

    } catch (err) {
        console.error("Error:", err);
        messageDiv.textContent = "Error contacting server.";
        messageDiv.style.color = "red";
    }
});