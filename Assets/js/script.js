//Chart
const weeklySales = [
  { day: "Mon", value: 32 },
  { day: "Tue", value: 40 },
  { day: "Wed", value: 52 },
  { day: "Thu", value: 36 },
  { day: "Fri", value: 60 },
  { day: "Sat", value: 44 }
];
const chartContainer = document.getElementById("salesChart");
weeklySales.forEach(sale => {
  const bar = document.createElement("div");
  bar.className = "flex flex-col items-center flex-shrink-0 w-10 sm:w-14";
  bar.innerHTML = `
    <div class="bg-teal-500 w-full rounded-t-lg" style="height:${sale.value * 4}px"></div>
    <p class="mt-2 text-xs sm:text-sm">${sale.day}</p>
  `;
  chartContainer.appendChild(bar);
});

//download report csv
function downloadCSV() {
  const products = JSON.parse(localStorage.getItem("products")) || [];

  let csv = "SKU,Invoice,Barcode,Name,Category,Stock,Price,GST,MFG,EXP\n";

  products.forEach(p => {
    csv += `${p.sku},${p.invoiceNumber},${p.barcode},${p.name},${p.category},${p.stock},${p.price},${p.gst},${p.mfg},${p.exp}\n`;
  });

  const blob = new Blob([csv], { type: "text/csv" });
  const url = URL.createObjectURL(blob);

  const a = document.createElement("a");
  a.href = url;
  a.download = "products.csv";
  a.click();
}

//download excel
function downloadExcel() {
  const products = JSON.parse(localStorage.getItem("products")) || [];

  const worksheet = XLSX.utils.json_to_sheet(products);
  const workbook = XLSX.utils.book_new();

  XLSX.utils.book_append_sheet(workbook, worksheet, "Products");

  XLSX.writeFile(workbook, "products.xlsx");
}

//download pdf
function downloadPDF() {
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF();

  const products = JSON.parse(localStorage.getItem("products")) || [];

  doc.setFontSize(16);
  doc.text("Product Report", 10, 10);

  let y = 20;

  products.forEach(p => {
    doc.setFontSize(10);
    doc.text(
      `SKU: ${p.sku} | Invoice: ${p.invoiceNumber} | Name: ${p.name} | Category: ${p.category} | Stock: ${p.stock}`,
      10,
      y
    );
    y += 8;
  });

  doc.save("products.pdf");
}


/*
const productForm = document.getElementById("productForm");
const productTableBody = document.getElementById("productTableBody");
const searchInput = document.getElementById("searchInput");

let products = [];

// Add Product

if (productForm) {

  productForm.addEventListener("submit", function (e) {

    e.preventDefault();

    const productName = document.getElementById("productName").value;
    const category = document.getElementById("category").value;
    const quantity = document.getElementById("quantity").value;
    const price = document.getElementById("price").value;
    const manufacturingDate = document.getElementById("manufacturingDate").value;
    const expiryDate = document.getElementById("expiryDate").value;
    const product = {
      id: Date.now(),
      productName,
      category,
      quantity,
      price,
      manufacturingDate,
      expiryDate
    };

    products.push(product);

    displayProducts(products);

    updateDashboard();

    productForm.reset();

  });

}

// Display Products

function displayProducts(productList) {

  if (!productTableBody) return;

  productTableBody.innerHTML = "";

  productList.forEach((product) => {

    const today = new Date();
    const expiry = new Date(product.expiryDate);

    const difference = expiry - today;

    const daysLeft = Math.ceil(
      difference / (1000 * 60 * 60 * 24)
    );
    const status = daysLeft <= 30
      ? '<span class="expiring">Expiring Soon</span>'
      : '<span class="safe">Safe</span>';

    const row = `
      <tr>
        <td>${product.productName}</td>
        <td>${product.category}</td>
        <td>${product.quantity}</td>
        <td>$${product.price}</td>
        <td>${product.manufacturingDate}</td>
        <td>${product.expiryDate}</td>
        <td>${status}</td>
        <td>
          <button
            class="delete-btn"
            onclick="deleteProduct(${product.id})"
          >
            Delete
          </button>
        </td>
      </tr>
    `;
    productTableBody.innerHTML += row;

  });

}

// Delete Product

function deleteProduct(id) {

  products = products.filter((product) => {
    return product.id !== id;
  });

  displayProducts(products);

  updateDashboard();

}
// Search Product

if (searchInput) {

  searchInput.addEventListener("keyup", () => {

    const searchValue = searchInput.value.toLowerCase();

    const filteredProducts = products.filter((product) => {

      return (
        product.productName.toLowerCase().includes(searchValue) ||
        product.category.toLowerCase().includes(searchValue)
      );

    });

    displayProducts(filteredProducts);

  });

}
// Dashboard Update

function updateDashboard() {

  const totalProducts = document.getElementById("totalProducts");
  const lowStock = document.getElementById("lowStock");
  const expiringSoon = document.getElementById("expiringSoon");

  if (totalProducts) {
    totalProducts.innerText = products.length;
  }

  const lowStockProducts = products.filter((product) => {
    return product.quantity < 5;
  });

  if (lowStock) {
    lowStock.innerText = lowStockProducts.length;
  }

  const expiringProducts = products.filter((product) => {

    const today = new Date();
    const expiry = new Date(product.expiryDate);

    const difference = expiry - today;

    const daysLeft = Math.ceil(
      difference / (1000 * 60 * 60 * 24)
    );

    return daysLeft <= 30;

  });

  if (expiringSoon) {
    expiringSoon.innerText = expiringProducts.length;
  }

}*/