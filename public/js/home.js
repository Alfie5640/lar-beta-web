import { requireAuth } from "/js/auth.js";
import { logout } from "/js/auth.js";

document.addEventListener("DOMContentLoaded", async () => {
    const user = await requireAuth();

    if (user) {
        document.getElementById("name").textContent = user.username;
    }

    document.getElementById("logoutBtn").addEventListener("click", logout);

    const resultDiv = document.getElementById("sessionList");

    try {
        const result = await fetch("/api/sessions", {
            method: "GET",
            headers: {"Content-Type": "application/json"},
            credentials: "include"
        });

        const data = await result.json();

        if (!data.success) return;

        // -----------------------------
        // DATE SETUP
        // -----------------------------
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const endOfToday = new Date(today);
        endOfToday.setHours(23, 59, 59, 999);

        const endOfWeek = new Date(today);
        endOfWeek.setDate(today.getDate() + 7);

        const sections = {
            today: [],
            week: [],
            future: []
        };

        data.sessions.forEach(session => {
            const sessionDate = new Date(session.date);

            if (sessionDate >= today && sessionDate <= endOfToday) {
                sections.today.push(session);
            } 
            else if (sessionDate <= endOfWeek) {
                sections.week.push(session);
            } 
            else {
                sections.future.push(session);
            }
        });

        // -----------------------------
        // RENDER FUNCTION
        // -----------------------------
        function renderSection(title, sessions) {
            if (sessions.length === 0) return;

            const header = document.createElement("h2");
            header.textContent = title;
            resultDiv.appendChild(header);

            sessions.forEach(session => {
                const div = document.createElement("div");

                const attendeeAvatars = session.attendees.map(a => `
                    <a href="/pages/user.html?id=${a.id}">
                        <img
                            src="${a.profile_picture ? `/storage/${a.profile_picture}` : '/images/default-avatar.png'}"
                            alt="${a.username}"
                            title="${a.username}"
                            style="width:28px; height:28px; border-radius:50%; object-fit:cover; margin-right:4px;"
                        >
                    </a>
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

                ${session.needs_tr_belayer ? `<span class="need-tag tr">Top Rope Belayer Needed</span>` : ''}
                ${session.needs_lead_belayer ? `<span class="need-tag lead">Lead Belayer Needed</span>` : ''}
                ${session.other_need ? `<span class="need-tag other">${session.other_need}</span>` : ''}
                ${session.notes ? `<p>${session.notes}</p>` : ''}

                <div style="display:flex; align-items:center; gap:4px; margin-top:8px;">
                    ${attendeeAvatars}
                </div>

                <button 
                    class="joinBtn"
                    data-id="${session.id}"
                    data-attending="${session.is_attending}"
                >
                    ${session.is_attending ? "Leave" : "Join"}
                </button>
            `;
                resultDiv.appendChild(div);
            });
        }

        // -----------------------------
        // RENDER SECTIONS
        // -----------------------------
        renderSection("Today", sections.today);
        renderSection("This Week", sections.week);
        renderSection("Later", sections.future);

        // -----------------------------
        // EVENT DELEGATION
        // -----------------------------
        resultDiv.addEventListener("click", async (e) => {
            if (!e.target.classList.contains("joinBtn")) return;

            const btn = e.target;
            const sessionId = btn.dataset.id;
            const isAttending = btn.dataset.attending === "true";

            const response = await fetch(`/api/sessions/${sessionId}/${isAttending ? "leave" : "join"}`, {
                    method: isAttending ? "DELETE" : "POST",
                    headers: {},
                    credentials: "include"
                }
            );

            const resData = await response.json();

            if (resData.success) {
                btn.dataset.attending = isAttending ? "false" : "true";
                btn.textContent = isAttending ? "Join" : "Leave";
            }
        });

    } catch (err) {
        console.error("Fetch error:", err);
    }
});