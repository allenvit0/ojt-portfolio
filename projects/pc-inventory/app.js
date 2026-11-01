// PC Parts Inventory Manager
// Records follow the `parts` table in schema.sql and are saved in localStorage.
var KEY = "pc-inventory-parts";
var SAMPLE = [
  { id: 1, name: "AMD Ryzen 5 5600", category: "Processor", price: 6500, qty: 4, reorder: 2 },
  { id: 2, name: "Kingston Fury 8GB DDR4 3200", category: "Memory", price: 1350, qty: 2, reorder: 5 },
  { id: 3, name: "Samsung 980 1TB NVMe", category: "Storage", price: 3800, qty: 7, reorder: 3 },
  { id: 4, name: "RTX 3060 12GB", category: "Graphics card", price: 17500, qty: 1, reorder: 2 },
  { id: 5, name: "Seasonic 650W 80+ Gold", category: "Power supply", price: 4500, qty: 5, reorder: 2 },
  { id: 6, name: "Logitech G102 Mouse", category: "Peripheral", price: 990, qty: 12, reorder: 4 }
];

var peso = new Intl.NumberFormat("en-PH", { style: "currency", currency: "PHP", maximumFractionDigits: 0 });
var parts = load();
var pendingDelete = null;

function load() {
  try {
    var saved = JSON.parse(localStorage.getItem(KEY));
    if (Array.isArray(saved)) return saved;
  } catch (e) { /* storage unavailable: fall back to sample data */ }
  return SAMPLE.slice();
}

function save() {
  try { localStorage.setItem(KEY, JSON.stringify(parts)); } catch (e) { /* ignore */ }
}

function isLow(p) { return p.qty <= p.reorder; }

function escapeHtml(s) {
  return String(s).replace(/[&<>"']/g, function (c) {
    return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
  });
}

function render() {
  var q = document.getElementById("search").value.trim().toLowerCase();
  var onlyLow = document.getElementById("only-low").checked;
  var list = parts.filter(function (p) {
    var match = (p.name + " " + p.category).toLowerCase().indexOf(q) !== -1;
    return match && (!onlyLow || isLow(p));
  });

  document.getElementById("rows").innerHTML = list.length ? list.map(function (p) {
    var low = isLow(p);
    var confirming = pendingDelete === p.id;
    return '<tr class="' + (low ? "low" : "") + '">' +
      "<td>" + escapeHtml(p.name) + "</td><td>" + escapeHtml(p.category) + "</td>" +
      '<td class="num">' + peso.format(p.price) + '</td><td class="num">' + p.qty + "</td>" +
      '<td><span class="badge ' + (low ? "low" : "ok") + '">' + (low ? "Low stock" : "In stock") + "</span></td>" +
      '<td><div class="row-actions"><button type="button" data-edit="' + p.id + '">Edit</button>' +
      '<button type="button" class="del' + (confirming ? " confirming" : "") + '" data-del="' + p.id + '">' +
      (confirming ? "Confirm delete" : "Delete") + "</button></div></td></tr>";
  }).join("") : '<tr><td colspan="6">No parts match your search.</td></tr>';

  var units = parts.reduce(function (s, p) { return s + p.qty; }, 0);
  var value = parts.reduce(function (s, p) { return s + p.qty * p.price; }, 0);
  document.getElementById("s-items").textContent = parts.length;
  document.getElementById("s-units").textContent = units;
  document.getElementById("s-value").textContent = peso.format(value);
  document.getElementById("s-low").textContent = parts.filter(isLow).length;
}

function resetForm() {
  document.getElementById("form").reset();
  document.getElementById("edit-id").value = "";
  document.getElementById("f-reorder").value = 3;
  document.getElementById("form-title").textContent = "Add a part";
  document.getElementById("save").textContent = "Add part";
  document.getElementById("cancel").hidden = true;
}

document.getElementById("form").addEventListener("submit", function (e) {
  e.preventDefault();
  var data = {
    name: document.getElementById("f-name").value.trim(),
    category: document.getElementById("f-cat").value,
    price: Number(document.getElementById("f-price").value),
    qty: Number(document.getElementById("f-qty").value),
    reorder: Number(document.getElementById("f-reorder").value)
  };
  var editId = Number(document.getElementById("edit-id").value);
  var msg = document.getElementById("msg");

  if (editId) {
    var p = parts.find(function (x) { return x.id === editId; });
    Object.assign(p, data);
    msg.textContent = "Updated " + data.name + ".";
  } else {
    data.id = parts.reduce(function (m, x) { return Math.max(m, x.id); }, 0) + 1;
    parts.push(data);
    msg.textContent = "Added " + data.name + ".";
  }
  save(); resetForm(); render();
});

document.getElementById("cancel").addEventListener("click", resetForm);

document.getElementById("rows").addEventListener("click", function (e) {
  var b = e.target.closest("button");
  if (!b) return;
  if (b.dataset.edit) {
    var p = parts.find(function (x) { return x.id === Number(b.dataset.edit); });
    document.getElementById("edit-id").value = p.id;
    document.getElementById("f-name").value = p.name;
    document.getElementById("f-cat").value = p.category;
    document.getElementById("f-price").value = p.price;
    document.getElementById("f-qty").value = p.qty;
    document.getElementById("f-reorder").value = p.reorder;
    document.getElementById("form-title").textContent = "Edit part";
    document.getElementById("save").textContent = "Save changes";
    document.getElementById("cancel").hidden = false;
    document.getElementById("f-name").focus();
  }
  if (b.dataset.del) {
    var id = Number(b.dataset.del);
    if (pendingDelete === id) {
      var removed = parts.find(function (x) { return x.id === id; });
      parts = parts.filter(function (x) { return x.id !== id; });
      pendingDelete = null;
      document.getElementById("msg").textContent = "Deleted " + removed.name + ".";
      save();
    } else {
      pendingDelete = id; // first click asks for confirmation
    }
    render();
  }
});

document.getElementById("search").addEventListener("input", render);
document.getElementById("only-low").addEventListener("change", render);
render();
