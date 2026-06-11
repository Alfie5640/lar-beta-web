const navbar = document.getElementById("navbar");

const response = await fetch("/components/nav.html");
navbar.innerHTML = await response.text();