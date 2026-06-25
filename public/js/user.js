import { requireAuth } from "/js/auth.js";

const token = localStorage.getItem("token");
const params = new URLSearchParams(window.location.search);
const userId = params.get("id");

document.addEventListener("DOMContentLoaded", async () => {
    await requireAuth();

    if (!userId) {
        // No id in URL, redirect or show error
        document.querySelector(".maincontent").textContent = "User not found.";
        return;
    }

    try {
        const response = await fetch(`/api/users/${userId}`, {
            headers: { "Authorization": `Bearer ${token}` }
        });

        const data = await response.json();

        if (!data.success) {
            document.querySelector(".maincontent").textContent = "User not found.";
            return;
        }

        const user = data.user;

        document.getElementById("profilePicImg").src = user.profile_picture
            ? `/storage/${user.profile_picture}`
            : "/images/default-avatar.png";

        document.getElementById("profileName").textContent = user.username;
        document.getElementById("bioText").textContent = user.bio ?? "";

    } catch (err) {
        console.error("Failed to load user:", err);
    }
});