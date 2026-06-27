import { requireAuth } from "/js/auth.js";
import { logout } from "/js/auth.js";

const params = new URLSearchParams(window.location.search);
const userId = params.get("id");

// sanity check
if (userId && !/^\d+$/.test(userId)) {
    document.querySelector(".maincontent").textContent = "User not found.";
}

document.addEventListener("DOMContentLoaded", async () => {
    const user = await requireAuth();

    if (user) {
        document.getElementById("name").textContent = user.username;
    }

    document.getElementById("logoutBtn").addEventListener("click", logout);

    if (!userId) {
        document.querySelector(".maincontent").textContent = "User not found.";
        return;
    }

    try {
        const response = await fetch(`/api/users/${userId}`, {
            credentials: "include"
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