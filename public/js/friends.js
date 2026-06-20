import { requireAuth } from "/js/auth.js";
import { logout } from "/js/auth.js";

const token = localStorage.getItem("token");

document.addEventListener("DOMContentLoaded", async (e) => {
    const user = await requireAuth();

    if (user) {
        document.getElementById('name').textContent = user.username;
    }   

    document.getElementById("logoutBtn").addEventListener("click", logout);
});

// Search for users 
document.getElementById("searchForm").addEventListener("submit", async (e) => {
    e.preventDefault();

    const username = document.getElementById("searchUsername").value;
    const resultsDiv = document.getElementById("searchResults");
    resultsDiv.innerHTML = "";

    try {
        const response = await fetch(`/api/friends/search?username=${encodeURIComponent(username)}`, {
            method: "GET",
            headers: {
                "Authorization": `Bearer ${token}`
            }
        });

        const data = await response.json();

        if (data.success) {
            data.users.forEach(u => {
                const div = document.createElement("div");
                div.innerHTML = `
                    <span>${u.username}</span>
                    <button data-id="${u.id}" class="addFriendBtn">Add Friend</button>
                `;
                resultsDiv.appendChild(div);
            });

            document.querySelectorAll(".addFriendBtn").forEach(btn => {
                btn.addEventListener("click", () => sendFriendRequest(btn.dataset.id));
            });
        }

    } catch (err) {
        console.error("Search error:", err);
    }
});

//Send a friend request
async function sendFriendRequest(friendId) {
    try {
        const response = await fetch("/api/friends/request", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            },
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

//Load pending requests
async function loadPendingRequests() {
    const pendingDiv = document.getElementById("pendingRequests");
    pendingDiv.innerHTML = "";

    try {
        const response = await fetch("/api/friends/pending", {
            method: "GET",
            headers: {
                "Authorization": `Bearer ${token}`
            }
        });

        const data = await response.json();

        if (data.success) {
            if (data.requests.length === 0) {
                pendingDiv.innerHTML = "<p>No pending requests.</p>";
                return;
            }

            data.requests.forEach(req => {
                const div = document.createElement("div");
                div.innerHTML = `
                    <span>${req.sender.username}</span>
                    <button data-id="${req.id}" data-status="accepted" class="respondBtn">Accept</button>
                    <button data-id="${req.id}" data-status="rejected" class="respondBtn">Reject</button>
                `;
                pendingDiv.appendChild(div);
            });

            document.querySelectorAll(".respondBtn").forEach(btn => {
                btn.addEventListener("click", () => respondToRequest(btn.dataset.id, btn.dataset.status));
            });
        }

    } catch (err) {
        console.error("Pending requests error:", err);
    }
}

//Respond to a friend request
async function respondToRequest(friendshipId, status) {
    try {
        const response = await fetch("/api/friends/respond", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            },
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

//Load friends list
async function loadFriends() {
    const friendsDiv = document.getElementById("friendsList");
    friendsDiv.innerHTML = "";

    try {
        const response = await fetch("/api/friends", {
            method: "GET",
            headers: {
                "Authorization": `Bearer ${token}`
            }
        });

        const data = await response.json();

        if (data.success) {
            if (data.friends.length === 0) {
                friendsDiv.innerHTML = "<p>No friends yet.</p>";
                return;
            }

            data.friends.forEach(f => {
                const div = document.createElement("div");
                div.innerHTML = `
                    <span>${f.friend.username}</span>
                    <button data-id="${f.id}" class="removeBtn">Remove</button>
                `;
                friendsDiv.appendChild(div);
            });

            document.querySelectorAll(".removeBtn").forEach(btn => {
                btn.addEventListener("click", () => removeFriend(btn.dataset.id));
            });
        }

    } catch (err) {
        console.error("Friends list error:", err);
    }
}

//Remove a friend
async function removeFriend(friendshipId) {
    try {
        const response = await fetch(`/api/friends/${friendshipId}`, {
            method: "DELETE",
            headers: {
                "Authorization": `Bearer ${token}`
            }
        });

        const data = await response.json();

        if (data.success) {
            loadFriends();
        }

    } catch (err) {
        console.error("Remove friend error:", err);
    }
}

//Initial load 
loadPendingRequests();
loadFriends();