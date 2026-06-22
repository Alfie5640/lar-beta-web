import { requireAuth } from "/js/auth.js";
import { logout } from "/js/auth.js";
const token = localStorage.getItem("token");

document.addEventListener("DOMContentLoaded", async (e) => {
    const user = await requireAuth();

    if (user) {
        document.getElementById('name').textContent = user.username;
    } 

    document.getElementById("logoutBtn").addEventListener("click", logout);

    const resultDiv = document.getElementById("sessionList");

    try {
        const result = await fetch("api/sessions", {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            },
        });

        const data = await result.json();
        if (data.success) {
            data.sessions.forEach(session => {
                const div = document.createElement("div");

                const attendeeAvatars = session.attendees.map(a => `
                    <img
                        src="${a.profile_picture ? `/storage/${a.profile_picture}` : '/images/default-avatar.png'}"
                        alt="${a.username}"
                        title="${a.username}"
                        style="width:28px; height:28px; border-radius:50%; object-fit:cover; margin-right:4px;"
                    >
                `).join('');

                div.innerHTML = `
                    <div style="display:flex; align-items:center; gap:8px;">
                        <img
                            src="${session.user.profile_picture ? `/storage/${session.user.profile_picture}` : '/images/default-avatar.png'}"
                            alt="${session.user.username}"
                            style="width:32px; height:32px; border-radius:50%; object-fit:cover;"
                        >
                        <h2>${session.user.username}</h2>
                    </div>
                    <h3>${session.place}</h3>
                    <p>${session.date}</p>
                    <p>${session.time_start} - ${session.time_end ?? "Unknown"}</p>
                    <div style="display:flex; align-items:center; gap:4px; margin-top:8px;">
                        ${attendeeAvatars}
                    </div>
                    <button 
                        class="joinBtn" 
                        data-id="${session.id}"
                        data-attending="${session.is_attending}"
                    >
                        ${session.is_attending ? 'Leave' : 'Join'}
                    </button>
                `;

                resultDiv.appendChild(div);
            });

// Single delegated listener on the container instead of one per button
resultDiv.addEventListener("click", async (e) => {
    if (!e.target.classList.contains("joinBtn")) return;

    const btn = e.target;
    const sessionId = btn.dataset.id;
    const isAttending = btn.dataset.attending === "true";

    const response = await fetch(`/api/sessions/${sessionId}/${isAttending ? 'leave' : 'join'}`, {
        method: isAttending ? 'DELETE' : 'POST',
        headers: { "Authorization": `Bearer ${token}` }
    });

    const data = await response.json();

    if (data.success) {
        btn.dataset.attending = isAttending ? "false" : "true";
        btn.textContent = isAttending ? "Join" : "Leave";
    }
});
        }


    } catch(err) {
        console.error("Fetch error:", err);
    }
});