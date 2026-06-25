export async function requireAuth() {
    try {
        const response = await fetch("/api/user", {
            method: "GET",
            headers: { "Content-Type": "application/json" },
            credentials: "include"   // cookie sent automatically here
        });

        const data = await response.json();

        if (data.id) {
            return data;
        } else {
            window.location.href = "/pages/login.html";
            return null;
        }

    } catch (err) {
        console.error("Auth error:", err);
        window.location.href = "/pages/login.html";
        return null;
    }
}

export async function logout() {
    try {
        await fetch("/api/logout", {
            method: "POST",
            credentials: "include"
        });
    } catch (err) {
        console.error("Logout error:", err);
    }

    window.location.href = "/pages/login.html";
}