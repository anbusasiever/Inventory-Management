let products = [];
let editId = null;

const saved = JSON.parse(localStorage.getItem("products") || "[]");

const categories = JSON.parse(localStorage.getItem("categories")) || [
  "Grocery",
  "Dairy",
  "Beverages",
  "Electronics",
  "Stationery"
];


// Load initial data
fetch("./Assets/js/products.json")
  .then(res => res.json())
  .then(data => {
    products = data;
    localStorage.setItem("products", JSON.stringify(products));
    renderTable(products);
    updateDashboard();
  });

//load categories
function loadCategories() {
  const categorySelect = document.getElementById("pCategory");
  categorySelect.innerHTML = "";

  categories.forEach(cat => {
    const option = document.createElement("option");
    option.value = cat;
    option.textContent = cat;
    categorySelect.appendChild(option);
  });
}

function openCategoryForm() {
  document.getElementById("categoryForm").classList.remove("hidden");
}

function closeCategoryForm() {
  document.getElementById("categoryForm").classList.add("hidden");
}

function saveCategory() {
  const cat = document.getElementById("newCategory").value.trim();
  if (cat === "") return;
  categories.push(cat);
  localStorage.setItem("categories", JSON.stringify(categories));
  loadCategories(); // update dropdown in Add Product form
  closeCategoryForm();
}
// Render Table
function renderTable(list) {
  const table = document.getElementById("productTable");
  table.innerHTML = "";

  list.forEach(p => {
    const sku = generateSKU(p.id);
    const barcode = generateBarcode(p.id);
    const isLowStock = p.stock < 10;
    table.innerHTML += `
      <tr class="border-b ${isLowStock ? 'low-stock-row' : ''}">
        <td class="p-2">${sku}</td>
        <td class="p-2">
          <svg id="barcode-${p.id}"></svg>
        </td>
        <td class="p-2">${p.invoiceNumber || "-"}</td>
        <td class="p-2">${p.name}</td>
        <td class="p-2">${p.category}</td>
        <td class="p-2">${isLowStock 
          ? `<span class="low-stock-badge">${p.stock} (Low)</span>` 
          :p.stock}</td>
        <td class="p-2">₹${p.price}</td>
        <td class="p-2">${p.gst}%</td>
        <td class="p-2">${p.mfg}</td>
        <td class="p-2">${p.exp}</td>
        <td class="p-2">
          <button onclick="editProduct(${p.id})" class="text-blue-600">Edit</button>
          <button onclick="deleteProduct(${p.id})" class="text-red-600 ml-2">Delete</button>
        </td>
      </tr>
    `;
     // ⭐ Generate barcode image
    setTimeout(() => {
      JsBarcode(`#barcode-${p.id}`, barcode, {
        format: "CODE128",
        width: 2,
        height: 40,
        displayValue: true,
        fontSize: 12
      });
    }, 10);
  });
}

//Sort by price
function sortProducts() {
  const sortValue = document.getElementById("sortPrice").value;

  let sorted = [...products];

  if (sortValue === "low") {
    sorted.sort((a, b) => a.price - b.price);
  } 
  else if (sortValue === "high") {
    sorted.sort((a, b) => b.price - a.price);
  }

  renderTable(sorted);
}


// Search
document.getElementById("searchInput").addEventListener("input", searchProducts);

function searchProducts() {
  const search = document.getElementById("searchInput").value.toLowerCase();

  const filtered = products.filter(p => {
    const sku = generateSKU(p.id).toLowerCase();
    const barcode = generateBarcode(p.id).toLowerCase();

    return (
      p.name.toLowerCase().includes(search) ||
      p.category.toLowerCase().includes(search) ||
      sku.includes(search) ||
      barcode.includes(search) ||
      (p.invoiceNumber && p.invoiceNumber.toLowerCase().includes(search)) ||
      String(p.price).includes(search) ||
      String(p.stock).includes(search)
    );
  });

  renderTable(filtered);
}

// Open Form
function openForm() {
  editId = null;
  document.getElementById("formTitle").innerText = "Add Product";
  document.getElementById("productForm").classList.remove("hidden");
  loadCategories();   // ⭐ Load dropdown options
  generateRandomCodes(); // SKU, Invoice, Barcode
}

// Close Form
function closeForm() {
  document.getElementById("productForm").classList.add("hidden");
}

// Save Product
function saveProduct() {
    const mfgDate = new Date(pMfg.value);
    const expDate = new Date(pExp.value);
    const today = new Date();
    // Validate manufacturing date
    if (mfgDate  > today) {
        mfgError.classList.remove("hidden");
        return;
    } else {
        mfgError.classList.add("hidden");
    }
    // Validate expiry date (cannot be before manufacturing date)
    if (expDate  < mfgDate) {
        expError.classList.remove("hidden");
        return;
    } else {
        expError.classList.add("hidden");
    }
  const newProduct = {
    id: editId || Date.now(),
    name: pName.value,
    category: pCategory.value,
    invoiceNumber: pInvoice.value,
    stock: Number(pStock.value),
    price: Number(pPrice.value),
    gst: Number(pGST.value),
    mfg: pMfg.value,
    exp: pExp.value
  };

  if (editId) {
    products = products.map(p => p.id === editId ? newProduct : p);
  } else {
    products.push(newProduct);
  }
  localStorage.setItem("products", JSON.stringify(products));
  renderTable(products);
  updateDashboard();
  closeForm();
}

// Edit Product
function editProduct(id) {
  editId = id;
  const p = products.find(x => x.id === id);

  formTitle.innerText = "Edit Product";
  pName.value = p.name;
  pCategory.value = p.category;
  pInvoice.value = p.invoiceNumber;
  pStock.value = p.stock;
  pPrice.value = p.price;
  pGST.value = p.gst;
  pMfg.value = p.mfg;
  pExp.value = p.exp;

  document.getElementById("productForm").classList.remove("hidden");
}

// Delete Product
function deleteProduct(id) {
  products = products.filter(p => p.id !== id);
  localStorage.setItem("products", JSON.stringify(products));
  renderTable(products);
  updateDashboard();
}
//Event Listeners - Manufacturing Date and Expiry Date
pMfg.addEventListener("input", () => {
  mfgError.classList.add("hidden");
});
pExp.addEventListener("input", () => {
  expError.classList.add("hidden");
});

function updateDashboard() {
  const total = document.getElementById("totalProducts");
  if (!total) return; // skip on products page

  total.textContent = products.length;
  const totalProducts = products.length;
  const today = new Date();

  const inStock = products
    .filter(p => p.stock > 0 && new Date(p.exp) >= today)
    .reduce((sum, p) => sum + p.stock, 0);

  const outOfStock = products.filter(p => {
    const isExpired = new Date(p.exp) < today;
    const isZeroStock = p.stock === 0;
    return isExpired || isZeroStock;
  }).length;

  const totalCategories = new Set(products.map(p => p.category)).size;

  document.getElementById("totalProducts").textContent = totalProducts;
  document.getElementById("inStock").textContent = inStock;
  document.getElementById("outOfStock").textContent = outOfStock;
  document.getElementById("totalCategories").textContent = totalCategories;
  closeForm();
}

//Generate SKU
function generateSKU(id) {
  return "SKU-" + (10000 + (id % 90000));
}
//Geberate Barcode
function generateBarcode(id) {
  return String(100000000000 + (id % 100000000000));
}

//out of stock
function showOutOfStock() {
  const today = new Date();

  const filtered = products.filter(p => {
    const isExpired = new Date(p.exp) < today;
    const isZeroStock = p.stock === 0;
    return isExpired || isZeroStock;
  });

  renderTable(filtered);
}
//low stock
function showLowStock() {
  const today = new Date();

  const filtered = products.filter(p => {
    const isExpired = new Date(p.exp) < today;
    return p.stock < 10 && !isExpired;
  });

  renderTable(filtered);
}
