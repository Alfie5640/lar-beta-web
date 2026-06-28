document.getElementById('loginForm').addEventListener('submit', async (e) => {
    e.preventDefault();

    const username = document.getElementById("loginUsername").value;
    const password = document.getElementById("loginPassword").value;
    const resultDiv = document.getElementById("error");

    try {
        await fetch("/sanctum/csrf-cookie", { credentials: "include" });

        const response = await fetch("/api/login", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            credentials: "include",
            body: JSON.stringify({ username, password })
        });

        if (response.status === 429) {
            resultDiv.textContent = "Too many attempts. Please wait a minute.";
            resultDiv.style.color = "red";
            return;
        }

        const data = await response.json();

        if (data.success) {
            window.location.href = "/pages/index.html";
        } else if (data.unverified) {
            resultDiv.innerHTML = `Email not verified. <button id="resendBtn" style="margin-left:8px;">Resend email</button>`;
            document.getElementById("resendBtn").addEventListener("click", async () => {
                const res = await fetch("/api/email/resend-by-username", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ username: document.getElementById("loginUsername").value })
                });
                const resData = await res.json();
                resultDiv.textContent = resData.message;
            });
        }

    } catch (err) {
        console.error("Fetch error:", err);
        resultDiv.textContent = "Error contacting server.";
    }
});

document.getElementById('registerForm').addEventListener('submit', async (e) => {
    e.preventDefault();

    const resultDiv = document.getElementById("error");

    try {
        await fetch("/sanctum/csrf-cookie", { credentials: "include" });

        const response = await fetch("/api/register", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            credentials: "include",
            body: JSON.stringify({
                username: document.getElementById("regUsername").value,
                email: document.getElementById("regEmail").value,
                password: document.getElementById("regPassword").value,
                password_confirmation: document.getElementById("regPasswordConfirm").value,
            })
        });

        if (response.status === 429) {
            resultDiv.textContent = "Too many attempts. Please wait a minute.";
            resultDiv.style.color = "red";
            return;
        }

        const data = await response.json();

        if (data.success) {
            const email = document.getElementById("regEmail").value;
            window.location.href = `/pages/verify-pending.html?email=${encodeURIComponent(email)}`;
        } else {
            resultDiv.textContent = data.message || "Registration failed.";
            resultDiv.style.color = "red";
        }

    } catch (err) {
        console.error("Fetch error:", err);
        resultDiv.textContent = "Error contacting server.";
    }
});