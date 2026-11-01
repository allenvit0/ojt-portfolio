// Kapehan Café Ordering Kiosk
var MENU = [
  { id: 1, cat: "Coffee", name: "Café Americano", note: "Hot or iced", price: 95, color: "#6b3f22" },
  { id: 2, cat: "Coffee", name: "Spanish Latte", note: "Sweetened milk", price: 140, color: "#8a5532" },
  { id: 3, cat: "Coffee", name: "Caramel Macchiato", note: "Vanilla, caramel", price: 150, color: "#a8672f" },
  { id: 4, cat: "Coffee", name: "Barako Brew", note: "Batangas beans", price: 110, color: "#3e2414" },
  { id: 5, cat: "Non-coffee", name: "Matcha Latte", note: "Ceremonial grade", price: 145, color: "#5d8a3a" },
  { id: 6, cat: "Non-coffee", name: "Ube Milk", note: "Real ube halaya", price: 130, color: "#6d4a9b" },
  { id: 7, cat: "Non-coffee", name: "Calamansi Cooler", note: "Fresh, iced", price: 90, color: "#c7a21c" },
  { id: 8, cat: "Pastries", name: "Ensaymada", note: "Butter & cheese", price: 65, color: "#d49a4b" },
  { id: 9, cat: "Pastries", name: "Pandesal Trio", note: "With kesong puti", price: 75, color: "#b8763a" },
  { id: 10, cat: "Pastries", name: "Banana Loaf", note: "Per slice", price: 70, color: "#9c6a2c" }
];

var CATS = ["All", "Coffee", "Non-coffee", "Pastries"];
var peso = new Intl.NumberFormat("en-PH", { style: "currency", currency: "PHP", maximumFractionDigits: 0 });
var cart = {}; // id -> quantity
var activeCat = "All";

var tabsEl = document.getElementById("tabs");
var gridEl = document.getElementById("grid");
var cartEl = document.getElementById("cart");

function renderTabs() {
  tabsEl.innerHTML = CATS.map(function (c) {
    return '<button type="button" data-cat="' + c + '" aria-pressed="' + (c === activeCat) + '">' + c + "</button>";
  }).join("");
}

function renderGrid() {
  var items = MENU.filter(function (m) { return activeCat === "All" || m.cat === activeCat; });
  gridEl.innerHTML = items.map(function (m) {
    return '<button type="button" class="item" data-id="' + m.id + '" aria-label="Add ' + m.name + '">' +
      '<span class="swatch" style="background:' + m.color + '">' + m.name.charAt(0) + "</span>" +
      "<strong>" + m.name + "</strong><small>" + m.note + '</small><span class="price">' + peso.format(m.price) + "</span></button>";
  }).join("");
}

function renderCart() {
  var ids = Object.keys(cart);
  var count = 0, total = 0;
  cartEl.innerHTML = ids.map(function (id) {
    var m = MENU.find(function (x) { return x.id === Number(id); });
    var q = cart[id];
    count += q; total += q * m.price;
    return '<li><span class="name">' + m.name + '</span>' +
      '<span class="qty"><button type="button" data-dec="' + id + '" aria-label="Remove one ' + m.name + '">−</button>' +
      "<span>" + q + '</span><button type="button" data-inc="' + id + '" aria-label="Add one ' + m.name + '">+</button></span>' +
      '<span class="line">' + peso.format(q * m.price) + "</span></li>";
  }).join("");
  document.getElementById("empty").hidden = ids.length > 0;
  document.getElementById("count").textContent = count;
  document.getElementById("total").textContent = peso.format(total);
  document.getElementById("place").disabled = ids.length === 0;
}

tabsEl.addEventListener("click", function (e) {
  var b = e.target.closest("button");
  if (!b) return;
  activeCat = b.dataset.cat;
  renderTabs(); renderGrid();
});

gridEl.addEventListener("click", function (e) {
  var b = e.target.closest(".item");
  if (!b) return;
  cart[b.dataset.id] = (cart[b.dataset.id] || 0) + 1;
  document.getElementById("confirm").hidden = true;
  renderCart();
});

cartEl.addEventListener("click", function (e) {
  var b = e.target.closest("button");
  if (!b) return;
  if (b.dataset.inc) cart[b.dataset.inc]++;
  if (b.dataset.dec) {
    cart[b.dataset.dec]--;
    if (cart[b.dataset.dec] <= 0) delete cart[b.dataset.dec];
  }
  renderCart();
});

document.getElementById("place").addEventListener("click", function () {
  var number = Math.floor(100 + Math.random() * 900);
  var msg = document.getElementById("confirm");
  msg.textContent = "Order #" + number + " placed. Please pay " + document.getElementById("total").textContent + " at the counter.";
  msg.hidden = false;
  cart = {};
  renderCart();
  msg.hidden = false;
});

// Start with a sample order so the screen shows how the cart works.
cart = { 2: 1, 8: 2 };
renderTabs(); renderGrid(); renderCart();
