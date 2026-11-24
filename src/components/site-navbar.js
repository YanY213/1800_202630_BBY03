class NavBar extends HTMLElement {
  connectedCallback() {
    const currentPage = window.location.pathname.split("/").pop();
    this.innerHTML = `
        <nav class="navbar fixed-bottom bg-light border-top">
          <div class="container-fluid justify-content-around">
            <a
              id="homeNav"
              class="nav-link text-center active"
              aria-current="page"
              href="home.html"
            >
              <i class="bi ${
                currentPage === "home.html" ? "bi-house-fill" : "bi-house"
              } d-block fs-5"></i>
              <small>Home</small>
            </a>

            <a id="createNav" class="nav-link text-center" href="create.html">
              <i class="bi ${
                currentPage === "create.html" ? "bi-plus-circle-fill" : "bi-plus-circle"
              } d-block fs-5"></i>
              <small>Create Capsule</small>
            </a>

            <a id="profileNav" class="nav-link text-center" href="settings.html">
              <i class="bi ${
                currentPage === "settings.html" ? "bi-person-fill-gear" : "bi-person-gear"
              } d-block fs-5"></i>
              <small>Settings</small>
            </a>
          </div>
        </nav>
    `;
  }
}

customElements.define("site-navbar", NavBar);
