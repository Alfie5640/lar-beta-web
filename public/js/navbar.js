const navbar = document.getElementById("navbar");

const response = await fetch("/components/nav.html");
const html = await response.text();

if (response.url.startsWith(window.location.origin)) {
    navbar.innerHTML = html;
}