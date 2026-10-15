(function () {
  const pages = [["index.html","Home"],["products.html","Products"],["about.html","About"],["contact.html","Contact"]];
  const current = location.pathname.split("/").pop() || "index.html";
  const waBase = "https://wa.me/" + WHATSAPP_NUMBER;

  // ---------- shared header & footer ----------
  const links = pages.map(p => '<a href="' + p[0] + '"' + (p[0] === current ? ' aria-current="page"' : '') + '>' + p[1] + '</a>').join("");
  document.getElementById("site-header").innerHTML =
    '<div class="header-inner">' +
      '<a class="brand" href="index.html">Adelga Code <span>Electronics</span></a>' +
      '<button class="menu-btn" id="menu-btn" aria-label="Menu" aria-expanded="false">☰</button>' +
      '<nav class="nav" id="nav" aria-label="Main">' + links + '</nav>' +
    '</div>';
  document.getElementById("menu-btn").addEventListener("click", function () {
    const open = document.getElementById("nav").classList.toggle("open");
    this.setAttribute("aria-expanded", open);
  });
  document.getElementById("site-footer").innerHTML =
    '<div class="footer-inner"><nav>' + links.replace(' aria-current="page"', "") + '</nav>' +
    '<p>&copy; ' + new Date().getFullYear() + ' ' + SHOP_NAME + '</p></div>';

  // ---------- helpers ----------
  const fmt = n => "GH₵" + Number(n).toLocaleString("en-GH", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  const esc = s => String(s).replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));

  function placeholder(p) {
    const svg = '<svg xmlns="http://www.w3.org/2000/svg" width="400" height="400"><rect width="400" height="400" fill="#e3e9f3"/>' +
      '<text x="200" y="215" font-size="120" text-anchor="middle">' + (p.emoji || "📦") + '</text>' +
      '<text x="200" y="330" font-size="22" fill="#5d6b82" text-anchor="middle" font-family="sans-serif">Photo coming soon</text></svg>';
    return "data:image/svg+xml;charset=utf-8," + encodeURIComponent(svg);
  }
  function orderLink(p) {
    const msg = "Hello " + SHOP_NAME + ", I would like to order:\n\nProduct: " + p.name + "\nPrice: " + fmt(p.price) +
      "\n\nIs it available? Please let me know how to pay and get delivery. Thank you!";
    return waBase + "?text=" + encodeURIComponent(msg);
  }
  function render(el, list) {
    if (!list.length) { el.innerHTML = '<p class="empty">No products found.</p>'; return; }
    el.innerHTML = list.map(p =>
      '<article class="card"><img src="' + esc(p.image || placeholder(p)) + '" alt="' + esc(p.name) + '" loading="lazy">' +
      '<div class="card-body"><span class="category">' + esc(p.category) + '</span><h3 class="name">' + esc(p.name) + '</h3>' +
      '<p class="price">' + fmt(p.price) + '</p>' +
      '<a class="order-btn" href="' + orderLink(p) + '" target="_blank" rel="noopener">Order on WhatsApp</a></div></article>').join("");
  }

  // generic "chat with us" links
  document.querySelectorAll("[data-wa]").forEach(a => {
    a.href = waBase + "?text=" + encodeURIComponent("Hello " + SHOP_NAME + ", I have a question.");
    a.target = "_blank"; a.rel = "noopener";
  });

  // ---------- Home: featured products + categories ----------
  const featured = document.getElementById("featured");
  if (featured) {
    const f = products.filter(p => p.featured);
    render(featured, f.length ? f : products.slice(0, 4));
  }
  const cats = document.getElementById("category-tiles");
  if (cats) {
    const names = [...new Set(products.map(p => p.category))];
    cats.innerHTML = names.map(c => {
      const item = products.find(p => p.category === c);
      return '<a class="tile" href="products.html?cat=' + encodeURIComponent(c) + '"><span>' + (item.emoji || "📦") + '</span>' + esc(c) + '</a>';
    }).join("");
  }

  // ---------- Products: filters + search ----------
  const grid = document.getElementById("product-grid");
  if (grid) {
    const bar = document.getElementById("filters"), search = document.getElementById("search");
    const names = ["All", ...new Set(products.map(p => p.category))];
    let cat = new URLSearchParams(location.search).get("cat");
    if (!names.includes(cat)) cat = "All";
    function update() {
      const q = search.value.trim().toLowerCase();
      render(grid, products.filter(p => (cat === "All" || p.category === cat) && p.name.toLowerCase().includes(q)));
      bar.querySelectorAll("button").forEach(b => b.classList.toggle("active", b.textContent === cat));
    }
    names.forEach(n => {
      const b = document.createElement("button");
      b.className = "filter-btn"; b.textContent = n;
      b.addEventListener("click", () => { cat = n; update(); });
      bar.appendChild(b);
    });
    search.addEventListener("input", update);
    update();
  }

  // ---------- Contact: details + message form ----------
  const details = document.getElementById("contact-details");
  if (details) {
    const rows = [["💬", "WhatsApp", "+" + WHATSAPP_NUMBER], ["📞", "Phone", SHOP_INFO.phone], ["📍", "Location", SHOP_INFO.location],
      ["🕒", "Opening hours", SHOP_INFO.hours], ["✉️", "Email", SHOP_INFO.email]].filter(r => r[2]);
    details.innerHTML = rows.map(r => '<li><span>' + r[0] + '</span><div><strong>' + r[1] + '</strong><br>' + esc(r[2]) + '</div></li>').join("");
  }
  const form = document.getElementById("contact-form");
  if (form) form.addEventListener("submit", e => {
    e.preventDefault();
    const d = new FormData(form);
    const msg = "Hello " + SHOP_NAME + ",\nMy name is " + d.get("name") + ".\n\n" + d.get("message");
    window.open(waBase + "?text=" + encodeURIComponent(msg), "_blank", "noopener");
  });
})();
