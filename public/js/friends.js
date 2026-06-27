import { requireAuth } from "/js/auth.js";
import { logout } from "/js/auth.js";

// xss preventoion
function escapeHtml(str) {
    if (!str) return '';
    return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}

document.addEventListener("DOMContentLoaded", async (e) => {
    const user = await requireAuth();

    if (user) {
        document.getElementById('name').textContent = user.username;
    }   

    document.getElementById("logoutBtn").addEventListener("click", logout);
});

function makeRow(avatarSrc, username, buttonsHTML) {
    return `
        <div class="user-row">
            <img
                class="user-avatar"
                src="${escapeHtml(avatarSrc || '/images/default-avatar.png')}"
                alt="${escapeHtml(username)}"
            >
            <span class="user-name">${escapeHtml(username)}</span>
            ${buttonsHTML}
        </div>
    `;
}

// Search for users
document.getElementById("searchForm").addEventListener("submit", async (e) => {
    e.preventDefault();

    const username = document.getElementById("searchUsername").value;
    const resultsDiv = document.getElementById("searchResults");
    resultsDiv.innerHTML = "";

    try {
        const response = await fetch(`/api/friends/search?username=${encodeURIComponent(username)}`, {
            method: "GET",
            credentials: "include"
        });

        const data = await response.json();

        if (data.success) {
            if (data.users.length === 0) {
                resultsDiv.innerHTML = `<p class="empty-state">No users found.</p>`;
                return;
            }

            data.users.forEach(u => {
                const div = document.createElement("div");
                div.innerHTML = makeRow(
                    u.profile_picture ? `/storage/${u.profile_picture}` : null,
                    u.username,
                    `<button data-id="${escapeHtml(String(u.id))}" class="row-btn primary addFriendBtn">Add Friend</button>`
                );
                resultsDiv.appendChild(div.firstElementChild);
            });

            document.querySelectorAll(".addFriendBtn").forEach(btn => {
                btn.addEventListener("click", () => sendFriendRequest(btn.dataset.id));
            });
        }

    } catch (err) {
        console.error("Search error:", err);
    }
});

// Send a friend request
async function sendFriendRequest(friendId) {
    try {
        const response = await fetch("/api/friends/request", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            credentials: "include",
            body: JSON.stringify({ friend_id: friendId })
        });

        const data = await response.json();

        if (data.success) {
            alert("Friend request sent!");
        } else {
            alert(data.message);
        }

    } catch (err) {
        console.error("Send request error:", err);
    }
}

// Load pending requests
async function loadPendingRequests() {
    const pendingDiv = document.getElementById("pendingRequests");
    pendingDiv.innerHTML = "";

    try {
        const response = await fetch("/api/friends/pending", {
            method: "GET",
            credentials: "include"
        });

        const data = await response.json();

        if (data.success) {
            if (data.requests.length === 0) {
                pendingDiv.innerHTML = `<p class="empty-state">No pending requests.</p>`;
                return;
            }

            data.requests.forEach(req => {
                const div = document.createElement("div");
                div.innerHTML = makeRow(
                    req.sender.profile_picture ? `/storage/${req.sender.profile_picture}` : null,
                    req.sender.username,
                    `
                        <button data-id="${escapeHtml(String(req.id))}" data-status="accepted" class="row-btn accept respondBtn">Accept</button>
                        <button data-id="${escapeHtml(String(req.id))}" data-status="rejected" class="row-btn ghost respondBtn">Decline</button>
                    `
                );
                pendingDiv.appendChild(div.firstElementChild);
            });

            document.querySelectorAll(".respondBtn").forEach(btn => {
                btn.addEventListener("click", () => respondToRequest(btn.dataset.id, btn.dataset.status));
            });
        }

    } catch (err) {
        console.error("Pending requests error:", err);
    }
}

// Respond to a friend request
async function respondToRequest(friendshipId, status) {
    try {
        const response = await fetch("/api/friends/respond", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            credentials: "include",
            body: JSON.stringify({ friendship_id: friendshipId, status: status })
        });

        const data = await response.json();

        if (data.success) {
            loadPendingRequests();
            loadFriends();
        } else {
            alert(data.message);
        }

    } catch (err) {
        console.error("Respond error:", err);
    }
}

// Load friends list
async function loadFriends() {
    const friendsDiv = document.getElementById("friendsList");
    friendsDiv.innerHTML = "";

    try {
        const response = await fetch("/api/friends", {
            method: "GET",
            credentials: "include"
        });

        const data = await response.json();

        if (data.success) {
            if (data.friends.length === 0) {
                friendsDiv.innerHTML = `<p class="empty-state">No friends yet.</p>`;
                return;
            }

            data.friends.forEach(f => {
                const div = document.createElement("div");
                div.innerHTML = makeRow(
                    f.friend.profile_picture ? `/storage/${f.friend.profile_picture}` : null,
                    f.friend.username,
                    `<button data-id="${escapeHtml(String(f.id))}" class="row-btn ghost removeBtn">Remove</button>`
                );
                friendsDiv.appendChild(div.firstElementChild);
            });

            document.querySelectorAll(".removeBtn").forEach(btn => {
                btn.addEventListener("click", () => removeFriend(btn.dataset.id));
            });
        }

    } catch (err) {
        console.error("Friends list error:", err);
    }
}

// Remove a friend
async function removeFriend(friendshipId) {
    try {
        const response = await fetch(`/api/friends/${friendshipId}`, {
            method: "DELETE",
            credentials: "include"
        });

        const data = await response.json();

        if (data.success) {
            loadFriends();
        }

    } catch (err) {
        console.error("Remove friend error:", err);
    }
}

// Initial load
loadPendingRequests();
loadFriends();