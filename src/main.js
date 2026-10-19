import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap';

// If you have custom global styles, import them as well:
// import '../styles/style.css';

function sayHello() {

}
// document.addEventListener('DOMContentLoaded', sayHello);


function updateNavbar() {
  const currentPage = window.location.pathname.split("/").pop() || "index.html";
  console.log("Switched to page:", currentPage);

  const navLinks = document.querySelectorAll(".navbar .nav-link");

  navLinks.forEach(function (link) {
    const linkPage = link.getAttribute("href");

    if (linkPage === currentPage) {
      link.classList.add("active");
      link.setAttribute("aria-current", "page");
    } else {
      link.classList.remove("active");
      link.removeAttribute("aria-current");
    }
  });
}

document.addEventListener('DOMContentLoaded', updateNavbar);