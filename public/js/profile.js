import { requireAuth } from "/js/auth.js";
import { logout } from "/js/auth.js";

document.addEventListener("DOMContentLoaded", async (e) => {
    const user = await requireAuth();

    if (user) {
        document.getElementById('name').textContent = user.username;
        document.getElementById('profileName').textContent = user.username;
        document.getElementById('bioInput').value = user.bio ?? "";

        const img = document.getElementById('profilePicImg');
        img.src = user.profile_picture ? `/storage/${user.profile_picture}` : "/images/default-avatar.png";
    }

    document.getElementById("logoutBtn").addEventListener("click", logout);
});

// Update password
document.getElementById("changePasswordForm").addEventListener("submit", async (e) => {
    e.preventDefault();

    const current_password = document.getElementById("currentPassword").value;
    const password = document.getElementById("newPassword").value;
    const password_confirmation = document.getElementById("newPasswordConfirm").value;

    try {
        const response = await fetch("/api/profile/password", {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            credentials: "include",
            body: JSON.stringify({ current_password, password, password_confirmation })
        });

        const data = await response.json();

        if (data.success) {
            alert("Password updated!");
            document.getElementById("changePasswordForm").reset();
        } else {
            alert(data.message ?? "Password update failed.");
        }

    } catch (err) {
        console.error("Password update error:", err);
    }
});

// Update bio
document.getElementById("bioForm").addEventListener("submit", async (e) => {
    e.preventDefault();

    const bio = document.getElementById("bioInput").value;

    try {
        const response = await fetch("/api/profile/bio", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            credentials: "include",
            body: JSON.stringify({ bio })
        });

        const data = await response.json();

        if (data.success) {
            alert("Bio updated!");
        } else {
            alert(data.message ?? "Something went wrong.");
        }

    } catch (err) {
        console.error("Bio update error:", err);
    }
});

// Upload profile picture
document.getElementById("pictureForm").addEventListener("submit", async (e) => {
    e.preventDefault();

    const fileInput = document.getElementById("pictureInput");

    if (!fileInput.files.length) {
        alert("Please choose a file first.");
        return;
    }

    const formData = new FormData();
    formData.append("profile_picture", fileInput.files[0]);

    try {
        const response = await fetch("/api/profile/picture", {
            method: "POST",
            credentials: "include",
            body: formData
        });

        const data = await response.json();

        if (data.success) {
            document.getElementById("profilePicImg").src = data.profile_picture_url;
        } else {
            alert(data.message ?? "Upload failed.");
        }

    } catch (err) {
        console.error("Picture upload error:", err);
    }
});

// Update username
document.getElementById("changeUserForm").addEventListener("submit", async (e) => {
    e.preventDefault();

    const username = document.getElementById("username").value;

    try {
        const response = await fetch("/api/profile/username", {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            credentials: "include",
            body: JSON.stringify({ username })
        });

        const data = await response.json();

        if (data.success) {
            document.getElementById('name').textContent = data.username;
            document.getElementById('profileName').textContent = data.username;
            alert("Username updated!");
        } else {
            alert(data.message ?? "Update failed.");
        }

    } catch (err) {
        console.error("Username update error:", err);
    }
});

// Delete account
document.getElementById("deleteAccountBtn").addEventListener("click", async () => {
    const confirmed = confirm("Are you sure? This will permanently delete your account and all your data. This cannot be undone.");

    if (!confirmed) return;

    const password = prompt("Enter your password to confirm:");

    if (!password) return;

    try {
        const response = await fetch("/api/profile", {
            method: "DELETE",
            headers: { "Content-Type": "application/json" },
            credentials: "include",
            body: JSON.stringify({ password })
        });

        const data = await response.json();

        if (data.success) {
            alert("Your account has been deleted.");
            window.location.href = "/pages/login.html";
        } else {
            alert(data.message ?? "Failed to delete account.");
        }

    } catch (err) {
        console.error("Delete account error:", err);
        alert("Error contacting server.");
    }
});